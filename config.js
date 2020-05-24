const dotenv = require('dotenv');
dotenv.config();

const config = {
  webhook: {
      "endpoint": "/webhook",
      "verify_token": process.env.VERIFY_TOKEN,
      "port": process.env.PORT,
      //"app_secret": "APP_SECRET"
  },
  client: {
      "page_token": process.env.PAGE_ACCESS_TOKEN
  },
  fba: {
        "app_id": "592321544732876",
        "page_id": "105107701219098"
  },
  survey_type: "CSAT", // Can be 'NPS' or 'CSAT'
  customer_service_app_id: "592321544732876" // 263902037430900 is the default Facebook page inbox
};

module.exports = config;