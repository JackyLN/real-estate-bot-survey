'use strict';

const request = require("request"),
  config = require("../config");

class GraphAPI {

  static callSendAPI(requestBody) {
    // Send the HTTP request to the Messenger Platform
    request(
      {
        uri: `${config.platform}/me/messages`,
        qs: {
          access_token: config.graph.token
        },
        method: "POST",
        json: requestBody
      }, (err, res, body) => {
        if(!err) {
          //console.log('message sent!');
        } else {
          console.log("Unable to send message: " + err);
        }
      }
    );
  }

  static async getUserProfile(senderPsid) {
    try {
      const userProfile = await this.callUserProfileAPI(senderPsid);
      
      for (const key in userProfile) {
        const camelizedKey = camelCase(key);
        const value = userProfile[key];
        delete userProfile[key];
        userProfile[camelizedKey] = value;
      }

      return userProfile;
    } catch (err) {
      console.log("Fetch failed:", err);
    }
  }

  static callUserProfileAPI(senderPsid) {
    return new Promise(function(resolve, reject) {
      let body = [];

      // Send the HTTP request to the Graph API
      request({
        uri: `${config.platform}/${senderPsid}`,
        qs: {
          access_token: config.pageAccesToken,
          fields: "first_name, last_name, gender, locale, timezone"
        },
        method: "GET"
      })
        .on("response", function(response) {
          // console.log(response.statusCode);

          if (response.statusCode !== 200) {
            reject(Error(response.statusCode));
            console.log(response);
          }
        })
        .on("data", function(chunk) {
          body.push(chunk);
        })
        .on("error", function(error) {
          console.error("Unable to fetch profile:" + error);
          reject(Error("Network Error"));
        })
        .on("end", () => {
          body = Buffer.concat(body).toString();
          // console.log(JSON.parse(body));

          resolve(JSON.parse(body));
        });
    });
  }  
}

module.exports = GraphAPI;
