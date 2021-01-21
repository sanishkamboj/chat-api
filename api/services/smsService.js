var twilio = require('twilio');
var moment = require("moment");

module.exports = {

    sendVerificaionCode: function (inputs, done) {
		var clientCheck = twilio(sails.config.twilioSid, sails.config.twilioauthToken).lookups.v1;
        var client = twilio(sails.config.twilioSid, sails.config.twilioauthToken);

        sails.log('SMS Sender message body:', inputs.message);

		var isValid=clientCheck.phoneNumbers(inputs.to).fetch()
		    .then(numberData =>{
			
			client.messages.create({
				to: inputs.to,
				from: sails.config.twiliomobilenumber,
				body: inputs.message
			}, function (err, message) {
				if (err) {
					sails.log("Twilio sms sending error", err.message);
					 done(err);
				}
	
				//sails.log("Twilio sms sending message", message);
				 done();
			});
		} , err => done({message:sails.config.localised.commonvalidation.moiblenumberisinvalid}));
		

        // var client = require('twilio')(sails.config.twilioSid, sails.config.twilioauthToken);

        // sails.log('SMS Sender message body:', inputs.message);

        // client.messages.create({
        //     to: inputs.to,
        //     from: sails.config.twiliomobilenumber,
        //     body: inputs.message
        // }, function (err, message) {
        //     if (err) {
        //         sails.log("Twilio sms sending error", err.message);
        //         return done(err);
        //     }

        //     //sails.log("Twilio sms sending message", message);
        //     return done();
        // });

        // client = TwilioRestClient(sails.config.twilioSid, sails.config.twilioauthToken)

        // client.calls.create({
        //     from: sails.config.twiliomobilenumber,
        //     to: inputs.to,
        //     url: "http://139.59.8.197:1337/twiliovoicecode/123456"
        // }, function (err, call) {
        //     // process.stdout.write(call);
        //     if (err)
        //         sails.log("twilio call error", err);
        //     return done();
        // });
    },
    callforReVerificationCode: function (inputs, done) {

                var client = require('twilio')(sails.config.twilioSid, sails.config.twilioauthToken);

                sails.log('SMS Sender message body:', inputs.code);

                // client.messages.create({
                //     to: inputs.to,
                //     from: sails.config.twiliomobilenumber,
                //     body: inputs.message
                // }, function (err, message) {
                //     if (err) {
                //         sails.log("Twilio sms sending error", err.message);
                //         return done(err);
                //     }

                //     sails.log("Twilio sms sending message", message);
                //     return done();
                // });

                // client = TwilioRestClient(sails.config.twilioSid, sails.config.twilioauthToken)

                client.calls.create({
                    from: sails.config.twiliomobilenumber,
                    to: inputs.to,
                    // url: "http://139.59.8.197:1337/twiliovoicecode/"+inputs.code //Connect Digital Ocean
                    url: "http://52.14.191.63:1337/twiliovoicecode/"+inputs.code // Connect AWS
                }, function (err, call) {
                    // process.stdout.write(call);
                    if (err)
                        sails.log("twilio call error", err);
                    return done();
                });
            },

    sendInvitation: function (inputs, done) {

        var client = require('twilio')(sails.config.twilioSid, sails.config.twilioauthToken);

        sails.log('SMS Sender message body:', inputs.message);

        client.messages.create({
            to: inputs.to,
            from: sails.config.twiliomobilenumber,
            body: inputs.message
        }, function (err, message) {
            if (err)
                sails.log(err);
            return done();
        });
    }
};