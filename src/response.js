'use strict';

const list = require('./json/surveylist.json');

class Response {
  static genNuxMessage(user) {
    let welcome = this.genTextWithInput(list.get_started.welcome, user.firstName);

    let guide = this.genQuickReply(list.get_started.guidance, [
      {
        title: list.get_started.startsurvey,
        payload: list.payload.startsurvey
      },
      {
        title: list.get_started.help,
        payload: list.payload.help
      }
    ]);

    return [welcome, guide];
  }

  static genQuickReply(text, quickReplies) {
    let response = {
      text: text,
      quick_replies: []
    };

    for (let quickReply of quickReplies) {
      response["quick_replies"].push({
        content_type: "text",
        title: quickReply["title"],
        payload: quickReply["payload"]
      });
    }

    console.log(response);
    return response;
  }

  static genText(text) {
    let response = {
      text: text
    };

    return response;
  }

  static genTextWithInput(text, input) {
    const regex = /{{input}}/g;
    let response = {
      text: text.replace(regex, input)
    }
    console.log(response);
    return response;
  }
  
  static genTextWithPersona(text, persona_id) {
    let response = {
      text: text,
      persona_id: persona_id
    };

    return response;
  }

}

module.exports = Response;