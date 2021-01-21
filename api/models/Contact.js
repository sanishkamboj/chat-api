/**
 * Contact.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        contactname: {
            type: 'string',
            defaultsTo: ""
        },
        userid: {
            model: 'user'
        },
        contactnumber: {
            type: 'string',
            defaultsTo: ""
        },
        contactemail: {
            type: 'string',
            defaultsTo: ""
        },
        isinvited: {
            type: "boolean",
            defaultsTo: false
        },
        contactuserid: {
            type: 'string',
            defaultsTo: ""
        }
    },
    sendInvitation: function (contact, userid, cb) {
        var self = this;
        sails.log("send Invitation called", userid);

        User.findOne({
            id: userid
        }).exec(function (err, user) {
            if (err) {
                sails.log('Createcontact error "%s"', err);
                return cb();
            }
            if (!user) {
                return cb();
            }
            else {
                sails.log("user id ", user.fullName());

                // var message = user.fullName() + " had invite you to use this app, to download app Click here to verify " + sails.config.url.applicationURL;

                var message = "Download Unni chat, the first messenger that translates text so you can talk to anyone, anywhere. " + sails.config.url.applicationURL;

                smsService.sendInvitation({ to: contact.contactnumber, message: message }, function (err, users) {
                    if (err) {
                        return cb(err);;
                    }
                    cb();
                });
            }
        });
    },

    beforeCreate: function (createdContact, cb) {
        sails.log("beforeCreate contact : ", createdContact);

        User.findOne({
            mobilenumber: createdContact.contactnumber
        }).exec(function (err, user) {
            if (err) {
                sails.log('Createcontact error "%s"', err);
                return cb();
            }
            if (!user) {
                sails.log("user not exist for mobile number ", createdContact.contactnumber);
                return cb();
            }
            else {
                sails.log("user exist for mobile number ", createdContact.contactnumber);
                sails.log("user id ", user.fullName());
                createdContact.userid = user.id;
            }
            cb();
        });
    },
};