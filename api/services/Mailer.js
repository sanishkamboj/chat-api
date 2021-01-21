/**
 * Node Mailer service and setup
 */

var sails = require("sails");

var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var ses = require('nodemailer-ses-transport');
// module.exports = nodemailer.createTransport('smtps://ankurgarach4%40gmail.com:garachankur4@smtp.gmail.com');


if (sails.config.mode === 'development' || sails.config.mode === 'staging') {
    // create reusable transporter object using the default SMTP transport
    // module.exports = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: sails.config.mail.useremail,
    //         pass: sails.config.mail.password
    //     }
    // });

    module.exports = nodemailer.createTransport(ses({
		accessKeyId: sails.config.aws.accessKeyId,
		secretAccessKey: sails.config.aws.secretAccessKey,
		region:sails.config.aws.region
    }));

} else if (sails.config.mode === 'production') {

    // module.exports = nodemailer.createTransport(smtpTransport({
    //     host: 'smtp.teemplayers.com',
    //     port: 587,

    //     auth: {
    //         user: sails.config.mail.useremail,
    //         pass: sails.config.mail.password
    //     },
    //     tls: {
    //         rejectUnauthorized: false
    //     }
    // }));
    module.exports = nodemailer.createTransport(ses({
		accessKeyId: sails.config.aws.accessKeyId,
		secretAccessKey: sails.config.aws.secretAccessKey,
		region:sails.config.aws.region
	}));
}

// require("email-templates")(sails.config.paths.views + '/email', function(err, template) {

//     if (err)
//         sails.log.warn(err);

//     Mailer.template = template;

// });