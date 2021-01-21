/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */
var AWS = require("aws-sdk");

module.exports = {
  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  models: {
    // connection: 'localMysqlServer'     //local
    connection: "liveMysqlServer", // 22
    // connection: 'productionMysqlServer'  // production
  },
  siteName: "Connect Sails Developement",

  mail: {
    useremail: "ankurgarach4@gmail.com",
    password: "garach@4",
    from: {
      name: "Connect_Sails",
      email: "ankurgarach4@gmail.com",
    },
    to: {
      name: "Nilesh Kikani",
      email: "nilesh@logisticinfotech.com",
    },
  },
  aws: {
    accessKeyId: "",
    secretAccessKey: "",
    region: "us-west-2",
  },
 
  /****** Connect Twilio ******/
  twilioSid: "",
  twilioauthToken: "",
  twiliomobilenumber: "",

  /****** Connect AWS key ******/

 
  AWSConfig: AWS.config.update({
    accessKeyId: "",
    secretAccessKey: "",
    region: "us-west-2",
  }),

  AWSSNS: new AWS.SNS(),

  url: {
    appURL: "http://192.168.0.8:1337",
    applicationURL: "http://192.168.0.8:1337",
  },

  AWSArn: {
    //AndroidArn: "arn:aws:sns:us-west-2:173552633359:app/GCM/Unni_Playstore",
    AndroidArn: "arn:aws:sns:us-west-2:173552633359:app/GCM/Connect_dev_Android",
    //iOSArn: "arn:aws:sns:us-west-2:173552633359:app/APNS_VOIP/Unni_Production"
    iOSArn: "arn:aws:sns:us-west-2:173552633359:app/APNS_VOIP_SANDBOX/Unni_Voip",
    //iOSArn: "arn:aws:sns:us-west-2:173552633359:app/APNS_VOIP/Unni_Production",
  },

  mode: "development",

  log: {
    level: "verbose",
  },
};
