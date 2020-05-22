'use strict';

class WebhookServices {
  constructor (webhook_event, access_token) {
    this._webhook_event = webhook_event;
    this.sender_psid = webhook_event.sender.id;
    this.access_token = access_token;
    this.request = require('request');
    this.SurveyServices = require('./SurveyServices');
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
    if (message.text != "Get Started") {
      response = {
        "text": `Incorrect command, please type "Get Started" to start doing survey!`
      }
      this.callSendAPI(id, response, this.access_token);
    } else {
      response = {
        "text": `Hello there, thanks for your time, let's start doing a short survey!`
      }
      this.callSendAPI(id, response, this.access_token);

      // let surveyServices = new this.SurveyServices(this.sender_psid, this.access_token);
      // surveyServices.question_no = 1;
  
      // surveyServices.start();
    }
  }

  handlePostback() {

  }

  callSendAPI(id, response, access_token) { 
    console.log('inside callSendAPI SurveyService');
    const PAGE_ACCESS_TOKEN = access_token;
    let request_body = {
      "recipient": {
        "id": id
      },
      "message": response
    }
  
    // Send the HTTP request to the Messenger Platform
    this.request({
      "uri": "https://graph.facebook.com/v7.0/me/messages",
      "qs": { "access_token": PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
        console.log(res);
      } else {
        console.error("Unable to send message:" + err);
      }
    }); 
  }
}

module.exports = WebhookServices;