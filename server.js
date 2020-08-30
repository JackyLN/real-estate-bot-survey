'use strict';

// Imports dependencies and set up http server
const
  logger = require('./winston'),
  express = require('express'),
  bodyParser = require('body-parser'),
  path = require('path'),
  config = require('./config'),
  User = require('./src/model/user'),
  Receive = require('./src/receive'),
  GraphApi = require("./src/graphapi"),
  app = express().use(bodyParser.json()); // creates express http server

let users = {};
//app policy
app.get('/policy', function (req, res) {
  res.sendFile(path.join(__dirname + '/policy.html'));
})

// Creates the endpoint for our webhook 
app.post("/webhook", (req, res) => {
  let body = req.body;
  // Checks if this is an event from a page subscription
  if (body.object === "page") {
    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      if ("changes" in entry) {
        // Handle Page Changes event
        let receiveMessage = new Receive();
        if (entry.changes[0].field === "feed") {
          let change = entry.changes[0].value;
          switch (change.item) {
            case "post":
              return receiveMessage.handlePrivateReply(
                "post_id",
                change.post_id
              );
              break;
            case "comment":
              return receiveMessage.handlePrivateReply(
                "commentgity _id",
                change.comment_id
              );
              break;
            default:
              console.log('Unsupported feed change type.');
              return;
          }
        }
      }

      // Gets the body of the webhook event
      let webhookEvent = entry.messaging[0];
      // console.log(webhookEvent);

      // Discard uninteresting events
      if ("read" in webhookEvent) {
        // console.log("Got a read event");
        return;
      }

      if ("delivery" in webhookEvent) {
        // console.log("Got a delivery event");
        return;
      }
      console.log(webhookEvent);

      // Get the sender PSID
      let senderPsid = webhookEvent.sender.id;      
      logger.info("Webhook event from PSID:" + senderPsid);

      if (!(senderPsid in users)) {
        let user = new User(senderPsid);
        GraphApi.getUserProfile(senderPsid)
        .then(userProfile => {
          user.setProfile(userProfile);
        }).catch(error => {
          // The profile is unavailable
          console.log("Profile is unavailable:", error);
        }).finally(() => {
          let receiveMessage = new Receive(users[senderPsid], webhookEvent);
          return receiveMessage.handleMessage();
        });
      } else {
        //user existed
        let receiveMessage = new Receive(users[senderPsid], webhookEvent);
        return receiveMessage.handleMessage();
      }

      //let defaultUser = new User(senderPsid);
      //defaultUser.setDefault();
      //let receiveMessage = new Receive(defaultUser, webhookEvent);
    });
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === config.webhook.verify_token) {

      // Responds with the challenge token from the request
      //console.log('WEBHOOK_VERIFIED');
      //
      logger.info('WEBHOOK_VERIFIED');

      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

app.use(express.static('logs'));
// Sets server port and logs message on success
app.listen(config.webhook.PORT || 1335, () => {
  logger.info('webhook is listening')
  console.log('webhook is listening')
});