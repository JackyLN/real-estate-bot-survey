'use strict';

const list = require("./json/surveylist.json"),
  Response = require("./response"),
  Survey = require("./survey"),
  GraphApi = require("./graphapi");

class Receive {
  constructor(user, webhookEvent) {
    this.user = user;
    this.webhookEvent = webhookEvent;
  }


  handleMessage() {
    let event = this.webhookEvent;
    let responses;

    try {
      if (event.message) {
        let message = event.message;

        if (message.quick_reply) {
          responses = this.handleQuickReply();
        } else if (message.attachments) {
          responses = this.handleAttachmentMessage();
        } else if (message.text) {
          console.log(responses);
          responses = this.handleTextMessage();
        }
      } else if (event.postback) {
        responses = this.handlePostback();
      } else if (event.referral) {
        responses = this.handleReferral();
      }
    } catch (error) {
      console.error(error);
      responses = {
        text: `An error has occured: '${error}'. We have been notified and \
        will fix the issue shortly!`
      };
    }

    if (Array.isArray(responses)) {
      let delay = 0;
      for (let response of responses) {
        this.sendMessage(response, delay * 2000);
        delay++;
      }
    } else {
      this.sendMessage(responses);
    }
  }

  handleTextMessage() {

    console.log(
      "Received text:",
      `${this.webhookEvent.message.text} for ${this.user.psid}`
    );

    // check greeting is here and is confident
    let greeting = this.firstEntity(this.webhookEvent.message.nlp, "greetings");

    let message = this.webhookEvent.message.text.trim().toLowerCase();

    let response;

    if ((greeting && greeting.confidence > 0.8) || message.includes("start over")) {
      response = Response.genNuxMessage(this.user);
    } else {
      response = [
        Response.genTextWithInput(list.fallback.any, this.webhookEvent.message.text),

        Response.genQuickReply(list.get_started.guidance, [
          {
            title: list.get_started.startsurvey,
            payload: list.payload.startsurvey
          },
          {
            title: list.get_started.help,
            payload: list.payload.help
          }
        ])
      ];
    }

    return response;
  }

  handleQuickReply() {
     // Get the payload of the quick reply
     let payload = this.webhookEvent.message.quick_reply.payload;

     return this.handlePayload(payload);
  }

  handleAttachmentMessage() {
    //TODO
  }

  handlePostback() {
    //TODO
  }

  handleReferral() {
    //TODO
  }

  firstEntity(nlp, name) {
    return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
  }

  handlePayload(payload) {
    let response;

    if (payload === list.payload.help) {
      response = list.asnwer.helpagent;
    }
    else if (payload === list.payload.startsurvey || payload.includes("SURVEY")) {
      response = Survey.handlePayload(payload);
    }
    else {
      response = {
        text: `This is a default postback message for payload: ${payload}!`
      };
    }

    return response;
  }

  sendMessage(response, delay = 0) {
    // Check if there is delay in the response
    if ("delay" in response) {
      delay = response["delay"];
      delete response["delay"];
    }

    // Construct the message body
    let requestBody = {
      recipient: {
        id: this.user.psid
      },
      message: response
    };

    // Check if there is persona id in the response
    if ("persona_id" in response) {
      let persona_id = response["persona_id"];
      delete response["persona_id"];

      requestBody = {
        recipient: {
          id: this.user.psid
        },
        message: response,
        persona_id: persona_id
      };
    }

    setTimeout(() => GraphApi.callSendAPI(requestBody), delay);
  }
}

module.exports = Receive;