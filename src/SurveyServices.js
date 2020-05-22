'use strict';


class SurveyServices {
  constructor(sender_psid, access_token) {
    this._question_no = 1;
    this.sender_psid = sender_psid;
    this.access_token = access_token;
    this.list = require('./SurveyList');
    this.request = require('request');
  }

  get question_no() {
    return this._question_no;
  }

  set question_no(value) {
    this._question_no = value;
  }

  start() {
    console.log('inside start SurveyService');
    if (this._question_no != 0 && this._question_no < this.list.length) {
      this.callSendAPI(this.sender_psid, this.list[this._question_no - 1], this.access_token);
    }
  }

  callSendAPI(id, response, access_token) { 
    console.log('inside start callSendAPI');
    const PAGE_ACCESS_TOKEN = access_token;
    let request_body = {
      "recipient": {
        "id": id
      },
      "messaging_type": "RESPONSE",
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
        console.log(res);
      } else {
        console.error("Unable to send message:" + err);
      }
    }); 
  }
}

module.exports = SurveyServices;