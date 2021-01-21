var fs = require("fs");
process.on('uncaughtException', function(er) {
    sails.log("--------------- " + sails.config.siteName + " error -----------------");
    sails.log(er.stack);

    var message = {
        to: sails.config.mail.to.email,
        subject: sails.config.siteName + " Error",
        html: '<p>' + er.stack + '</p>'
    };

    Mailer.sendMail(message, function(err, result) {
        process.exit(1);
    });

});
// fs.readFile('somefile.txt', function(err, data) {
//     if (err) {
//         sails.log(err);
//         throw err;
//     }
//     sails.log("data", data);
// });