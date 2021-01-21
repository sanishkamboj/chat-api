/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */
var AWS = require('aws-sdk');

module.exports = {

    /***************************************************************************
     * Set the default database connection for models in the production        *
     * environment (see config/connections.js and config/models.js )           *
     ***************************************************************************/

    models: {
        connection: 'productionMysqlServerAWS' // production_AWS
    },

    siteName: "Unni Sails",
    /***************************************************************************
     * Set the port in the production environment to 80                        *
     ***************************************************************************/

    // port: 80,

    /***************************************************************************
     * Set the log level in production environment to "silent"                 *
     ***************************************************************************/

    log: {
      level: "verbose"
    },

    mail: {
        useremail: 'ankurgarach4@gmail.com',
        password: 'garach@4',
        from: {
            name: "Connect_Sails",
            email: "ankurgarach4@gmail.com"
        },
        to: {
            name: "Nilesh Kikani",
            email: "nilesh@logisticinfotech.com"
        }
    },
    aws:{
		accessKeyId:"AKIAIAQI5D47TVF2OZ7Q",
		secretAccessKey:"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",
		region:"us-west-2"
	},

    /****** Connect Twilio ******/
    twilioSid: 'AC239e0c79a9bb9cc5d6f0fae6b99b21de',
    twilioauthToken: '071d1d2b2db3be5c4c3b82b56d38d2df',
    twiliomobilenumber: '+12134938567',

    /****** Connect AWS key ******/

    AWSConfig: AWS.config.update({
        accessKeyId: 'AKIAIAQI5D47TVF2OZ7Q',
        secretAccessKey: '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',
        region: 'us-west-2'
    }),

    AWSSNS: new AWS.SNS(),

    url: {
        appURL: "http://52.14.191.63:1337",
        applicationURL: "http://unniapp.com/",
    },

    AWSArn: {
        AndroidArn: "arn:aws:sns:us-west-2:173552633359:app/GCM/Unni_Playstore",
        // iOSArn: "arn:aws:sns:us-west-2:173552633359:app/APNS_VOIP/Unni_Production"
        iOSArn: "arn:aws:sns:us-west-2:173552633359:app/APNS/Unni_Pro"
    },

    mode: "production",

    log: {
        level: 'silent'
    },
};
