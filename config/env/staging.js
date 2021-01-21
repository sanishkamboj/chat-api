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

var AWS = require('aws-sdk');

module.exports = {

    /***************************************************************************
     * Set the default database connection for models in the development       *
     * environment (see config/connections.js and config/models.js )           *
     ***************************************************************************/

    models: {
        connection: 'stagingMysqlServerAWS' // production_AWS
    },
    siteName: "Connect Sails Staging",

    mail: {
        useremail: 'ankurgarach4@gmail.com',
        password: 'garach@4',
        from: {
            name: "Connect_Sails_staging",
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
    /****** Hood twilio ******/
    // twilioSid: 'AC3ab15b8a2ec65785e01b190b56852f62',
    // twilioauthToken: 'ca3385ee1e9c2c830d425f58bae13a7e',
    // twiliomobilenumber: '+17865098772',

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

    AWSSNS:new AWS.SNS(),

    url: {
        appURL: "http://13.58.98.30:1337",
        applicationURL: "http://13.58.98.30/",
    },

    AWSArn: {
        AndroidArn: "arn:aws:sns:us-west-2:173552633359:app/GCM/Unni_Playstore",
        // iOSArn: "arn:aws:sns:us-west-2:173552633359:app/APNS_VOIP/Unni_Production"
        iOSArn: "arn:aws:sns:us-west-2:173552633359:app/APNS_VOIP_SANDBOX/Unni_Voip",
    },

    log: {
        level: 'verbose'
    },

    mode: "staging",
};
