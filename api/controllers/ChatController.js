/**
 * ChatController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var moment = require("moment");
var fs = require("fs");
var skipper = require('skipper');
var sizeOf = require('image-size');
var _$ = require("underscore");


module.exports = {

  privateMessage: function (req, res) {

    var fromuserid = req.param("userid");
    var touserid = req.param("touserid");
    var localchatid = req.param("localchatid");
    var message = req.param('msg');
    var socketId = sails.sockets.getId(req.socket);
    var reqData = {};
    reqData['fromuser'] = fromuserid;
    reqData.touser = touserid;
    reqData.chattype = 'normalchat';
    reqData.messagestatus = 'sent';
    reqData.mediatype = 'text';

    sails.log("User ", fromuserid, "Write to ", touserid + " send msg: ", message);

    if (localchatid)
      reqData.localchatid = localchatid;

    reqData.mediadata = message;


    if (!fromuserid) {
        sails.log("From User id required");
        return res.badRequest({
          data: "",
          message: sails.config.localised.commonvalidation.useridrequired
        });
    }


    if (!touserid) {
        sails.log("To User id required");
        return res.badRequest({
          data: "",
          message: sails.config.localised.commonvalidation.useridrequired
        });
    }


    var objchat;
    var fromusername;
    var isblockeduser = false;
    var isspamuser= false;
    var ismuteduser = false;
    var fromuserobject;
    var touserobject;
    async.series([
        function (checkforblockcb) {
          BlockUser.find().where({
            or: [{
              blockeduserid: fromuserid,
              userid: touserid
            }, {
              blockeduserid: touserid,
              userid: fromuserid
            }]
          }).exec(function (err, objBlockUser) {
            if (err)
              return checkforblockcb(err);

            if (typeof objBlockUser != "undefined" && objBlockUser.length > 0) {
              sails.log("blocked user");
              isblockeduser = true;
              checkforblockcb();
            } else {
              checkforblockcb();
            }
          });
        },
        function (checkforspancb) {
          Spam.find().where({
            or: [{
              fromuserid: fromuserid,
              touserid: touserid
            }, {
              fromuserid: touserid,
              touserid: fromuserid
            }]
          }).exec(function (err, objSpanUser) {
            if (err)
              return checkforspancb(err);

            if (typeof objSpanUser != "undefined" && objSpanUser.length > 0) {
              sails.log("blocked user");
              isspamuser = true;
              checkforspancb();
            } else {
              checkforspancb();
            }
          });
        },
        function (checkformutecb) {
          MuteUser.find().where({
            muteduserid: fromuserid,
            userid: touserid
          }).exec(function (err, objMuteUser) {
            if (err)
              return checkformutecb(err);

            if (typeof objMuteUser != "undefined" && objMuteUser.length > 0) {
              sails.log("muted user");
              ismuteduser = true;
              checkformutecb();
            } else {
              checkformutecb();
            }
          });
        },
        function (createchatcb) {
          if (isblockeduser || isspamuser) {
            sails.log("is blocked user");
            return createchatcb();
          }
          Chat.create(
            reqData
          ).exec(function (err, newchat) {
            if (err) {
              createchatcb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
            }
            objchat = newchat;
            createchatcb();
          });
        },
        function (fromusercb) {
          if (isblockeduser || isspamuser) {
            sails.log("is blocked user");
            return fromusercb();
          }
          User.find(fromuserid)
            .exec(function afterwards(err, users) {
              if (err) {
                fromusercb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
              }
              if (typeof users != "undefined" && users.length > 0) {

                fromuserobject = users[0];
                fromusername = users[0].fullName();

                if (!fromusername)
                  fromusername = users[0].mobilenumber;

                User.message(fromuserid, {
                  actions: "message",
                  actionsdata: objchat
                });
                fromusercb();
              } else {
                fromusercb(err);
              }
            });
        },
        function (tousercb) {
          if (isblockeduser || isspamuser) {
            sails.log("is blocked user");
            return tousercb();
          }
          User.find(touserid)
            .exec(function afterwards(err, users) {
              if (err) {
                return tousercb(err);
              }
              if (typeof users != "undefined" && users.length > 0) {

                var user = users[0];
                touserobject = users[0];

                if (!user.socketid) {
                  if (ismuteduser) {
                    sails.log("is muted user");
                    return tousercb();
                  }
                  sails.log("Call Notification");
                  if (!user.devicetoken) {
                    sails.log("token not found");
                    return tousercb();
                  }

                  var mediadata = {};
                  mediadata['mediatitle'] = fromusername;
                  mediadata['sender'] = fromusername;
                  mediadata['actions'] = 'message';
                  mediadata['mediadata'] = objchat.mediadata.substr(0, 200);
                  mediadata['chatid'] = objchat.id;
                  mediadata['mediatype'] = objchat.mediatype;
                  mediadata['notificationtype'] = objchat.chattype;

                  pushService.createPushJob({
                    user: user,
                    mediadata: mediadata
                  }, function (err) {
                    if (err) {
                      sails.log("Sails error");
                      return tousercb(err);
                    }
                    tousercb();
                  });
                } else {
                  User.message(touserid, {
                    actions: "message",
                    actionsdata: objchat
                  });
                  tousercb();
                }
              } else {
                tousercb(err);
              }

            });
        },
        function (translatecb) {
          if (isblockeduser || isspamuser) {
            sails.log("is blocked user");
            return translatecb();
          }
          if (!touserobject) {
            sails.log("to user not found");
            return translatecb();
          }
          sails.log("To user detail ", touserobject);
          if (!touserobject.languagecode || touserobject.languagecode == 'aut') {
            return translatecb();
          }

        //   if (!fromusername.languagecode == touserobject.languagecode) {
        //     return translatecb();
        //   }

          var textString = objchat.mediadata;
          var translatedString = "";
          const translate = require('google-translate-api');

          translate(textString, {
            to: touserobject.languagecode
          }).then(restranslate => {
            console.log(restranslate.text);
            translatedString = restranslate.text;
            console.log(restranslate.from.language.iso);

            var reqDataUpdate = {};
            reqDataUpdate.translatedmediadata = translatedString;
            reqDataUpdate.translatedlangcode = touserobject.languagecode;

            Chat.update({
              id: objchat.id
            }, reqDataUpdate).exec(function afterwards(err, chatData) {
              if (err) {
                sails.log("Update error : ", err);
                return translatecb();
              }

              if (typeof chatData != "undefined" && chatData.length > 0) {
                objChatUpdated = chatData[0];
                if (!touserobject.socketid) {
                  if (ismuteduser) {
                    sails.log("is muted user");
                    return translatecb();
                  }

                  if (!touserobject.devicetoken) {
                    sails.log("token not found");
                    return translatecb();
                  }
                  sails.log("Call Notification without");
                  translatecb();
                  // var mediadata = {};
                  // mediadata['mediatitle'] = fromusername;
                  // mediadata['sender'] = fromusername;
                  // mediadata['actions'] = 'message';
                  // mediadata['mediadata'] = objChatUpdated.mediadata.substr(0, 200);
                  // mediadata['chatid'] = objChatUpdated.id;
                  // mediadata['istranslated'] = true;
                  // mediadata['mediatype'] = objChatUpdated.mediatype;
                  // mediadata['notificationtype'] = objChatUpdated.chattype;

                  // pushService.createPushJob({
                  //   user: touserobject,
                  //   mediadata: mediadata
                  // }, function (err) {
                  //   if (err) {
                  //     sails.log("Sails error");
                  //     return translatecb(err);
                  //   }
                  //   translatecb();
                  // });
                } else {
                  User.message(touserid, {
                    actions: "message",
                    actionsdata: objChatUpdated
                  });
                  translatecb();
                }
              } else {
                translatecb();
              }
            });
          }).catch(err => {
            console.error(err);
            console.log("Error", err);
            translatecb();
          });
        },
      ],
      function (err, finalresult) {
        if (err)
          res.serverError({
            message: sails.config.localised.responses.somethingwentwrong,
            err
          });
        else {
          if (isblockeduser || isspamuser) {
            sails.log("is blocked user");
            return res.send({
              data: {
                actions: "message",
                actionsdata: ""
              },
              message: sails.config.localised.user.userblocked
            });
          }
          sails.log("is not blocked user");
          res.send({
            data: {
              actions: "message",
              actionsdata: objchat
            },
            message: sails.config.localised.chat.chatmessagesuccess
          });
        }
      }
    );
  },

  userTyping: function (req, res) {

    var userid = req.param("userid");
    var touserid = req.param("touserid");
    var socketId = sails.sockets.getId(req.socket);

    sails.log("User ", userid, "typing... to " + touserid);

    var isblockeduser=false;

    if (!userid)
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.useridrequired
      });

    if (!touserid)
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.useridrequired
      });
      async.series([
         function (checkforblockcb) {
                BlockUser.find().where({
                    or: [{ blockeduserid: userid, userid: touserid }, { blockeduserid: touserid, userid: userid }]
                }).exec(function (err, objBlockUser) {
                    if (err)
                        return checkforblockcb(err);

                    sails.log("Mute group object", objBlockUser);
                    if (typeof objBlockUser != "undefined" && objBlockUser.length > 0) {
                        sails.log("blocked user");
                        isblockeduser = true;
                        checkforblockcb();
                    }
                    else {
                        checkforblockcb();
                    }
                });
            },
            function(socketCb)
            {
              if(isblockeduser==true)
              {
                socketCb();
                return;
              }
              if (req.isSocket) {
                User.message(touserid, {
                  actions: "typing",
                  actionsdata: {
                    fromuser: userid,
                    touser: touserid,
                    msg: ""
                  }
                });
              }
              socketCb();
            }
      ],
      function(err,finalresult)
      {
        res.send({
          data: {
            actions: "typing",
            actionsdata: {
              fromuser: userid,
              touser: touserid,
              msg: ""
            }
          },
          message: sails.config.localised.chat.usertypingmessage
        });
      });

  },

  groupMessage: function (req, res) {

    var groupid = req.param("groupid");
    var userid = req.param("userid");
    var message = req.param('msg');
    var localchatid = req.param("localchatid");

    sails.log("User id ", userid, "group id " + groupid);
    var socketId = sails.sockets.getId(req.socket);

    var reqData = {};
    reqData['fromuser'] = userid;
    reqData.groupid = groupid;
    reqData.chattype = 'groupchat';
    reqData.messagestatus = 'sent';
    reqData.mediatype = 'text';
    reqData.mediadata = message;
    if (localchatid)
      reqData.localchatid = localchatid;

    sails.log("ReqData ", reqData);

    if (!userid)
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.useridrequired
      });

    if (!groupid)
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.groupidrequired
      });

    var objeGroup;
    var objeGroupMessage;
    var fromusername;
    var isgroupexist = false;
    var fromuserobject;

    async.series([
        function (creategroupmessagecb) {
          var reqgmData = {};
          reqgmData['fromuser'] = userid;
          reqgmData.groupid = groupid;

          GroupMessage.create(
            reqgmData
          ).exec(function (err, newgroupmessage) {
            if (err) {
              return res.serverError({
                message: sails.config.localised.responses.somethingwentwrong,
                err
              });
            }
            if (!newgroupmessage) {
              return res.serverError({
                message: sails.config.localised.responses.somethingwentwrong,
                err
              });
            }
            objeGroupMessage = newgroupmessage;
            creategroupmessagecb();
          });
        },
        function (findgroupcb) {
          UserGroup.find({
              id: groupid
            })
            .populateAll()
            .exec(function afterwards(err, objgroup) {
              if (err) {
                return groupdata(err);
              }

              if (typeof objgroup != "undefined" && objgroup.length > 0) {
                objeGroup = objgroup[0];
                isgroupexist = true;
                findgroupcb();
              } else {
                findgroupcb(err);
              }
            });
        },
        function (fromusercb) {
          if (!isgroupexist) {
            fromusercb();
          }
          User.find(userid)
            .exec(function afterwards(err, users) {
              if (err) {
                fromusercb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
              }
              if (typeof users != "undefined" && users.length > 0) {
                fromusername = users[0].fullName();
                fromuserobject = users[0];
                if (!fromusername)
                  fromusername = users[0].mobilenumber;
                fromusercb();
              } else {
                fromusercb(err);
              }
            });
        },
        function (sendmessagecb) {
          if (!isgroupexist) {
            sendmessagecb();
          }
          var users = objeGroup.users;
          async.eachSeries(users, function (user, cb) {
            reqData.touser = user.id;
            reqData.messagegroup = objeGroupMessage;
            var objchat;
            async.series([
                function (createchatcb) {
                  Chat.create(
                    reqData
                  ).exec(function (err, newchat) {
                    if (err) {
                      createchatcb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
                    }
                    // sails.log("newchat ", newchat);
                    objchat = newchat;
                    createchatcb();
                  });
                },
                function (tousercb) {

                  if (!user.socketid) {

                    if (userid != user.id) {
                      MuteGroup.find({
                        groupid: objeGroup.id,
                        userid: user.id
                      }).exec(function (err, objMuteGroup) {
                        if (err)
                          return tousercb(err);

                        if (typeof objMuteGroup != "undefined" && objMuteGroup.length > 0) {
                          sails.log("group muted for this user");
                          tousercb();
                        } else {
                          if (!user.devicetoken) {
                            sails.log("token not found");
                            return tousercb();
                          }

                          var mediadata = {};
                          mediadata['mediatitle'] = fromusername + ' @ ' + objeGroup.groupname;
                          mediadata['sender'] = fromusername;
                          mediadata['actions'] = 'message';
                          mediadata['mediadata'] = fromusername+' : '+objchat.mediadata.substr(0, 200);
                          mediadata['chatid'] = objchat.id;
                          mediadata['mediatype'] = objchat.mediatype;
                          mediadata['notificationtype'] = objchat.chattype;
                          mediadata['groupname'] = objeGroup.groupname;

                          pushService.createPushJob({
                            user: user,
                            mediadata: mediadata
                          }, function (err) {
                            if (err) {
                              sails.log("Sails error");
                              return tousercb(err);
                            }
                            tousercb();
                          });
                        }
                      });
                    } else {
                      tousercb();
                    }
                  } else {
                    User.message(user.id, {
                      actions: "message",
                      actionsdata: objchat
                    });
                    tousercb();
                  }
                },
              ],
              function (err, finalresult) {
                if (err)
                  cb(err);
                else
                  cb();
              }
            );
          }, function (err) {
            sendmessagecb();
          });
        },
        function (translatemessagecb) {
          if (!isgroupexist) {
            translatemessagecb();
          }
          var users = objeGroup.users;
          var userlistByLang;
          async.series([
              function (getuserbylangcb) {
                var query = 'SELECT CONCAT(languagecode) as  lcode,GROUP_CONCAT(id) as userids FROM user WHERE FIND_IN_SET(id, (SELECT GROUP_CONCAT(user_groups) FROM `user_groups__usergroup_users` WHERE `usergroup_users` = ' + objeGroup.id + ' )) group BY languagecode';
                User.query(query, [], function (err, userlistbylang) {
                  if (err) {
                    getuserbylangcb(err);
                  }
                  userlistByLang = userlistbylang;
                  getuserbylangcb();
                });
              },
              function (updatecode) {
                async.eachSeries(userlistByLang, function (usersByLang, cb) {
                  sails.log("Language code ", usersByLang.lcode);
                  sails.log("Users with Lang code ", usersByLang.userids);
                  if (!usersByLang.lcode || usersByLang.lcode == 'aut') {
                    sails.log("Language code not exist");
                    return cb();
                  }
                  var translatedString;
                  async.series([
                      function (translatecb) {
                        var textString = message;
                        const translate = require('google-translate-api');

                        if(fromuserobject.languagecode == usersByLang.lcode) {
                            translatedString = textString;
                            return translatecb();
                        }

                        translate(textString, {
                          to: usersByLang.lcode
                        }).then(restranslate => {
                          translatedString = restranslate.text;
                          translatecb();
                        }).catch(err => {
                          console.error(err);
                          console.log("Error", err);
                          translatecb();
                        });
                      },
                      function (findchatobjectcb) {
                        async.eachSeries(usersByLang.userids.split(','), function (user_id, insidecb) {
                          Chat.find({
                              touser: user_id,
                              messagegroup: objeGroupMessage.id
                            })
                            .exec(function afterwards(err, chatObject1) {
                              if (err) {
                                insidecb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
                              }
                              if (typeof chatObject1 != "undefined" && chatObject1.length > 0) {
                                var chatObject = chatObject1[0];
                                chatObject.translatedmediadata = translatedString;
                                chatObject1.translatedlangcode = usersByLang.lcode;
                                chatObject.save(function (err) {
                                  var user = _.findWhere(users, {
                                    id: parseInt(user_id)
                                  });
                                  if (!user) {
                                    insidecb();
                                    return;
                                  }
                                  if (!user.socketid) {
                                    if (userid != user.id) {
                                      MuteGroup.find({
                                        groupid: objeGroup.id,
                                        userid: user.id
                                      }).exec(function (err, objMuteGroup) {
                                        if (err)
                                          return insidecb(err);

                                        if (typeof objMuteGroup != "undefined" && objMuteGroup.length > 0) {
                                          sails.log("group muted for this user");
                                          insidecb();
                                        } else {
                                          if (!user.devicetoken) {
                                            sails.log("token not found");
                                            return insidecb();
                                          }
                                          insidecb();
                                          // var mediadata = {};
                                          // mediadata['mediatitle'] = fromusername + ' @ ' + objeGroup.groupname;
                                          // mediadata['sender'] = fromusername;
                                          // mediadata['actions'] = 'message';
                                          // mediadata['mediadata'] = chatObject.mediadata.substr(0, 200);
                                          // mediadata['chatid'] = chatObject.id;
                                          // mediadata['istranslated'] = true;
                                          // mediadata['mediatype'] = chatObject.mediatype;
                                          // mediadata['notificationtype'] = chatObject.chattype;

                                          // pushService.createPushJob({
                                          //   user: user,
                                          //   mediadata: mediadata
                                          // }, function (err) {
                                          //   if (err) {
                                          //     sails.log("Sails error");
                                          //     return insidecb(err);
                                          //   }
                                          //   insidecb();
                                          // });
                                        }
                                      });
                                    } else {
                                      insidecb();
                                    }
                                  } else {
                                    User.message(user.id, {
                                      actions: "message",
                                      actionsdata: chatObject
                                    });
                                    insidecb();
                                  }
                                });
                              } else {
                                insidecb();
                              }
                            });
                        }, function (err) {
                          findchatobjectcb();
                        });
                      },
                    ],
                    function (err, finalresult) {
                      if (err)
                        cb(err);
                      else
                        cb();
                    }
                  );
                }, function (err) {
                  updatecode();
                });
              }
            ],
            function (err, finalresult) {
              if (err)
                translatemessagecb(err);
              else
                translatemessagecb();
            }
          );
        },
      ],
      function (err, finalresult) {
        if (err)
          res.serverError({
            message: sails.config.localised.responses.somethingwentwrong,
            err
          });
        else
          res.send({
            message: sails.config.localised.chat.chatmessagesuccess
          });
      }
    );
  },

  groupMessageTyping: function (req, res) {

    var groupid = req.param("groupid");
    var userid = req.param("userid");
    sails.log("User with id ", userid, "wrting in group with id " + groupid);
    if (req.isSocket) {
      UserGroup.message(groupid, {
        actions: "typing",
        actionsdata: {
          fromuser: userid,
          groupid: groupid,
          mediadata: ""
        }
      }, req);
    }
    res.send({
      data: {
        actions: "typing",
        actionsdata: {
          fromuser: userid,
          groupid: groupid,
          mediadata: ""
        }
      },
      message: sails.config.localised.chat.usertypingmessage
    });
  },

  chatDetail: function (req, res) {

    var chatid = req.param("chatid");
    var userid = req.param("userid");

    Chat.find({
      id: chatid
    }).exec(function (err, objChat) {
      if (err)
        return checkforblockcb(err);

      if (typeof objChat != "undefined" && objChat.length > 0) {
        sails.log("blocked user");
        if (req.isSocket) {
          User.message(userid, {
            actions: "chatDetail",
            actionsdata: objChat[0]
          });
        }
        res.send({
          data: {
            actions: "chatDetail",
            actionsdata: objChat[0]
          },
          message: sails.config.localised.chat.chatDetail
        });
      } else {
        res.send({
          data: {
            actions: "chatDetail",
            actionsdata: {}
          },
          message: sails.config.localised.chat.chatnotexist
        });
      }
    });
  },
  privateMessageStatus: function (req, res) {

    var fromuserid = req.param("userid");
    var touserid = req.param("touserid");
    var chatid = req.param("chatid");
    var messagestatus = req.param('messagestatus');
    var socketId = sails.sockets.getId(req.socket);

    if (!chatid)
      return res.badRequest({
        data: "",
        message: sails.config.localised.chat.chatnotexist
      });

    var reqData = {};
    reqData.messagestatus = messagestatus;

    Chat.update({
      id: chatid
    }, reqData).exec(function afterwards(err, chatData) {
      if (err) {
        sails.log("Updated Chat err  ", err);
        res.serverError({
          message: sails.config.localised.responses.somethingwentwrong,
          err
        });
      }
      if (typeof chatData != "undefined" && chatData.length > 0) {
        if (!chatData[0].groupid) {
          User.message(chatData[0].touser, {
            actions: "messagestatus",
            actionsdata: chatData[0]
          });
          User.message(chatData[0].fromuser, {
            actions: "messagestatus",
            actionsdata: chatData[0]
          });
        } else {
          User.message(chatData[0].touser, {
            actions: "messagestatus",
            actionsdata: chatData[0]
          });
        }
      }
      res.send({
        message: sails.config.localised.chat.chatstatusupdate
      });
    });
  },

  multipleMessageStatusforUser: function (req, res) {

    var params = eval(req.body);
    var userid = params.userid;
    var touserid = params.touserid;
    var groupid = params.groupid;
    var messagestatus = params.messagestatus;

    var querydata = {};

    if (!groupid) {
      querydata = {
        or: [{
            touser: userid,
        fromuser: touserid,
        messagestatus: 'delivered',
        chattype: 'normalchat'
        },
        {   touser: userid,
            fromuser: touserid,
            messagestatus: 'sent',
            chattype: 'normalchat'
        }]
    }
    } else {
      querydata = {
        or: [{
            touser: userid,
        groupid: groupid,
        messagestatus: 'delivered',
        chattype: 'groupchat'
        },
        {   touser: userid,
            groupid: groupid,
            messagestatus: 'sent',
            chattype: 'groupchat'
        }]
    }
    }
    var status = {
      messagestatus: 'viewed'
    }

    Chat.update(querydata, status).exec(function afterwards(err, updatedchats) {
      if (err) {
        console.log('error in update\n' + err);
        return res.serverError({
          message: sails.config.localised.responses.servererror
        });
      } else {
        var chatids = "";
        if (typeof updatedchats != "undefined" && updatedchats.length > 0) {
          updatedchats.forEach(function (chatobject) {
            if (chatobject.id) {
              chatids += "," + chatobject.id;
            }
          });
          if (chatids.charAt(0) === ',')
            chatids = chatids.substr(1);
          chatids = chatids.split(",");
          chatids = _$.uniq(chatids, false);
          chatids = _$.reject(chatids, function (item) {
            return (item == 'null');
          });
          chatids = chatids.join(",");
        }
        console.log("Users ids ", chatids);
        if (chatids) {
          User.message(userid, {
            actions: "bulkmessagestatus",
            actionsdata: chatids
          });
          
        }
        res.send({
          chatids: chatids,
          message: sails.config.localised.chat.chatstatusupdate
        });
      }
    });
  },

  multipleMessageStatus: function (req, res) {

    var params = eval(req.body);
    var fromuserid = params.userid;
    var touserid = params.touserid;
    var chatids = params.chatids.split(',');
    var messagestatus = params.messagestatus;
    var reqData = {};
    reqData.messagestatus = messagestatus;
    sails.log("ReqData ", chatids);
    async.eachSeries(chatids, function (chatid, cb) {
      Chat.update({
        id: chatid
      }, reqData).exec(function afterwards(err, chatData) {
        if (err) {
          cb(err);
          return;
        }
        if (typeof chatData != "undefined" && chatData.length > 0) {
          if (!chatData[0].groupid) {
            User.message(chatData[0].touser, {
              actions: "messagestatus",
              actionsdata: chatData[0]
            });
            User.message(chatData[0].fromuser, {
              actions: "messagestatus",
              actionsdata: chatData[0]
            });
          } else {
            User.message(chatData[0].touser, {
              actions: "messagestatus",
              actionsdata: chatData[0]
            });
          }
          cb();
        } else {
          cb();
          return;
        }
      });
    }, function (err) {
      res.send({
        message: sails.config.localised.chat.chatstatusupdate
      });
    });
  },

  chatHistory: function (req, res) {

    var userid = req.param("userid");
    var createdAt = req.param("createdAt");

    if (!userid)
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.useridrequired
      });

    sails.log("CreatedAt date: ", createdAt);
    var dateObj = moment(createdAt);
    var createdAtFormated = dateObj.utc().format("YYYY-MM-DD HH:mm:ss");
    sails.log("Date other way: ", dateObj);

    var query;
    if (createdAt) {
      query = 'SELECT * FROM  `chat` WHERE ((`fromuser` = ' + userid + ' OR `touser` = ' + userid + ') AND `createdAt` >  "' + createdAtFormated + '")';
    } else {
      query = 'SELECT * FROM  `chat` WHERE (`fromuser` = ' + userid + ' OR `touser` = ' + userid + ')';
    }

    sails.log("Chat fetch query ", query);
    Chat.query(query, [], function (err, chats) {
      if (err) {
        sails.log(err);
        return res.serverError({
          message: sails.config.localised.responses.servererror
        });
      }
      res.send({
        data: chats,
        objectcounts: chats.length,
        message: sails.config.localised.chat.chathistoryfetch
      });
    });
  },

  getGroupMessage: function (req, res) {

    var groupmessageid = req.param("groupmessageid");
    GroupMessage.find({
        id: groupmessageid
      })
      .populateAll()
      .exec(function afterwards(err, objGroupMessage) {
        if (err) {
          res.serverError({
            message: sails.config.localised.responses.somethingwentwrong,
            err
          });
        }
        res.send({
          data: objGroupMessage,
          message: sails.config.localised.groups.groupmessageidfetchsuccess
        });
      });
  },

  mediaUpload: function (req, res) {
    /******** disable image uploading in chat ********/
    return res.badRequest({
      data: "",
      message: ""
    });

    var reqData = eval(req.body);
    var userid = req.param("userid");
    var touserid = req.param("touserid");
    var chattype = req.param("chattype");
    var mediatype = req.param("mediatype");
    var localchatid = req.param("localchatid");

    sails.log("User ", userid, "Write to ", touserid + "sent image ");

    if (!userid)
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.useridrequired
      });

    if (!touserid)
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.useridrequired
      });

    sails.log("User ProfileUpdate : ", userid);

    var reqData = {};
    reqData['fromuser'] = userid;
    reqData.touser = touserid;
    reqData.chattype = chattype;
    reqData.messagestatus = 'sent';
    reqData.mediatype = mediatype;

    if (localchatid)
      reqData.localchatid = localchatid;


    var folderPath = sails.config.paths.public;
    var imagePath = "/upload/chat/";
    var newfilename = "";

    if (req._fileparser.upstreams.length) {
      newfilename = moment().utc().unix() + "_" + req.file('media')._files[0].stream.filename;
      req.file('media').upload({
        maxBytes: 10000000,
        saveAs: newfilename,
        dirname: folderPath + imagePath
      }, function whenDone(err, uploadedFiles) {
        if (err) {
          return res.negotiate(err);
        }

        sails.log("image data", uploadedFiles[0].size);
        reqData.mediasize = uploadedFiles[0].size;
        sizeOf(uploadedFiles[0].fd, function (err, dimensions) {
          if (!err) {
            console.log(dimensions.width, dimensions.height);
            reqData.imgheight = dimensions.width;
            reqData.imgwidth = dimensions.height;
          }
          reqData.mediadata = imagePath + newfilename;

          Chat.create(
            reqData
          ).exec(function (err, newchat) {
            if (err) {
              return res.serverError({
                message: sails.config.localised.responses.somethingwentwrong,
                err
              });
            }
            sails.log("newchat ", newchat);

            User.message(touserid, {
              actions: "message",
              actionsdata: newchat
            });

            res.send({
              data: {
                actions: "message",
                actionsdata: newchat
              },
              message: sails.config.localised.chat.chatmessagesuccess
            });
          });
        });
      });
    } else {
      req.file('media').upload({
        noop: true
      });
      res.send({
        data: "",
        message: sails.config.localised.chat.chatmessagesuccess
      });
    }
  }
};
