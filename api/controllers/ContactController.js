/**
 * ContactController
 *
 * @description :: Server-side logic for managing contacts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  addContacts: function (req, res) {

      var userid = req.param("userid");
      if (!userid)
          return res.badRequest({
              data: "",
              message: sails.config.localised.commonvalidation.useridrequired
          });

      var contacts = req.param("contacts");
      var reqData = eval(req.body);
      var userlist;
      var user;

      async.series([
          function (createjoccb) {
              Jobs.create('saveContacts', {
                  contacts: contacts,
                  userid: userid
              }).save(function (err) {
                  if (err)
                      return createjoccb();
                  createjoccb();
              });

              // async.eachSeries(contacts, function (contact, cb)
              // {
              //     sails.log("Contact being created: ", contact);
              //     contact['contactuserid'] = userid;

              //     var contactdata = {};
              //     contactdata['contactnumber'] = contact;
              //     contactdata['contactuserid'] = userid;

              //     Contact.updateOrCreate({ contactnumber: contact, contactuserid: userid }, contactdata)
              //         .then((createdContact) => {
              //             cb();
              //         })
              //         .catch(sails.log.error);
              // }, function (err) {
              //   createjoccb();
              // });
          },
          function (findfriendscb) {
              sails.log("Contact save contacts ", contacts);
              var query = 'SELECT user.* FROM user'+
              ' JOIN contact ON contact.userid=user.id'+
              ' WHERE contact.contactuserid='+userid;
              sails.log("Contact save Query ", query);
              User.query(query, [], function (err, userList) {
                  if (err) {
                      return findfriendscb(err);
                  }
                  userlist = userList;
                  findfriendscb();
              });

          }],
          function (err, finalresult) {
              if (err) {
                  sails.log("Contact save error", err);
                  res.serverError({ message: sails.config.localised.responses.servererror });
              }
              else
                  res.send({ message: sails.config.localised.contacts.contactaddsuccess, userid: userid, data: userlist });
          }
      );
  },

  getContacts: function (req, res) {

      var userid = req.param("userid");
      if (!userid)
          return res.badRequest({
              data: "",
              message: sails.config.localised.commonvalidation.useridrequired
          });

      Contact.find(
          { contactuserid: userid }
      ).populateAll().exec(function (err, objContact) {
          if (err) {
              updatecode(null, '');
          }
          res.send({ message: sails.config.localised.contacts.contactfetchsuccess, data: objContact, userid: userid });
      });
  },

  inviteContacts: function (req, res) {

      var userid = req.param("userid");
      if (!userid)
          return res.badRequest({
              data: "",
              message: sails.config.localised.commonvalidation.useridrequired
          });

      var contacts = req.param("contacts");
      async.eachSeries(contacts, function (contact, cb) {
          var contactdata = {};
          contactdata['contactuserid'] = userid;
          contactdata['contactnumber'] = contact;
          contactdata['isinvited'] = true;

          Contact.updateOrCreate({ contactnumber: contact, contactuserid: userid }, contactdata)
              .then((createdContact) => {
                  sails.log.info(`User with id ${createdContact.id} is active!`);

                  Jobs.create('sendInviteSMS', {
                      contact: createdContact,
                      userid: userid
                  }).save(function (err) {
                      if (err)
                          return cb();
                      cb();
                  });
              })
              .catch(sails.log.error);
      }, function (err) {
          res.send({ message: sails.config.localised.contacts.invitesuccess });
      });
  },
};
