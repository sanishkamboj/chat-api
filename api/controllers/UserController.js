/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var moment = require("moment");
var fs = require("fs");
var skipper = require("skipper");
var AWS = require("aws-sdk");
var gm = require("gm");
var rimraf = require("rimraf");

module.exports = {
  userMobileVerification: function(req, res) {
    var mobile = req.param("mobileno");

    if (!mobile)
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.mobilnumberrequired,
      });

    var verificationcode;
    var isexistingUser = false;
    var user, userUpdate;

    async.series(
      [
        function(checkUserCb) {
          User.findOrCreate(
            {
              mobilenumber: mobile,
            },
            {
              mobilenumber: mobile,
              country: req.param("country"),
              currencycode: req.param("currencycode"),
            }
          ).exec(function(err, objUser, wasCreatedOrFound) {
            if (err) {
              return res.serverError({
                message: sails.config.localised.responses.servererror,
                err,
              });
            }
            user = objUser;
            checkUserCb(null, "");
          });
        },
        function(updatecode) {
          User.generateVerificationCode(user, function(err, objUser) {
            if (err) return updatecode(err);
            user = objUser[0];
            updatecode();
          });
        },
        function(createjob) {
          User.sendVerificationCode(user, function(err) {
            sails.log("service error", err);
            if (err) {
              mobileError = err;
              User.update(
                {
                  id: user.id,
                },
                {
                  isvalidmobile: false,
                }
              ).exec(function(errs, result) {
                userUpdate = result[0];
                createjob();
                return;
              });
            } else createjob();
          });
        },
        function(deleteuserCb) {
          if (!userUpdate) {
            deleteuserCb();
            return;
          }
          User.destroy({
            id: userUpdate.id,
          }).exec(function(err, result) {
            return deleteuserCb(mobileError);
          });
        },
      ],
      function(err, finalresult) {
        if (err)
          res.serverError({
            message: err.message,
          });
        else
          res.send({
            message: sails.config.localised.user.verificationcodesent,
          });
      }
    );
  },

  verifyCode: function(req, res) {
    var mobile = req.param("mobileno");
    var verificationcode = req.param("verificationcode");

    if (!mobile)
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.mobilnumberrequired,
      });

    if (!verificationcode)
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.verificationcoderequired,
      });

    var reqData = {};
    sails.log("UserMobileVerification");

    User.find({
      mobilenumber: mobile,
      verificationcode: verificationcode,
    }).exec(function(err, user) {
      if (err) {
        sails.log('UserMobileVerification "%s"', err);
        return res.serverError({
          message: sails.config.localised.responses.somethingwentwrong,
          err,
        });
      }

      sails.log("User data", user);

      if (typeof user != "undefined" && user.length > 0) {
        reqData["isverified"] = true;

        User.update(
          {
            id: user[0].id,
          },
          reqData
        ).exec(function afterwards(err, userData) {
          if (err) {
            res.serverError({
              message: sails.config.localised.responses.somethingwentwrong,
              err,
            });
          }
          res.send({
            data: userData[0],
            token: jwToken.issue({
              id: userData[0].id,
            }),
            message: sails.config.localised.user.verificationsucess,
          });
        });
      } else {
        res.send({
          data: {},
          message: sails.config.localised.user.wrongVerificationcode,
        });
      }
    });
  },

  resendVerifyCode: function(req, res) {
    var mobile = req.param("mobileno");
    var callortext = req.param("callortext");

    if (!mobile)
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.mobilnumberrequired,
      });

    var reqData = {};

    User.find({
      mobilenumber: mobile,
    })
      .limit(1)
      .exec(function(err, user) {
        if (err) {
          sails.log('UserMobileVerification "%s"', err);
          return res.serverError({
            message: sails.config.localised.responses.somethingwentwrong,
            err,
          });
        }
        if (typeof user != "undefined" && user.length > 0) {
          if (callortext == "text") {
            Jobs.create("sendReVerificationSMS", {
              user: user[0],
            }).save(function(err) {
              if (err)
                return res.serverError({
                  message: sails.config.localised.responses.somethingwentwrong,
                  err,
                });
              res.send({
                message: sails.config.localised.user.resenterificationcode,
              });
            });
          } else {
            console.log("user data for call", user[0]);
            User.callforReVerificationCode(user[0], function(err) {
              sails.log("service error", err);
              if (err)
                return res.serverError({
                  message: sails.config.localised.responses.somethingwentwrong,
                  err,
                });
              res.send({
                message: sails.config.localised.user.resenterificationcode,
              });
            });
          }
        } else {
          return res.serverError({
            message: sails.config.localised.user.usernotexist,
          });
        }
      });
  },

  profileUpdate: function(req, res) {
    var userid = req.param("userid");

    if (!userid)
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.useridrequired,
      });

    var devicetoken = req.param("voiptoken");
    var reqData = eval(req.body);

    delete reqData.userid;

    var folderPath = sails.config.paths.public;
    var imagePath = "/upload/" + userid + "/profile";
    var UserImagePath = "";
    var newfilename = "";
    var objUser;

    async.series(
      [
        function(saveimagecb) {
          if (req._fileparser.upstreams.length) {
            newfilename =
              moment()
                .utc()
                .unix() +
              "_" +
              req.file("profile")._files[0].stream.filename;
            newthumbfilename =
              moment()
                .utc()
                .unix() +
              "_thumb_" +
              req.file("profile")._files[0].stream.filename;

            User.find(userid)
              .limit(1)
              .exec(function(err, result) {
                if (err)
                  return res.serverError({
                    message: sails.config.localised.responses.somethingwentwrong,
                    err,
                  });

                if (typeof result != "undefined" && result.length > 0) {
                  req.file("profile").upload(
                    {
                      maxBytes: 10000000,
                      saveAs: newfilename,
                      dirname: folderPath + imagePath,
                    },
                    function whenDone(err, uploadedFiles) {
                      if (err) {
                        return saveimagecb(err);
                      }

                      if (uploadedFiles.length === 0) {
                        // return res.badRequest('No file was uploaded');
                      } else {
                        //console.log("user data", result);
                        reqData["profileimage"] = imagePath + "/" + newfilename;
                        var imageuploadedPath = sails.config.paths.public + imagePath + "/" + newfilename;
                        var imgthumb = sails.config.paths.public + imagePath + "/" + newthumbfilename;
                        reqData["thumbimage"] = imagePath + "/" + newthumbfilename;

                        gm(imageuploadedPath)
                          .resize(sails.config.const.imageratio.width, sails.config.const.imageratio.height, "^")
                          .gravity("Center")
                          .crop("214", "214")
                          .write(imgthumb, function(err) {});

                        // REMOVE IMAGES
                        // if (result) {
                        //   fs.unlink(folderPath + result[0].profileimage, function(err) {
                        //     if (err) sails.log(err);
                        //   });
                        //   fs.unlink(folderPath + result[0].thumbimage, function(err) {
                        //     if (err) sails.log(err);
                        //   });
                        // }
                      }
                      saveimagecb();
                    }
                  );
                } else {
                  var error = new Error({
                    message: sails.config.localised.user.usernotexist,
                  });
                  error.status = 500;
                  return saveimagecb(err);
                }
              });
          } else {
            req.file("profile").upload({
              noop: true,
            });
            saveimagecb();
          }
        },
        function(checkforarncb) {
          sails.log("Checking for ARN ", devicetoken);
          if (devicetoken) {
            var sns = sails.config.AWSSNS;

            sails.log("notificaion Arn ");

            var AWSArn = "";

            if (req.param("userdevice") == "iphone") {
              AWSArn = sails.config.AWSArn.iOSArn;
            } else {
              AWSArn = sails.config.AWSArn.AndroidArn;
            }

            sns.createPlatformEndpoint(
              {
                PlatformApplicationArn: AWSArn,
                Token: devicetoken
              },
              function(err, data) {
                if (err) {
                  console.log("Create endpoint error : ", err.stack);
                  return checkforarncb(err);
                }
                reqData["endpointArn"] = data.EndpointArn;
                checkforarncb();
              }
            );
          } else {
            sails.log("checkforarncb else called");
            checkforarncb();
          }
        },
        function(profileHistoryCb) {
          if (req._fileparser.upstreams.length == 0) {
            profileHistoryCb();
            return;
          }
          var hisory = {
            userid: userid,
            profileimage: reqData["profileimage"],
            thumbimage: reqData["thumbimage"],
          };
          ProfileHistory.create(hisory).exec(function(err, result) {
            profileHistoryCb();
          });
        },
        function(languageidCb) {
          if (!reqData.languagecode) {
            languageidCb();
            return;
          }
          Languages.find()
            .where({ languagecode: reqData.languagecode })
            .exec(function(err, result) {
              // console.log("language", result[0].id);
              if (typeof result != "undefined") reqData.languageid = result[0].id;

              languageidCb();
            });
        },
        function(updateusercb) {
          User.update(
            {
              id: userid,
            },
            reqData
          ).exec(function afterwards(err, userData) {
            if (err) {
              sails.log("Update error : ", err);
              updateusercb(err);
            }

            if (typeof userData != "undefined" && userData.length > 0) {
              objUser = userData[0];

              if (reqData.firstname || reqData.lastname) {
                sails.log("User name changed");
                User.publishUpdate(userid, {
                  actions: "userdetail",
                  actionsdata: objUser,
                });
              }

              if (reqData.profileimage || reqData.defaultimage) {
                sails.log("User profile changed");
                User.publishUpdate(userid, {
                  actions: "userdetail",
                  actionsdata: objUser,
                });
              }

              updateusercb();
            } else {
              sails.log("user undefined");
              var error = new Error({
                message: sails.config.localised.user.usernotexist,
              });
              error.status = 500;
              updateusercb(error);
            }
          });
        },
      ],
      function(err, finalresult) {
        if (err)
          res.serverError({
            message: err.message,
          });
        else
          res.send({
            data: objUser,
            message: sails.config.localised.user.userupdatesucess,
          });
      }
    );
  },

  createUser: function(req, res) {
    var params = eval(req.body);
    var username = req.param("username");

    sails.log("CreateUser username = " + req.param("username"));

    User.create({
      username: username,
    }).exec(function(err, newUser) {
      if (err) {
        return res.serverError({
          message: sails.config.localised.responses.somethingwentwrong,
          err,
        });
      }
      res.send({
        data: newUser[0],
        message: sails.config.localised.user.usercreated,
      });
    });
  },

  getUsers: function(req, res) {
    
    var userData = {};
      async.series(
        [
          //Getting all users from the DB
          function(getAllUsers){
            User.find().exec(function afterwards(err, users) {
              
              if (err) {
                return res.serverError({
                  message: sails.config.localised.responses.somethingwentwrong,
                  err,
                });
              } 
              userData = users;
              getAllUsers();
            });
            
            
          },
          //adding settings of each user to its object
          function(usersetcb){
            var ctr = 0; //count the foreach loop
            userData.forEach(function(arr, index){
              var userID = arr['id'];
              UserSettings.find(userID).exec(function afterwards(err, rData){
                //console.log(rData[0].onlinestatus);
                userData[index]['onlinestatus'] = rData[0].onlinestatus;
                userData[index]['seenstatus'] = rData[0].seenstatus;
                userData[index]['lastseen'] = rData[0].lastseen;
                userData[index]['showyourphoto'] = rData[0].showyourphoto;
                
                ctr++;

              if (ctr === userData.length) {
                usersetcb();
              }
              });
              
            });
            
            
          }
        ],
        //return the result
        function(err){
          res.send({
            data: userData,
            message: sails.config.localised.user.userlist,
          });
        }

      ); 
  },

  getUser: function(req, res) {
    var userid = req.param("userid");
    var requesteruserid = req.param("requesteruserid");
    var flag = req.param("flag");

    if (!userid)
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.useridrequired,
      });

    User.find(userid).exec(function afterwards(err, user) {
      if (err) {
        return res.serverError({
          message: sails.config.localised.responses.somethingwentwrong,
          err,
        });
      }

      if (typeof user != "undefined" && user.length > 0) {
        sails.log("user update");

        //To get user settings 
        UserSettings.find(userid).exec(function afterwards(err, rData){
          //console.log(rData[0].onlinestatus);
          user[0]['onlinestatus'] = rData[0].onlinestatus;
          user[0]['seenstatus'] = rData[0].seenstatus;
          user[0]['lastseen'] = rData[0].lastseen;
          user[0]['showyourphoto'] = rData[0].showyourphoto;

          //console.log(user[0]);
          if (requesteruserid && flag) {
            User.message(requesteruserid, {
              actions: "userdetail",
              actionsdata: user[0],
              userflag: flag,
            });
          } else if (requesteruserid) {
            User.message(requesteruserid, {
              actions: "userdetail",
              actionsdata: user[0],
            });
          } 
  
          res.send({
            data: user[0],
            message: sails.config.localised.user.userdetail,
          });
        });
        
        
      } else {
        sails.log("user undefined");
        var error = new Error({
          message: sails.config.localised.user.usernotexist,
        });
        error.status = 500;
        return res.serverError({
          message: sails.config.localised.responses.somethingwentwrong,
          err,
        });
      }
    });
  },

  verificationLink: function(req, res) {
    var verificationcode = req.param("verificationcode");
    var url = "connect://verification/" + verificationcode;
    res.redirect(url);
  },

  updateUserStatus: function(req, res) {
    var userid = req.param("userid");
    sails.log("updateUserStatus");
    if (!userid)
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.useridrequired,
      });

    var reqData = eval(req.body);
    var socketId = sails.sockets.getId(req.socket);
    var updatedUser;
    var sentmessagecount = 0;
    var isSocketFind = false;

    reqData.socketid = socketId;

    delete reqData.userid;
    var userStatus;
    var chatAll;
    async.series(
      [
        function(findconnectCb) {
          UserSockets.count({ socket_id: socketId }).exec(function(err, result) {
            if (result > 0) isSocketFind = true;
            findconnectCb();
          });
        },
        function(connectCb) {
          if (isSocketFind == true) {
            connectCb();
            return;
          }
          var reqData = {
            user_id: userid,
            socket_id: socketId,
          };
          sails.log("connectCb", reqData);
          UserSockets.create(reqData).exec(function(err, result) {
            connectCb();
          });
        },
        function(deleteSpamCb) {
          Spam.count({ touserid: userid }).exec(function(err, result) {
            if (result >= sails.config.const.spam24 && result < sails.config.const.spampermanent) {
              var query =
                "DELETE  FROM `spam` WHERE touserid=" +
                userid +
                " AND createdAt BETWEEN (CURDATE() - INTERVAL 1 DAY) AND CURDATE()ORDER BY createdAt DESC";
              Spam.query(query, [], function(err, delResult) {
                deleteSpamCb();
              });
            } else deleteSpamCb();
          });
        },
        function(spamCb) {
          Spam.count({ touserid: userid }).exec(function(err, result) {
            sails.log("result count", result);
            if (result >= sails.config.const.spam24 && result < sails.config.const.spampermanent)
              reqData["spamstatus"] = "24hourblock";
            else if (result >= sails.config.const.spampermanent) reqData["spamstatus"] = "permanentblock";
            else reqData["spamstatus"] = "notblock";

            sails.log("reqData", reqData);
            spamCb();
          });
        },
        function(updateusercb) {
          User.update(
            {
              id: userid,
            },
            reqData
          ).exec(function afterwards(err, user) {
            if (err) {
              return updateusercb(err);
            }

            if (typeof user != "undefined" && user.length > 0) {
              sails.log("User exist");
              if (req.isSocket) {
                updatedUser = user[0];
                User.subscribe(req, _.pluck(user, "id"), ["message", "update"]);

                setTimeout(function() {
                  User.publishUpdate(userid, {
                    actions: "userstatusupdate",
                    actionsdata: updatedUser,
                  });
                  updateusercb();
                }, 1000);
              } else {
                console.log("user update", user);
                var updateUserStatus = user[0].spamstatus;
                var mediaTitle;
                if (userStatus.spamstatus == updateUserStatus) {
                  updateusercb();
                  return;
                }
                if (updateUserStatus == "notblock") mediaTitle = "Your account is unblocked";
                else if (updateUserStatus == "24hourblock") mediaTitle = "Your account is blocked for 24 hours";
                else mediaTitle = "Your account is permanently blocked";

                var fromusername = userStatus.firstname + " " + userStatus.lastname;
                var mediadata = {};
                mediadata["mediatitle"] = mediaTitle;
                mediadata["sender"] = fromusername;
                mediadata["spamstatus"] = updateUserStatus;
                mediadata["actions"] = "userstatusupdate";

                pushService.createPushJob(
                  {
                    user: user[0],
                    mediadata: mediadata,
                  },
                  function(err) {
                    if (err) {
                      sails.log("Sails error");
                      return updateusercb();
                    }
                    updateusercb();
                  }
                );
              }
            } else {
              sails.log("User not found");
              var error = new Error({
                message: sails.config.localised.user.usernotexist,
              });
              error.status = 500;
              updateusercb(error);
            }
          });
        },
        function(subscribecb) {
          var query =
            "SELECT * FROM user WHERE FIND_IN_SET(id, (SELECT GROUP_CONCAT(userid) FROM `contact` WHERE contactuserid = " +
            userid +
            " AND userid IS NOT NULL))";
          User.query(query, [], function(err, users) {
            if (err) {
              subscribecb(err);
            }
            // sails.log("user list", users);
            if (typeof users != "undefined" && users.length > 0) {
              if (req.isSocket) {
                User.subscribe(req, _.pluck(users, "id"), ["destroy", "update"]);
              }
            }
            subscribecb();
          });
        },
        function(subscribegroupcb) {
          var query =
            "SELECT * FROM usergroup WHERE FIND_IN_SET(id, (SELECT GROUP_CONCAT(`usergroup_users`) FROM `user_groups__usergroup_users` WHERE `user_groups` = " +
            userid +
            " ))";
          UserGroup.query(query, [], function(err, groups) {
            if (err) {
              subscribegroupcb(err);
            }
            if (typeof groups != "undefined" && groups.length > 0) {
              if (req.isSocket) {
                UserGroup.subscribe(req, _.pluck(groups, "id"), [
                  "message",
                  "destroy",
                  "update",
                  "add:users",
                  "remove:users",
                ]);
              }
            }
            subscribegroupcb();
          });
        },
        function(unsentmessagecountscb) {
          var query;
          query =
            "SELECT  COUNT(*) as chatcounts " +
            " FROM ( " +
            " SELECT distinct id FROM  `chat` WHERE ((`fromuser` = " +
            userid +
            " OR `touser` = " +
            userid +
            ') AND `messagestatus`= "sent" AND `chattype` = "normalchat") ' +
            " UNION " +
            " SELECT distinct id FROM  `chat` WHERE (`fromuser` != " +
            userid +
            " AND `touser` = " +
            userid +
            ' AND `messagestatus`= "sent" and `chattype` = "groupchat") ' +
            " UNION " +
            " SELECT distinct id FROM  `chat` WHERE (`fromuser` = " +
            userid +
            " AND `touser` = " +
            userid +
            ' AND `messagestatus`= "sent" and `chattype` = "groupchat") ' +
            " ) as chatids";

          // sails.log("Chat fetch query ", query);

          Chat.query(query, [], function(err, chats) {
            if (err) {
              sails.log(err);
              return unsentmessagecountscb(err);
            }
            if (typeof chats != "undefined" && chats.length > 0) {
              sails.log("chat object counts ", chats[0].chatcounts);
              sentmessagecount = chats[0].chatcounts;
              setTimeout(unsentmessagecountscb, 2000);
            } else {
              sentmessagecount = chats[0].chatcounts;
              return unsentmessagecountscb();
            }
          });
        },
        function(chatCb) {
          query =
            "SELECT  * " +
            " FROM ( " +
            " SELECT * FROM  `chat` WHERE ((`fromuser` = " +
            userid +
            " OR `touser` = " +
            userid +
            ') AND `messagestatus`= "sent" AND `chattype` = "normalchat") ' +
            " UNION " +
            " SELECT * FROM  `chat` WHERE (`fromuser` != " +
            userid +
            " AND `touser` = " +
            userid +
            ' AND `messagestatus`= "sent" and `chattype` = "groupchat") ' +
            " UNION " +
            " SELECT * FROM  `chat` WHERE (`fromuser` = " +
            userid +
            " AND `touser` = " +
            userid +
            ' AND `messagestatus`= "sent" and `chattype` = "groupchat") ' +
            " ) as chatids ORDER BY `chatids`.`id` ASC ";

          sails.log("Chat fetch query ", query);

          Chat.query(query, [], function(err, chats) {
            if (err) {
              sails.log(err);
              return chatCb(err);
            }
            if (typeof chats != "undefined" && chats.length > 0) {
              chatAll = JSON.parse(JSON.stringify(chats));
            }
            chatCb();
          });
        },
        function(chathistoryfetchcb) {
          var count = 1;
          var noofitem = 10;
          var lastIndexArr = 10;
          var pages = Math.ceil(sentmessagecount / noofitem);
          // sails.log("pages",pages);
          //  sails.log("chatAll==>",chatAll);
          async.during(
            function(callback) {
              return callback(null, count <= pages);
            },
            function(callback) {
              if (typeof chatAll != "undefined") {
                sails.log("chatAll==>", chatAll.length);
                sails.log("noofitem", noofitem);
                sails.log("lastIndexArr", lastIndexArr);
                var offset = (count - 1) * noofitem;
                sails.log("offset", offset);
                var chats = chatAll.slice(offset, lastIndexArr);
                sails.log("chats", chats);
                count++;
                lastIndexArr = lastIndexArr + 10;
                User.message(userid, {
                  actions: "chathistory",
                  actionsdata: chats,
                });
              }
              setTimeout(callback, 1000);
              // var query;
              // query = 'SELECT  * ' +
              //   ' FROM ( ' +
              //   ' SELECT * FROM  `chat` WHERE ((`fromuser` = ' + userid + ' OR `touser` = ' + userid + ') AND `messagestatus`= "sent" AND `chattype` = "normalchat") ' +
              //   ' UNION ' +
              //   ' SELECT * FROM  `chat` WHERE (`fromuser` != ' + userid + ' AND `touser` = ' + userid + ' AND `messagestatus`= "sent" and `chattype` = "groupchat") ' +
              //   ' UNION ' +
              //   ' SELECT * FROM  `chat` WHERE (`fromuser` = ' + userid + ' AND `touser` = ' + userid + ' AND `messagestatus`= "sent" and `chattype` = "groupchat") ' +
              //   ' ) as chatids ORDER BY `chatids`.`id` ASC LIMIT ' + offset + ',' + noofitem;;

              // sails.log("Chat fetch query ", query);

              // Chat.query(query, [], function (err, chats) {
              //   if (err) {
              //     sails.log(err);
              //     return callback(err);
              //   }
              //   if (typeof chats != "undefined" && chats.length > 0) {
              //     User.message(userid, {
              //       actions: 'chathistory',
              //       actionsdata: chats
              //     });
              //   }
              //   setTimeout(callback, 1000);
              // });
            },
            function(err) {
              // 5 seconds have passed
            }
          );
          chathistoryfetchcb();
        },
      ],
      function(err, finalresult) {
        if (err)
          res.serverError({
            message: sails.config.localised.responses.somethingwentwrong,
            err,
          });
        else
          res.send({
            data: updatedUser,
            message: sails.config.localised.user.userupdatesucess,
          });
      }
    );
  },

  getOnlineUsers: function(req, res) {
    var userid = req.param("userid");

    if (!userid)
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.useridrequired,
      });

    User.find({
      userstatus: "online",
    }).exec(function afterwards(err, users) {
      if (err) {
        return res.serverError({
          message: sails.config.localised.responses.somethingwentwrong,
          err,
        });
      }

      if (req.isSocket) {
        User.subscribe(req, _.pluck(users, "id"), ["destroy", "update"]);
      }
      res.send({
        data: users,
        message: sails.config.localised.user.userlist,
      });
    });
  },

  blockUser: function(req, res) {
    var blockeduserid = req.param("blockeduserid");
    var userid = req.param("userid");

    if (!blockeduserid) {
      sails.log("User id not set");
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.useridrequired,
      });
    }

    if (!userid) {
      sails.log("User id not set");
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.useridrequired,
      });
    }

    var userobject, blockeduser;
    var isblocked = false;

    async.series(
      [
        function(blockusercb) {
          BlockUser.find({
            blockeduserid: blockeduserid,
            userid: userid,
          }).exec(function(err, objBlockUser) {
            if (err) {
              return blockusercb(err);
            }

            if (typeof objBlockUser != "undefined" && objBlockUser.length > 0) {
              BlockUser.destroy({
                id: objBlockUser[0].id,
              }).exec(function(err, destroyedobj) {
                if (err) {
                  return blockusercb(err);
                }
                blockusercb();
              });
            } else {
              BlockUser.create({
                blockeduserid: blockeduserid,
                userid: userid,
              }).exec(function(err, newmodel) {
                if (err) {
                  return blockusercb(err);
                }
                if (newmodel) {
                  isblocked = true;
                  blockusercb();
                }
              });
            }
          });
        },
        function(usercb) {
          User.find(userid).exec(function afterwards(err, users) {
            if (err) {
              usercb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
            }
            if (typeof users != "undefined" && users.length > 0) {
              user = users[0];

              if (!user.socketid) {
                if (!user.devicetoken) {
                  sails.log("token not found");
                  return usercb();
                }

                var mediadata = {};
                mediadata["mediatitle"] = "";
                mediadata["sender"] = userid;
                mediadata["blockeduserid"] = blockeduserid;
                mediadata["actions"] = "userblock";

                if (isblocked) mediadata["kind"] = "userblocked";
                else mediadata["kind"] = "userunblocked";

                pushService.createPushJob(
                  {
                    user: user,
                    mediadata: mediadata,
                  },
                  function(err) {
                    if (err) {
                      sails.log("Sails error");
                      return usercb(err);
                    }
                    usercb();
                  }
                );
              } else {
                var kinds;
                if (isblocked) kinds = "blocked";
                else kinds = "unblocked";

                User.message(userid, {
                  actions: "userblock",
                  actionsdata: {
                    userid: userid,
                    blockeduserid: blockeduserid,
                    kind: kinds,
                  },
                });
                usercb();
              }
            } else {
              usercb();
            }
          });
        },
        function(blockedusercb) {
          User.find(blockeduserid).exec(function afterwards(err, users) {
            if (err) {
              fromusercb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
            }
            if (typeof users != "undefined" && users.length > 0) {
              blockeduser = users[0];
              user = users[0];

              if (!user.socketid) {
                if (!user.devicetoken) {
                  sails.log("token not found");
                  return blockedusercb();
                }

                var mediadata = {};
                mediadata["mediatitle"] = "";
                mediadata["sender"] = userid;
                mediadata["blockeduserid"] = blockeduserid;
                mediadata["actions"] = "userblock";

                if (isblocked) mediadata["kind"] = "userblocked";
                else mediadata["kind"] = "userunblocked";

                pushService.createPushJob(
                  {
                    user: user,
                    mediadata: mediadata,
                  },
                  function(err) {
                    if (err) {
                      sails.log("Sails error");
                      return blockedusercb(err);
                    }
                    blockedusercb();
                  }
                );
              } else {
                var kinds;
                if (isblocked) kinds = "blocked";
                else kinds = "unblocked";

                User.message(blockeduserid, {
                  actions: "userblock",
                  actionsdata: {
                    userid: userid,
                    blockeduserid: blockeduserid,
                    kind: kinds,
                  },
                });

                blockedusercb();
              }
            } else {
              blockedusercb();
            }
          });
        },
      ],
      function(err, finalresult) {
        if (err)
          return res.serverError({
            message: sails.config.localised.responses.somethingwentwrong,
            err,
          });
        else if (isblocked)
          res.send({
            message: sails.config.localised.user.userblocksuccess,
          });
        else
          res.send({
            message: sails.config.localised.user.userunblockuccess,
          });
      }
    );
  },
  blockedUserList: function(req, res) {
    var userid = req.param("userid");

    if (!userid) {
      sails.log("User id not set");
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.useridrequired,
      });
    }

    var userblocklist;
    var blockedbyotherslist;
    var mutedusers;
    var mutedgrouplist;

    async.series(
      [
        function(userblocklistCb) {
          BlockUser.find({
            userid: userid,
          }).exec(function(err, objBlockUsers) {
            if (err) {
              userblocklist = [];
              userblocklistCb();
              return;
            }

            if (typeof objBlockUsers != "undefined" && objBlockUsers.length > 0) {
              userblocklist = objBlockUsers;
              userblocklistCb();
            } else {
              userblocklist = [];
              userblocklistCb(err);
            }
          });
        },
        function(blockedbyotherscb) {
          BlockUser.find({
            blockeduserid: userid,
          }).exec(function(err, objBlockbyothers) {
            if (err) {
              blockedbyotherslist = [];
              blockedbyotherscb();
              return;
            }

            if (typeof objBlockbyothers != "undefined" && objBlockbyothers.length > 0) {
              blockedbyotherslist = objBlockbyothers;
              blockedbyotherscb();
            } else {
              blockedbyotherslist = [];
              blockedbyotherscb(err);
            }
          });
        },
        function(userblocklistCb) {
          MuteUser.find({
            userid: userid,
          }).exec(function(err, objMutedUsers) {
            if (err) {
              mutedusers = [];
              userblocklistCb();
              return;
            }

            if (typeof objMutedUsers != "undefined" && objMutedUsers.length > 0) {
              mutedusers = objMutedUsers;
              userblocklistCb();
            } else {
              mutedusers = [];
              userblocklistCb(err);
            }
          });
        },
        function(mutedgroupslistCb) {
          MuteGroup.find({
            userid: userid,
          }).exec(function(err, objMuteGroups) {
            if (err) {
              mutedgrouplist = [];
              mutedgroupslistCb();
              return;
            }

            if (typeof objMuteGroups != "undefined" && objMuteGroups.length > 0) {
              mutedgrouplist = objMuteGroups;
              mutedgroupslistCb();
            } else {
              mutedgrouplist = [];
              mutedgroupslistCb();
            }
          });
        },
      ],
      function(err, finalresult) {
        if (err)
          res.send({
            message: sails.config.localised.user.blockedusernotfound,
          });
        else
          res.send({
            blockeduserlist: userblocklist,
            blockedbyotherslist: blockedbyotherslist,
            muteduserlist: mutedusers,
            mutedgrouplist: mutedgrouplist,
            message: sails.config.localised.user.blockeduserlist,
          });
      }
    );
  },
  muteUser: function(req, res) {
    var muteduserid = req.param("muteduserid");
    var userid = req.param("userid");

    if (!muteduserid) {
      sails.log("User id not set");
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.useridrequired,
      });
    }

    if (!userid) {
      sails.log("User id not set");
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.useridrequired,
      });
    }

    var ismuted = false;

    async.series(
      [
        function(muteusercb) {
          MuteUser.find({
            muteduserid: muteduserid,
            userid: userid,
          }).exec(function(err, objMuteUser) {
            if (err) {
              return muteusercb(err);
            }

            if (typeof objMuteUser != "undefined" && objMuteUser.length > 0) {
              MuteUser.destroy({
                id: objMuteUser[0].id,
              }).exec(function(err, destroyedobj) {
                if (err) {
                  return muteusercb(err);
                }
                muteusercb();
              });
            } else {
              MuteUser.create({
                muteduserid: muteduserid,
                userid: userid,
              }).exec(function(err, newmodel) {
                if (newmodel) {
                  ismuted = true;
                  muteusercb();
                }
              });
            }
          });
        },
        function(usercb) {
          User.find(userid).exec(function afterwards(err, users) {
            if (err) {
              return usercb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
            }
            if (typeof users != "undefined" && users.length > 0) {
              user = users[0];

              if (!user.socketid) {
                if (!user.devicetoken) {
                  sails.log("token not found");
                  return usercb();
                }

                var mediadata = {};
                mediadata["mediatitle"] = "";
                mediadata["sender"] = userid;
                mediadata["muteduserid"] = muteduserid;
                mediadata["actions"] = "userMute";

                if (ismuted) mediadata["kind"] = "muted";
                else mediadata["kind"] = "unmuted";

                pushService.createPushJob(
                  {
                    user: user,
                    mediadata: mediadata,
                  },
                  function(err) {
                    if (err) {
                      sails.log("Sails error");
                      return usercb(err);
                    }
                    usercb();
                  }
                );
              } else {
                var kinds;
                if (ismuted) kinds = "muted";
                else kinds = "unmuted";

                User.message(userid, {
                  actions: "userMute",
                  actionsdata: {
                    userid: userid,
                    muteduserid: muteduserid,
                    kind: kinds,
                  },
                });
                usercb();
              }
            } else {
              usercb();
            }
          });
        },
        function(mutedusercb) {
          User.find(muteduserid).exec(function afterwards(err, users) {
            if (err) {
              return mutedusercb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
            }
            if (typeof users != "undefined" && users.length > 0) {
              user = users[0];

              if (!user.socketid) {
                if (!user.devicetoken) {
                  sails.log("token not found");
                  return mutedusercb();
                }
                var mediadata = {};
                mediadata["mediatitle"] = "";
                mediadata["sender"] = userid;
                mediadata["muteduserid"] = muteduserid;
                mediadata["actions"] = "userMute";

                if (ismuted) mediadata["kind"] = "muted";
                else mediadata["kind"] = "unmuted";

                pushService.createPushJob(
                  {
                    user: user,
                    mediadata: mediadata,
                  },
                  function(err) {
                    if (err) {
                      sails.log("Sails error");
                      return mutedusercb(err);
                    }
                    mutedusercb();
                  }
                );
              } else {
                var kinds;
                if (ismuted) kinds = "muted";
                else kinds = "unmuted";

                User.message(muteduserid, {
                  actions: "userMute",
                  actionsdata: {
                    userid: userid,
                    muteduserid: muteduserid,
                    kind: kinds,
                  },
                });
                mutedusercb();
              }
            } else {
              mutedusercb();
            }
          });
        },
      ],
      function(err, finalresult) {
        if (err)
          return res.serverError({
            message: sails.config.localised.responses.somethingwentwrong,
            err,
          });
        else if (ismuted)
          res.send({
            message: sails.config.localised.user.usermutesuccess,
          });
        else
          res.send({
            message: sails.config.localised.user.userunmutesuccess,
          });
      }
    );
  },
  refreshToken: function(req, res) {
    var token = req.param("token");
    res.send({
      token: token,
    });
  },
  UpdatedeviceToken: function(req, res) {
    var devicetoken = req.param("devicetoken");
    var userid = req.param("userid");
    var userdevice = req.param("userdevice");

    var sns = sails.config.AWSSNS;
    sails.log("notificaion Arn ");
    var AWSArn = "";

    if (userdevice == "iphone") {
      AWSArn = sails.config.AWSArn.iOSArn;
    } else {
      AWSArn = sails.config.AWSArn.AndroidArn;
    }

    sns.createPlatformEndpoint(
      {
        PlatformApplicationArn: AWSArn,
        Token: devicetoken,
      },
      function(err, data) {
        if (err) {
          console.log("Create endpoint error : ", err.stack);
          res.serverError({
            message: sails.config.localised.responses.somethingwentwrong,
            err,
          });
        }
        sails.log("endpoint data", data);
        var reqData = {};
        if (data) reqData.endpointArn = data.EndpointArn;

        reqData.devicetoken = devicetoken;

        User.update({ id: userid }, reqData).exec(function afterwards(err, user) {
          if (err) {
            res.serverError({
              message: sails.config.localised.responses.somethingwentwrong,
              err,
            });
            return;
          }

          if (user.length > 0) {
            res.send({
              message: sails.config.localised.responses.devicetokenupdated,
            });
            return;
          } else {
            res.send({
              message: sails.config.localised.user.usernotexist,
            });
          }
        });
      }
    );
  },

  RefreshdeviceToken: function(req, res) {
    var devicetoken = req.param("devicetoken");
    var userid = req.param("userid");
    var endpointArn = req.param("endpointArn");

    pushstatus = 1;
    var params = {
      EndpointArn: endpointArn,
      Attributes: {
        Enabled: pushstatus == 1 ? "true" : "false",
        Token: devicetoken,
      },
    };

    var sns = sails.config.AWSSNS;

    sns.setEndpointAttributes(params, function(err, data) {
      if (err) {
        console.log("Enable endpoint err ", err);
        return res.serverError({
          message: sails.config.localised.responses.somethingwentwrong,
          err,
        });
      }
      res.send({
        message: sails.config.localised.responses.devicetokenrefreshed,
      });
    });
  },

  laravelUserDelete: function(req, res) {
    var reqData = eval(req.body);
    var userid = reqData.userid;
    console.log("laravelUserDelete", reqData.userid);
    var groupid;
    var folderPath = sails.config.paths.public + "/upload/" + userid;
    console.log("folderPath", folderPath);
    async.series(
      [
        function(usergroupcb) {
          UserGroup.destroy()
            .where({ creator: userid })
            .exec(function(err, result) {
              console.log("err usergroupcb", err);
              if (err) return usergroupcb(err);

              groupid = _.pluck(result, "id");
              usergroupcb();
            });
        },
        function(checkforblockcb) {
          BlockUser.destroy()
            .where({
              or: [{ blockeduserid: userid }, { userid: userid }],
            })
            .exec(function(err, objBlockUser) {
              console.log("err BlockUser", err);
              if (err) return checkforblockcb(err);

              checkforblockcb();
            });
        },
        function(chatcb) {
          Chat.destroy()
            .where({
              or: [{ fromuser: userid }, { touser: userid }, { groupid: groupid }],
            })
            .exec(function(err, result) {
              console.log("err chatcb", err);
              if (err) return chatcb(err);

              chatcb();
            });
        },
        function(contactcb) {
          Contact.destroy()
            .where({ contactuserid: userid })
            .exec(function(err, result) {
              console.log("err chatcb", err);
              if (err) return contactcb(err);

              contactcb();
            });
        },
        function(groupmsgcb) {
          GroupMessage.destroy()
            .where({ or: [{ fromuser: userid }, { groupid: groupid }] })
            .exec(function(err, result) {
              console.log("err groupmsgcb", err);
              if (err) return groupmsgcb(err);

              groupmsgcb();
            });
        },
        function(membercb) {
          MemberRequest.destroy()
            .where({ or: [{ userid: userid }, { groupid: groupid }] })
            .exec(function(err, result) {
              console.log("err membercb", err);
              if (err) return membercb(err);

              membercb();
            });
        },
        function(mutegroupcb) {
          MuteGroup.destroy()
            .where({ or: [{ userid: userid }, { groupid: groupid }] })
            .exec(function(err, result) {
              console.log("err mutegroupcb", err);
              if (err) return mutegroupcb(err);

              mutegroupcb();
            });
        },
        function(muteusercb) {
          MuteUser.destroy()
            .where({
              or: [{ muteduserid: userid }, { userid: userid }],
            })
            .exec(function(err, result) {
              console.log("err muteusercb", err);
              if (err) return muteusercb(err);

              muteusercb();
            });
        },
        function(spamcb) {
          Spam.destroy()
            .where({
              or: [{ fromuserid: userid }, { touserid: userid }, { groupid: groupid }],
            })
            .exec(function(err, result) {
              console.log("err spamcb", err);
              if (err) return spamcb(err);

              spamcb();
            });
        },

        function(usersettingcb) {
          UserSettings.destroy()
            .where({ userid: userid })
            .exec(function(err, result) {
              console.log("err usersettingcb", err);
              if (err) return usersettingcb(err);

              usersettingcb();
            });
        },
        function(usersocketcb) {
          UserSockets.destroy()
            .where({ user_id: userid })
            .exec(function(err, result) {
              console.log("err usersocketcb", err);
              if (err) return usersocketcb(err);

              usersocketcb();
            });
        },
        function(usergroupuserCb) {
          console.log("groupid", groupid);
          var query = "DELETE FROM user_groups__usergroup_users WHERE user_groups=" + userid;
          if (groupid.length > 0) {
            query += " OR usergroup_users IN(" + groupid + ")";
          }
          UserGroup.query(query, [], function(err, contacts) {
            if (err) {
              return usergroupuserCb(err);
            }
            usergroupuserCb();
          });
        },
        function(userprofileCb) {
          ProfileHistory.destroy()
            .where({ userid: userid })
            .exec(function(err, result) {
              console.log("err userprofileCb", err);
              if (err) return userprofileCb(err);

              rimraf(folderPath, function() {
                console.log("done");
                userprofileCb();
              });
            });
        },
        function(usercb) {
          User.destroy()
            .where({ id: userid })
            .exec(function(err, result) {
              console.log("err usercb", err);
              if (err) return usercb(err);

              usercb();
            });
        },
      ],
      function(err, finalresult) {
        if (err) {
          console.log("err", err);
          res.ok(302);
        } else {
          res.ok();
        }
      }
    );
  },
};
