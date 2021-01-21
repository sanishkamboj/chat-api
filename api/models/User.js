/**
 * User.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
var moment = require("moment");
var cc = require("currency-codes");

module.exports = {
  autosubscribe: ["destroy", "update"],

  attributes: {
    firstname: {
      type: "string",
      defaultsTo: "",
    },
    lastname: {
      type: "string",
      defaultsTo: "",
    },
    email: {
      type: "string",
      defaultsTo: "",
    },
    mobilenumber: {
      type: "string",
      required: true,
      unique: true,
    },
    userfbid: {
      type: "string",
      defaultsTo: "",
    },
    dateofbirth: {
      type: "datetime",
    },
    profileimage: {
      type: "string",
      defaultsTo: "",
    },
    thumbimage: {
      type: "string",
      defaultsTo: "",
    },
    defaultimage: {
      type: "string",
      defaultsTo: "1",
    },
    displayname: {
      type: "string",
    },
    address: {
      type: "string",
      defaultsTo: "",
    },
    city: {
      type: "string",
      defaultsTo: "",
    },
    country: {
      type: "string",
      defaultsTo: "",
    },
    currencycode: {
      type: "string",
      defaultsTo: "",
    },
    currencydisplay: {
      type: "string",
      defaultsTo: "",
    },
    userbio: {
      type: "string",
      defaultsTo: "",
    },
    devicetoken: {
      type: "string",
      defaultsTo: "",
    },
    voiptoken: {
      type: "string",
      defaultsTo: "",
    },
    userdevice: {
      type: "string",
      enum: ["iphone", "android"],
      defaultsTo: "iphone",
    },
    gender: {
      type: "string",
      enum: ["male", "female"],
      defaultsTo: "male",
    },
    isverified: {
      type: "boolean",
      defaultsTo: false,
    },
    isdeleted: {
      type: "boolean",
      defaultsTo: false,
    },
    userstatus: {
      type: "string",
      enum: ["online", "busy", "offline"],
      defaultsTo: "online",
    },
    verificationdate: {
      type: "datetime",
    },
    verificationcode: {
      type: "string",
    },
    interestedin: {
      type: "string",
      defaultsTo: "",
    },
    job: {
      type: "string",
      defaultsTo: "",
    },
    userlanguage: {
      type: "string",
      defaultsTo: "",
    },
    languagecode: {
      type: "string",
      defaultsTo: "",
    },
    socketid: {
      type: "string",
      defaultsTo: "",
    },
    endpointArn: {
      type: "string",
      defaultsTo: "",
    },
    contacts: {
      collection: "contact",
      via: "userid",
    },
    memberrequests: {
      collection: "memberrequest",
      via: "userid",
    },
    groups: {
      collection: "usergroup",
      via: "users",
      dominant: true,
    },
    isvalidmobile: {
      type: "boolean",
      defaultsTo: true,
    },
    spamstatus: {
      type: "string",
      enum: ["notblock", "24hourblock", "permanentblock"],
      defaultsTo: "notblock",
    },
    languageid: {
      type: "integer",
    },

    fullName: function() {
      return _.compact([_.capitalize(this.firstname), _.capitalize(this.lastname)]).join(" ");
    },
    toJSON: function() {
      var user = this.toObject();
      delete user.verificationdate;
      delete user._csrf;
      return user;
    },
  },

  sendVerificationCode: function(user, cb) {
    var self = this;
    sails.log("send veriffication code", user);
    var message =
      "Your Verification code for Unni is " +
      user.verificationcode +
      ", Click here to verify " +
      sails.config.url.appURL +
      "/verificationlink/" +
      user.verificationcode;
    smsService.sendVerificaionCode(
      {
        to: user.mobilenumber,
        message: message,
      },
      function(err, users) {
        if (err) {
          return cb(err);
        }
        cb();
      }
    );
  },
  callforReVerificationCode: function(user, cb) {
    var self = this;
    sails.log("send veriffication code", user);
    smsService.callforReVerificationCode(
      {
        to: user.mobilenumber,
        code: user.verificationcode,
      },
      function(err, users) {
        if (err) {
          return cb(err);
        }
        cb();
      }
    );
  },
  generateVerificationCode: function(user, cb) {
    var updateData = {};
    sails.log("generate veriffication code");
    verificationcode = Math.floor(Math.random() * 8999 + 1000);
    updateData["verificationcode"] = verificationcode;
    User.update(
      {
        id: user.id,
      },
      {
        verificationcode: parseInt(verificationcode),
      }
    ).exec(function afterwards(err, userData) {
      if (err) {
        return cb(err);
      }
      sails.log("generate veriffication code");
      cb(err, userData);
    });
  },
  sendReVerificationCode: function(user, cb) {
    var message =
      "Your Verification code for Unni is " +
      user.verificationcode +
      ", Click here to verify " +
      sails.config.url.appURL +
      "/verificationlink/" +
      user.verificationcode;
    smsService.sendVerificaionCode(
      {
        to: user.mobilenumber,
        message: message,
      },
      function(err, users) {
        if (err) {
          return cb(err);
        }
        cb();
      }
    );
  },
  sendPushnotification: function(user, cb) {
    var message =
      "Your Verification code for Unni is " +
      user.verificationcode +
      ", Click here to verify " +
      sails.config.url.appURL +
      "/verificationlink/" +
      user.verificationcode;

    var UserArn = sails.config.AWSArn.developmentAndroid;
    var pushMessage = "Hello test notification";
    var devicetoken = "";
    var endPointArn = "";

    // pushService.sendPushNotification({ to: user.mobilenumber, message: message }, function (err, users) {
    //     if (err) { return res.serverError(err); }
    cb();
    // });
  },
  beforeCreate: function(values, cb) {
    console.log("Before create for user", values);
    if (values.country && values.currencycode) {
      var getSymbol = require("currency-symbol-map");
      console.log(getSymbol(values.currencycode));
      console.log(cc.code(values.currencycode));

      var currencysymbol = getSymbol(values.currencycode);
      var currencydetail = cc.code(values.currencycode);
      var stringCurrency = _
        .compact([_.capitalize(currencydetail.currency), "(", _.capitalize(currencydetail.code), currencysymbol, ")"])
        .join(" ");

      values.currencydisplay = stringCurrency;
      cb();
    } else {
      cb();
    }
  },
  beforeUpdate: function(createdUser, cb) {
    sails.log("Before update Created user : ", createdUser);
    if (createdUser.firstname && createdUser.lastname) {
      createdUser.displayname = _
        .compact([_.capitalize(createdUser.firstname), _.capitalize(createdUser.lastname)])
        .join(" ");
    }
    if (createdUser.country && createdUser.currencycode) {
      var getSymbol = require("currency-symbol-map");
      console.log(getSymbol(createdUser.currencycode));
      console.log(cc.code(createdUser.currencycode));

      var currencysymbol = getSymbol(createdUser.currencycode);
      var currencydetail = cc.code(createdUser.currencycode);
      var stringCurrency = _
        .compact([_.capitalize(currencydetail.currency), "(", _.capitalize(currencydetail.code), currencysymbol, ")"])
        .join(" ");

      createdUser.currencydisplay = stringCurrency;
    }
    cb();
  },
  afterCreate: function(createduser, cb) {
    sails.log("after create Created User 1: ", createduser);
    if (!createduser) {
      return cb();
    }
    sails.log("After create Created User 2: ", createduser.id);

    async.series(
      [
        function(usersettingCb) {
          var reqDataGUL = {};
          reqDataGUL.userid = createduser.id;

          UserSettings.create(reqDataGUL).exec(function(err, newGUL) {
            if (err) {
              sails.log("groupuserlocatecreate error");
              return usersettingCb();
            }
            usersettingCb();
          });
        },
        function(contactfriendcb) {
          var query =
            "UPDATE `contact` SET `userid`= " + createduser.id + " WHERE `contactnumber` = " + createduser.mobilenumber;
          Contact.query(query, [], function(err, contacts) {
            if (err) {
              return contactfriendcb(err);
            }
            contactfriendcb();
          });
        },
      ],
      function(err, finalresult) {
        if (err) cb();
        else cb();
      }
    );
  },
};
