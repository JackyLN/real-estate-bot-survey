'use strict';

class WebhookServices {
  constructor (webhook_event, access_token) {
    this._webhook_event = webhook_event;
    this.sender_psid = webhook_event.sender.id;
    this.access_token = access_token;
    this.request = require('request');
  }

  set webhook_event(value) {
    this._webhook_event = value;
  } 

  start() {
    if (this._webhook_event.message) {
      this.handleMessage(this.sender_psid, this._webhook_event.message);        
    } else if (this._webhook_event.postback) {
      //this.handlePostback(this.sender_psid, this._webhook_event.postback);
    }
  }

  handleMessage(id, message) {
    let response;
    if (message != "Get Started") {
      response = {
        "text": `Incorrect command, please type "Get Started" to start doing survey!`
      }
    } else {
      response = {
        "text": `Hello there, thanks for your time, let's start doing a short survey!`
      }
    }

    this.callSendAPI(id, response);
  }

  handlePostback() {

  }

  callSendAPI(id, response, access_token) {
    const PAGE_ACCESS_TOKEN = access_token;
    let request_body = {
      "recipient": {
        "id": id
      },
      "message": response
    }
  
    // Send the HTTP request to the Messenger Platform
    this.request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    }); 
  }
}

module.exports = WebhookServices;