
// var AWS = require('aws-sdk');


module.exports = {

    saveUserContacts: function (inputs, done) {

        sails.log("Contact listing", inputs.contacts);

        var contacts = inputs.contacts.split(',');

        async.eachSeries(contacts, function (contact, cb) {
            sails.log("Contact being created: ", contact);
            contact['contactuserid'] = inputs.userid;

            var contactdata = {};
            contactdata['contactnumber'] = contact;
            contactdata['contactuserid'] = inputs.userid;

            Contact.updateOrCreate({ contactnumber: contact, contactuserid: inputs.userid }, contactdata)
                .then((createdContact) => {
                    cb();
                })
                .catch(sails.log.error);
        }, function (err) {
            done();
        });
    }
};