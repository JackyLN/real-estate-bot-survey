'use strict';

const list = require('./json/surveylist.json'),
  Response = require('./response');

class VIS {

  static handleWelcome() {
    let response;
    response = Response.genText(list.vis.welcome);
  }

  static handleCategory() {
    let response;

    response = Response.genGenericCarousel(list.VIS.payload.elements);

    return response;
  }

  static handlePayload(payload) {
    let response;

    //FIRST QUESTION
    if (payload === list.payload.startsurvey) {
      let answer = list.surveydetails[0].replies;
      response = Response.genQuickReply(list.surveydetails[0].text,
        answer
      );
    }
    //THE REST
    else if (payload.includes("SURVEY")) {

      let surveydetails = list.surveydetails;

      let question = payload.split("_")[1];
      let temp = surveydetails.filter((v) => {
        return v.payload === question;
      });

      if (temp[0].nextpayload) {
        let nextquestion = surveydetails.filter((v) => {
          return v.payload === temp[0].nextpayload;
        });

        let answer = nextquestion[0].replies;
        response = Response.genQuickReply(nextquestion[0].text,
          answer
        );
      }
      else {
        //END
        response = Response.genText(list.fallback.end);
      }
    }

    return response;
  }
}

module.exports = VIS;