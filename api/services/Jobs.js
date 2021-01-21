/**
 * Kue job queue holder
 *
 * Queue will be loaded into this object in bootstrap.js
 */
module.exports = {
    _processors: {
        sendInviteSMS: function (job, cb) {
            if (!job.data.contact)
                return cb(new Error("Contact not provided"));

            sails.log("Contact number to send invite", job.data.contact.contactnumber);
            var contact = job.data.contact;
            var userid = job.data.userid;
            // var contactmodel = new Contact._model(job.data.contact);

            Contact.sendInvitation(contact, userid, function (err) {
                sails.log("Job gets called", job.data.contact);
                cb();
            });
        },
        sendVerificationSMS: function (job, cb) {
            if (!job.data.user) {
                sails.log("send SMS in jobs");
                return cb(new Error("User not provided"));
            }

            sails.log("Contact number to send verification code", job.data.user.mobilenumber);
            var user = new User._model(job.data.user);
            User.sendVerificationCode(user, function (err) {
                cb(err);
            });
        },
        sendReVerificationSMS: function (job, cb) {
            if (!job.data.user)
                return cb(new Error("User not provided"));

            var user = new User._model(job.data.user);
            User.sendReVerificationCode(job.data.user, function (err) {
                cb(err);
            });
        },
        sendChatNotification: function (job, cb) {
            if (!job.data.payload)
                return cb(new Error("Payload not provided"));

            var payloadData = job.data.payload;

            pushService.sendPushNotification({ payloadData: payloadData }, function (err) {
                if (err) {
                    sails.log("Sails error ", err);
                    return cb(err);
                }

                cb();
            });
        },
        saveContacts: function (job, cb) {

            sails.log("Save contacts for ", job.data.userid);

            if (!job.data.userid)
                return cb(new Error("User not provided"));
            contactsService.saveUserContacts({ contacts: job.data.contacts, userid: job.data.userid }, function (err) {
                if (err) {
                    sails.log("Sails error");
                    return cb(err);
                }
                sails.log("Contacts saved");
                cb();
            });
        },
    }
}
