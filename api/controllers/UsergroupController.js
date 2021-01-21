var gm = require('gm');
var fs = require('fs');
var moment = require("moment");
module.exports = {

  createGroup: function (req, res) {

    var params = eval(req.body);
    var groupname = params.groupname;
    var userid = params.userid;
    var members = params.members;
    members=members.split(",");
    var socketId = sails.sockets.getId(req);
    var groupid = '';
    var createdgroup;

    var reqData = eval(req.body);
    reqData['creator'] = userid;
    reqData['users'] = reqData.members;

    delete reqData.members;
    delete reqData.userid;

    var folderPath = sails.config.paths.public;
    var imagePath = "/upload/" + userid + "/groups";
    var UserImagePath = "";
    var newfilename = "";

    var fromusername;
    var isgroupexist = false;
    var objeGroupMessage;

    async.series([
      function (uploadImageCb) {

                  if (req._fileparser.upstreams.length) {

                    newfilename = moment().utc().unix() + "_" + req.file('usergroupmedia')._files[0].stream.filename;
                    newthumbfilename = moment().utc().unix() + "_thumb_" + req.file('usergroupmedia')._files[0].stream.filename;

                    req.file('usergroupmedia').upload({
                      maxBytes: 10000000,
                      saveAs: newfilename,
                      dirname: folderPath + imagePath
                    }, function whenDone(err, uploadedFiles) {
                      if (err) {
                        return res.negotiate(err);
                      }
                      reqData['groupimage'] = imagePath + "/" + newfilename;
                      // reqData['groupthumbimage'] = imagePath + "/" + newfilename;
                      var imageuploadedPath = sails.config.paths.public + imagePath + "/" + newfilename;

                      var imgthumb = sails.config.paths.public + imagePath + '/' + newthumbfilename;

                      gm(imageuploadedPath)
                        .resize(sails.config.const.imageratio.width, sails.config.const.imageratio.height, '^')
                        .write(imgthumb, function (err) {
                          //console.log("err image",err);
                          if (!err) {
                            reqData['groupthumbimage'] = imagePath + "/" + newthumbfilename
                          }
                          uploadImageCb();
                        });

                    });
                  } else {
                    req.file('usergroupmedia').upload({
                      noop: true
                    });
                    uploadImageCb();
                  }
                },
        function (creategroup) {
          sails.log("Create Group");
          UserGroup.create(
            reqData
          ).exec(function (err, newGroup) {
            if (err) {
              sails.log("Group error", err);
              return creategroup(err);
            }
            groupid = newGroup.id;
            UserGroup.subscribe(req, groupid, ['message', 'destroy', 'update', 'add:users', 'remove:users']);
            creategroup();
          });
        },
        function (groupdata) {
            UserGroup.find({
                  id: groupid
                })
                .populateAll()
                .exec(function afterwards(err, objgroup) {
                  if (err) {
                    return groupdata(err);
                  }
                  if (typeof objgroup != "undefined" && objgroup.length > 0) {
                    createdgroup = objgroup[0];
                    isgroupexist = true;
                    groupdata();
                  } else {
                    groupdata();
                  }
                });
        },
        function (fromusercb) {
          if (!isgroupexist) {
            fromusercb();
            return;
          }
          User.find(userid)
            .exec(function afterwards(err, users) {
              if (err) {
                fromusercb(err);
              }
              if (typeof users != "undefined" && users.length > 0) {
                fromusername = users[0].fullName();
                if (!fromusername)
                  fromusername = users[0].mobilenumber;

                fromusercb();
              } else {
                fromusercb(err);
              }
            });
		},
		// function(groupimageCb){
		// 	//console.log("Call group image=====>");
		// 	var users = createdgroup.users;
		// 	var userArr=[];
		// 	users.forEach(function(element) {
		// 			if(element.defaultimage){
		// 				element.displayimage="/defaultuser/"+element.defaultimage+".png";
		// 			}else if(element.thumbimage){
		// 				element.displayimage=element.thumbimage
		// 			}else{
		// 				element.displayimage="/defaultuser/1.png";
		// 			}
		// 			userArr.push(element);
		// 	});

		// 	//console.log("userArr",userArr);
		// 	if (!fs.existsSync(sails.config.paths.public + "/upload/" + createdgroup.creator)){
		// 		fs.mkdirSync(sails.config.paths.public + "/upload/" + createdgroup.creator);
		// 	}

		// 	var imagePath = "/upload/" + createdgroup.creator + "/groups";
		// 	if (!fs.existsSync(sails.config.paths.public + imagePath)){
		// 		fs.mkdirSync(sails.config.paths.public + imagePath);
		// 	}
		// 	var imagename=imagePath+"/"+moment().utc().unix() + "_allinone.jpg";
		// 	var merimageName = sails.config.paths.public + imagename ;

		// 	if(userArr.length>2){
		// 		gm()
		// 		.in('-page', '+0+0')
		// 		.in(sails.config.paths.public+userArr[0].displayimage)
		// 		.in('-page', '+225+0')
		// 		.in(sails.config.paths.public+userArr[1].displayimage)
		// 		.in('-page', '+0+225')
		// 		.in(sails.config.paths.public+userArr[2].displayimage)
		// 		.in('-page', '+225+225')
		// 		.in(sails.config.paths.public+'/defaultuser/1.png')
		// 		.minify()
		// 		.mosaic()
		// 		.write(merimageName, function (err) {
		// 			if (err) console.log(err);

		// 			UserGroup.update({id:createdgroup.id},{groupimage:imagename}).exec(function(err,result){
		// 				if(err){
		// 					groupimageCb(err);
		// 					return;
		// 				}
		// 				if(!result){
		// 					groupimageCb();
		// 					return;
		// 				}
		// 				createdgroup.groupimage=result[0].groupimage;
		// 				groupimageCb();
		// 			});
		// 		});
		// 	}
		// 	else
		// 	{
		// 		gm()
		// 		.in('-page', '+0+0')
		// 		.in(sails.config.paths.public+userArr[0].displayimage)
		// 		.in('-page', '+220+0')
		// 		.in(sails.config.paths.public+'/defaultuser/1.png')
		// 		.in('-page', '+0+220')
		// 		.in(sails.config.paths.public+'/defaultuser/1.png')
		// 		.in('-page', '+220+220')
		// 		.in(sails.config.paths.public+'/defaultuser/1.png')
		// 		.minify()
		// 		.mosaic()
		// 		.write(merimageName, function (err) {
		// 			if (err) console.log(err);

		// 			UserGroup.update({id:createdgroup.id},{groupimage:imagename}).exec(function(err,result){
		// 				if(err){
		// 					groupimageCb(err);
		// 					return;
		// 				}
		// 				if(!result){
		// 					groupimageCb();
		// 					return;
		// 				}
		// 				createdgroup.groupimage=result[0].groupimage;
		// 				groupimageCb();
		// 			});
		// 		});
		// 	}
		// },
        function (subscribecb) {

          if (!isgroupexist) {
            subscribecb();
            return;
          }
          console.log("createdgroup",createdgroup.users);
          var users = createdgroup.users;

          async.eachSeries(members, function (member, cb) {
            console.log("member==>",member);
            var user = _.findWhere(users, {
              id: parseInt(member)
            });
            console.log("user==>",user);
            if (!user) {
              subscribecb();
              return;
            }
            if (!user.socketid) {
              if (!user.devicetoken) {
                return cb();;
              }
              if (user.userdevice=="iphone")
                  return cb();

              var mediadata = {};
              mediadata['mediatitle'] = fromusername + ' Add you in ' + createdgroup.groupname;
              mediadata['sender'] = fromusername;
              mediadata['actions'] = "addedinnewgroup";
              mediadata['groupid'] = createdgroup.id;

              pushService.createPushJob({
                user: user,
                mediadata: mediadata
              }, function (err) {
                if (err) {
                  sails.log("Sails error");
                  return cb(err);
                }
                cb();
              });
            } else {
              console.log("socket call==>",member);
              User.message(member, {
                actions: "addedinnewgroup",
                actionsdata: createdgroup
              });
              cb();
            }
          }, function (err) {
            subscribecb();
          });
        },
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
        function (sendmessagecb) {
          if (isgroupexist) {
            var users = createdgroup.users;

            var reqchatData = {};
            reqchatData['fromuser'] = userid;
            reqchatData.groupid = groupid;
            reqchatData.messagestatus = 'sent';
            reqchatData.mediatype = 'text';
            reqchatData.ischatheader = true;
            reqchatData.chattype = 'groupchat';
            reqchatData.chatheadertype = 'groupcreate';
            reqchatData.actionsby = userid;
            reqchatData.actionon = userid;
            reqchatData.mediadata = fromusername+' created this group';

            async.eachSeries(users, function (user, cb) {

              reqchatData.touser = user.id;
              reqchatData.messagegroup = objeGroupMessage;
              var objchat;

              async.series([
                  function (createchatcb) {
                    Chat.create(
                      reqchatData
                    ).exec(function (err, newchat) {
                      if (err) {
                        createchatcb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
                      }
                      objchat = newchat;
                      createchatcb();
                    });
                  },
                  function (tousercb) {
                    if (!user.socketid) {
                      if (userid != user.id) {
                        MuteGroup.find({
                          groupid: createdgroup.id,
                          userid: user.id
                        }).exec(function (err, objMuteGroup) {
                          if (err)
                            return tousercb(err);

                          if (typeof objMuteGroup != "undefined" && objMuteGroup.length > 0) {
                            sails.log("group muted for this user");
                            tousercb();
                          } else {
                            sails.log("send message to user");

                            if (!user.devicetoken) {
                              sails.log("token not found");
                              return tousercb();
                            }

                            var mediadata = {};
                            mediadata['mediatitle'] = fromusername+' created this group';
                            mediadata['sender'] = fromusername;
                            mediadata['actions'] = 'headeraddedinnewgroup';
                            mediadata['mediadata'] = fromusername+' created this group';
                            mediadata['chatid'] = objchat.id;
                            mediadata['groupid'] = groupid;
                            mediadata['mediatype'] = objchat.mediatype;
                            mediadata['notificationtype'] = objchat.chattype;
                            mediadata['groupname']=createdgroup.groupname;
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
                        actions: "headeraddedinnewgroup",
                        groupid: groupid,
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
          } else {
            sendmessagecb();
          }
        },
      ],
      function (err, finalresult) {
        if (err)
          res.serverError({
            message: sails.config.localised.responses.somethingwentwrong,
            err
          });
        else {
          if (isgroupexist) {
            res.send({
              data: createdgroup,
              message: sails.config.localised.groups.groupcreatesuccess
            });
          } else {
            res.send({
              data: createdgroup,
              message: sails.config.localised.groups.groupcreatesuccess
            });
          }
        }
      }
    );
  },

  updateGroupName: function (req, res) {

    var params = eval(req.body);

    var userid = params.userid;
    var groupid = params.groupid;

    var createdgroup;

    delete params.userid;
    delete params.groupid;

    var fromusername;
    var isgroupexist = false;
    var objeGroupMessage,groupDetail;
    var headerName="headergroupnamechange";
    var groupchange="groupnamechange";

    async.series([
      function (getGroupCB) {
        UserGroup.find({
          id: groupid
        }).populateAll().exec(function (err, getGroup) {
          if (err) {
            return getGroupCB(err);
          }
          console.log("getGroup", getGroup);
          if (!getGroup || getGroup.length <= 0) {

            return res.serverError({
              message: sails.config.localised.groups.groupnotexist,
              err
            });
          }
          groupDetail = getGroup[0];
          getGroupCB();
        });
      },
      function (uploadImageCb) {
        if (req._fileparser.upstreams.length) {
          headerName="headergroupimagechange";
          groupchange="groupimagechange";

          var folderPath = sails.config.paths.public;
          var imagePath = "/upload/" + groupDetail.creator + "/groups";
          var UserImagePath = "";
          var newfilename = "";

          newfilename = moment().utc().unix() + "_" + req.file('usergroupmedia')._files[0].stream.filename;
          var newthumbfilename = moment().utc().unix() + "_thumb_" + req.file('usergroupmedia')._files[0].stream.filename;
          if (groupDetail.groupimage && groupDetail.groupimage != '' && fs.existsSync(folderPath + groupDetail.groupimage)) {
            fs.unlink(folderPath + groupDetail.groupimage);
          }
          if (groupDetail.groupthumbimage && groupDetail.groupthumbimage != '' && fs.existsSync(folderPath + groupDetail.groupthumbimage)) {
            fs.unlink(folderPath + groupDetail.groupthumbimage);
          }
          req.file('usergroupmedia').upload({
            maxBytes: 10000000,
            saveAs: newfilename,
            dirname: folderPath + imagePath
          }, function whenDone(err, uploadedFiles) {
            if (err) {
              return res.negotiate(err);
            }
            params['groupimage'] = imagePath + "/" + newfilename;
            // reqData['groupthumbimage'] = imagePath + "/" + newfilename;
            var imageuploadedPath = sails.config.paths.public + imagePath + "/" + newfilename;

            var imgthumb = sails.config.paths.public + imagePath + '/' + newthumbfilename;

            gm(imageuploadedPath)
              .resize(sails.config.const.imageratio.width, sails.config.const.imageratio.height, '^')
              .write(imgthumb, function (err) {
                //console.log("err image",err);
                if (!err) {
                  params['groupthumbimage'] = imagePath + "/" + newthumbfilename
                }
                uploadImageCb();
              });

          });
        } else {
          uploadImageCb();
        }
      },
        function (updategroup) {
          sails.log("Update Group");

          UserGroup.update({
            id: groupid
          }, params).exec(function afterwards(err, groupData) {
            if (err) {
              sails.log("Update error : ", err);
              updategroup(err);
            }

            if (typeof groupData != "undefined" && groupData.length > 0) {
              updategroup();
            } else {}
          });
        },
        function (groupdata) {
          setTimeout(
            function () {
              UserGroup.find({
                  id: groupid
                })
                .populateAll()
                .exec(function afterwards(err, objgroup) {
                  if (err) {
                    return groupdata(err);
                  }
                  if (typeof objgroup != "undefined" && objgroup.length > 0) {
                    createdgroup = objgroup[0];
                    isgroupexist = true;
                    groupdata();
                  } else {
                    groupdata();
                  }
                });
            },
            1000
          );
        },
        function (fromusercb) {
          if (!isgroupexist) {
            fromusercb();
            return;
          }
          sails.log("From user");

          User.find(userid)
            .exec(function afterwards(err, users) {
              if (err) {
                fromusercb(err);
              }
              if (typeof users != "undefined" && users.length > 0) {
                fromusername = users[0].fullName();
                if (!fromusername)
                  fromusername = users[0].mobilenumber;

                fromusercb();
              } else {
                fromusercb(err);
              }
            });
        },
        function (creategroupmessagecb) {

          if (!isgroupexist) {
            creategroupmessagecb();
            return;
          }
          sails.log("Create group message");

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
        function (sendmessagecb) {

          if (isgroupexist) {

            sails.log("Send messages");

            var users = createdgroup.users;

            sails.log("Users ", users);

            var reqchatData = {};
            reqchatData['fromuser'] = userid;
            reqchatData.groupid = groupid;
            reqchatData.messagestatus = 'sent';
            reqchatData.mediatype = 'text';
            reqchatData.ischatheader = true;
            reqchatData.chattype = 'groupchat';
            reqchatData.chatheadertype = groupchange;
            reqchatData.actionsby = userid;
            reqchatData.actionon = userid;
            if(headerName=="headergroupimagechange")
            {
              reqchatData.groupimage=createdgroup.groupimage;
              reqchatData.groupthumbimage=createdgroup.groupthumbimage;
            }
            reqchatData.groupname=createdgroup.groupname;
            async.eachSeries(users, function (user, cb) {

              reqchatData.touser = user.id;
              reqchatData.messagegroup = objeGroupMessage;
              var objchat,fromusernames;
              var mediadata = {};
              if(userid==user.id)
                fromusernames="You";
              else
                fromusernames=fromusername;

              if(headerName=="headergroupimagechange")
                mediadata['mediadata'] = fromusernames+' changed the group image';
              else
                mediadata['mediadata'] = fromusernames+' changed the group name to '+createdgroup.groupname;

              reqchatData.mediadata = mediadata['mediadata'];

              async.series([
                  function (createchatcb) {
                    Chat.create(
                      reqchatData
                    ).exec(function (err, newchat) {
                      if (err) {
                        sails.log("Chat Object err ", err);
                        createchatcb(err);
                      }
                      objchat = newchat;
                      sails.log("Chat Object ", objchat);
                      createchatcb();
                    });
                  },
                  function (tousercb) {
                    if (!user.socketid) {
                      if (userid != user.id) {
                        MuteGroup.find({
                          groupid: createdgroup.id,
                          userid: user.id
                        }).exec(function (err, objMuteGroup) {
                          if (err)
                            return tousercb(err);

                          if (typeof objMuteGroup != "undefined" && objMuteGroup.length > 0) {
                            sails.log("group muted for this user");
                            tousercb();
                          } else {
                            sails.log("send message to user");

                            if (!user.devicetoken) {
                              sails.log("token not found");
                              return tousercb();
                            }

                            mediadata['mediatitle'] = createdgroup.groupname;
                            mediadata['sender'] = fromusername;
                            mediadata['actions'] = headerName;
                            mediadata['chatid'] = objchat.id;
                            mediadata['groupid'] = groupid;
                            mediadata['mediatype'] = objchat.mediatype;
                            mediadata['notificationtype'] = objchat.chattype;
                            mediadata['groupname']=createdgroup.groupname;

                            sails.log("call updateusername notification==>",mediadata);

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
                      sails.log("call updateusername socket==>");


                      User.message(user.id, {
                        actions: headerName,
                        groupid: groupid,
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
          } else {
            sendmessagecb();
          }
        },
      ],
      function (err, finalresult) {
        if (err)
          res.serverError({
            message: sails.config.localised.responses.somethingwentwrong,
            err
          });
        else {
          if (isgroupexist) {
            res.send({
              data: createdgroup,
              message: sails.config.localised.groups.groupcreatesuccess
            });
          } else {
            res.send({
              data: createdgroup,
              message: sails.config.localised.groups.groupcreatesuccess
            });
          }
        }
      }
    );
  },

  getGroups: function (req, res) {

    UserGroup.find()
      .populateAll()
      .exec(function afterwards(err, groups) {
        if (err) {
          res.serverError({
            message: sails.config.localised.responses.somethingwentwrong,
            err
          });
        }
        UserGroup.subscribe(req, _.pluck(groups, 'id'), ['destroy', 'update', 'add:users', 'remove:users']);
        res.send({
          data: groups,
          message: sails.config.localised.groups.groupfetchsuccess
        });
      });
  },

  getGroupsDetail: function (req, res) {

    var groupid = req.param("groupid");
    var userid = req.param("userid");

    if (!groupid) {
      sails.log("Group id not set");
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.groupidrequired
      });
    }

    UserGroup.find({
        id: groupid
      })
      .populateAll()
      .exec(function afterwards(err, group) {
        if (err) {
          sails.log("Group fetch error");
          return res.serverError({
            message: sails.config.localised.responses.somethingwentwrong,
            err
          });
        }

        if (typeof group != "undefined" && group.length > 0) {
          if (userid) {
            User.message(userid, {
              actions: "groupdetail",
              actionsdata: group[0]
            });
          }
          res.send({
            data: group[0],
            message: sails.config.localised.groups.groupfetchsuccess
          });
        } else {
          sails.log("Group with id not exist");
          return res.send({
            data: {},
            message: sails.config.localised.groups.groupnotexist
          });
        }
      });
  },

  // Special call to subscribe to group messages for new group only

  getNewGroupDetail: function (req, res) {

    var groupid = req.param("groupid");
    var userid = req.param("userid");
	var flag=req.param("flag");

    if (!groupid) {
      sails.log("Group id not set");
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.groupidrequired
      });
    }

    UserGroup.find({
        id: groupid
      })
      .populateAll()
      .exec(function afterwards(err, group) {
        if (err) {
          sails.log("Group fetch error");
          return res.serverError({
            message: sails.config.localised.responses.somethingwentwrong,
            err
          });
        }

        if (typeof group != "undefined" && group.length > 0) {
          if (userid && flag) {
            User.message(userid, {
              actions: "groupdetail",
			  actionsdata: group[0],
			  userflag:flag
            });
		  }
		  else{
			User.message(userid, {
				actions: "groupdetail",
				actionsdata: group[0]
			  });
		  }
          UserGroup.subscribe(req, groupid, ['message']);
          res.send({
            data: group[0],
            message: sails.config.localised.groups.groupfetchsuccess
          });
        } else {
          sails.log("Group with id not exist");
          return res.send({
            data: {},
            message: sails.config.localised.groups.groupnotexist
          });
        }
      });
  },

  muteUserGroup: function (req, res) {

    var groupid = req.param("groupid");
    var userid = req.param("userid");
    sails.log("Group in id", groupid);

    if (!groupid) {
      sails.log("Group id not set");
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.groupidrequired
      });
    }

    if (!userid) {
      sails.log("User id not set");
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.useridrequired
      });
    }

    MuteGroup.find({
      groupid: groupid,
      userid: userid
    }).exec(function (err, objMuteGroup) {
      if (err) {
        return res.serverError({
          message: sails.config.localised.responses.servererror,
          err
        });
      }

      if (typeof objMuteGroup != "undefined" && objMuteGroup.length > 0) {
        MuteGroup.destroy({
          id: objMuteGroup[0].id
        }).exec(function (err, destroyedobj) {
          if (err) {
            return res.serverError({
              message: sails.config.localised.responses.servererror,
              err
            });
          }

          User.message(userid, {
            actions: 'groupMute',
            actionsdata: {
              userid: userid,
              groupid: groupid,
              kind: 'unmuted'
            }
          });
          res.send({
            message: sails.config.localised.groups.groupunmutesuccess
          });
        });
      } else {
        MuteGroup.create({
          groupid: groupid,
          userid: userid
        }).exec(function (err, newmodel) {
          if (err) {
            return res.serverError({
              message: sails.config.localised.responses.servererror,
              err
            });
          }
          if (newmodel) {
            User.message(userid, {
              actions: 'groupMute',
              actionsdata: {
                userid: userid,
                groupid: groupid,
                kind: 'muted'
              }
            });
            res.send({
              message: sails.config.localised.groups.groupmutesuccess
            });
          }
        });
      }
    });
  },

  joinGroup: function (req, res) {

    var params = eval(req.body);
    sails.log("req params ", params);
    var userid = params.userid;
    var groupid = params.groupid;
    var members = params.members;
    sails.log("members",members);

    if (!groupid) {
      sails.log("Group id not set");
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.groupidrequired
      });
    }

    var objGroup;
    var fromusername;
    var isgroupexist = false;
    var objeGroupMessage;

    async.series([
        function (cb) {
          UserGroup.find({
              id: groupid
            })
            .populateAll()
            .exec(function afterwards(err, selgroup) {
              if (err) {
                return res.serverError({
                  message: "Somehting went wrong!",
                  err
                });
              }

              if (typeof selgroup != "undefined" && selgroup.length > 0) {
                UserGroup.subscribe(req, groupid, ['message', 'destroy', 'update', 'add:users', 'remove:users']);
                selgroup[0].users.add(members);
                isgroupexist = true;
                selgroup[0].save(function (err) {
                  cb();
                });
              } else {
                var error = new Error({
                  message: sails.config.localised.groups.groupnotexist
                });
                error.status = 500;
                isgroupexist = false;
                cb(error);
              }
            });
        },
        function (fromusercb) {
          if (!isgroupexist) {
            var error = new Error({
              message: sails.config.localised.groups.groupnotexist
            });
            error.status = 500;
            fromusercb(error);
            return;
          }
          User.find(userid)
            .exec(function afterwards(err, users) {
              if (err) {
                fromusercb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
              }
              if (typeof users != "undefined" && users.length > 0) {

                fromusername = users[0].fullName();

                if (!fromusername)
                  fromusername = users[0].mobilenumber;

                fromusercb();
              } else {
                var error = new Error({
                  message: sails.config.localised.user.usernotexist
                });
                error.status = 500;
                fromusercb(error);
              }
            });
        },
        function (groupdata) {
          if (!isgroupexist) {
            groupdata();
            return;
          }
          setTimeout(
            function () {
              UserGroup.find({
                  id: groupid
                })
                .populateAll()
                .exec(function afterwards(err, objgroup) {
                  if (err) {
                    return groupdata();
                  }
                  objGroup = objgroup[0];
                  groupdata();
                });
            },
            1000
          );
        },
        function (useraddcb) {
          if (!isgroupexist) {
            useraddcb();
            return;
          }

          var users = objGroup.users;

          async.eachSeries(users, function (user, cb) {
            if (!user.socketid) {
              if (!user.devicetoken)
                return cb();

              if (user.userdevice=="iphone")
                  return cb();

              var mediadata = {};
              mediadata['mediatitle'] = fromusername + ' Joined ' + objGroup.groupname;
              mediadata['sender'] = fromusername;
              mediadata['actions'] = "useradded";
              mediadata['groupid'] = objGroup.id;

              pushService.createPushJob({
                user: user,
                mediadata: mediadata
              }, function (err) {
                if (err) {
                  sails.log("Sails error");
                  return cb(err);
                }
                cb();
              });
            } else {
              User.message(user.id, {
                actions: "useradded",
                actionsdata: {
                  userid: userid,
                  groupid: objGroup.id,
                  memberid: params.members
                }
              });
              cb();
            }
          }, function (err) {
            useraddcb();
          });
        },
        function (subscribecb) {

          if (!isgroupexist) {
            subscribecb();
            return;
          }

          var users = objGroup.users;

          setTimeout(
            function () {
              async.eachSeries(members, function (member, cb) {

                var user = _.findWhere(users, {
                  id: member
                });
                if (!user) {
                  subscribecb();
                  return;
                }
                if (!user.socketid) {
                  if (!user.devicetoken)
                    return cb();

                  if (user.userdevice=="iphone")
                      return cb();

                  var mediadata = {};
                  mediadata['mediatitle'] = fromusername + ' Joined ' + objGroup.groupname;
                  mediadata['sender'] = fromusername;
                  mediadata['groupid'] = objGroup.id;
                  mediadata['actions'] = "addedinnewgroup";

                  pushService.createPushJob({
                    user: user,
                    mediadata: mediadata
                  }, function (err) {
                    if (err) {
                      sails.log("Sails error");
                      return cb(err);
                    }
                    cb();
                  });
                } else {
                  User.message(member, {
                    actions: "addedinnewgroup",
                    actionsdata: objGroup
                  });
                  cb();
                }
              }, function (err) {
                subscribecb();
              });
            },
            100
          );
        },
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
        function (sendmessagecb) {
          if (isgroupexist) {
            var users = objGroup.users;

            var reqchatData = {};
            reqchatData['fromuser'] = userid;
            reqchatData.groupid = groupid;
            reqchatData.messagestatus = 'sent';
            reqchatData.mediatype = 'text';
            reqchatData.ischatheader = true;
            reqchatData.chattype = 'groupchat';

            reqchatData.chatheadertype = 'userjoined';
            reqchatData.actionsby = userid;

            async.eachSeries(members, function (member, membercb) {
              async.eachSeries(users, function (user, cb) {
                reqchatData.touser = user.id;
                reqchatData.actionon = member;
                reqchatData.messagegroup = objeGroupMessage;
                var objchat;
                var usermember = _.findWhere(users, {
                  id: parseInt(member)
                });
                var mediadata = {};
                if(member==user.id)
                mediadata['mediadata']="You added by "+fromusername;
                else
                {
                  var fullname;
                  if(usermember.lastname)
                  fullname=usermember.firstname+' '+usermember.lastname;
                  else
                  fullname=usermember.firstname;

                  mediadata['mediadata']=fullname+" added by "+fromusername;
                }
                reqchatData.mediadata = mediadata['mediadata'];

                async.series([
                    function (createchatcb) {
                      Chat.create(
                        reqchatData
                      ).exec(function (err, newchat) {
                        if (err) {
                          createchatcb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
                        }
                        objchat = newchat;
                        createchatcb();
                      });
                    },
                    function (tousercb) {

                      if (!user.socketid) {
                        if (userid != user.id) {
                          MuteGroup.find({
                            groupid: objGroup.id,
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

                              mediadata['mediatitle'] = objGroup.groupname;
                              mediadata['sender'] = fromusername;
                              mediadata['actions'] = 'headeruseradded';

                              //mediadata['mediadata'] = objchat.mediadata.substr(0, 200);
                              mediadata['chatid'] = objchat.id;
                              mediadata['mediatype'] = objchat.mediatype;
                              mediadata['notificationtype'] = objchat.chattype;
                              mediadata['groupname']=objGroup.groupname;

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
                          actions: "headeruseradded",
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
                membercb();
              });
            }, function (err) {
              sendmessagecb();
            });
          } else {
            sendmessagecb();
          }
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
            message: sails.config.localised.groups.groupjoinsuccess
          });
      });
  },

  leaveGroup: function (req, res) {

    var params = eval(req.body);
    var userid = params.userid;
    var groupid = req.param("groupid");
    var fromusername;
    var isgroupexist = false;

    if (!groupid) {
      sails.log("Group id not set");
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.groupidrequired
      });
    }

    var objGroup;
    var objeGroupMessage;

    async.series([
        function (cb) {
          UserGroup.find({
              id: groupid
            })
            .populateAll()
            .exec(function afterwards(err, selgroup) {
              if (err) {
                return res.serverError({
                  message: "Somehting went wrong!",
                  err
                });
              }
              if (typeof selgroup != "undefined" && selgroup.length > 0) {
                UserGroup.subscribe(req, groupid, ['message', 'destroy', 'update', 'add:users', 'remove:users']);
                selgroup[0].users.remove(userid);
                objGroup = selgroup[0];
                isgroupexist = true;
                selgroup[0].save(function (err) {
                  cb();
                });
              } else {
                var error = new Error({
                  message: sails.config.localised.groups.groupnotexist
                });
                error.status = 500;
                isgroupexist = false;
                cb(error);
              }
            });
        },
        function (fromusercb) {
          if (!isgroupexist) {
            fromusercb();
            return;
          }
          User.find(userid)
            .exec(function afterwards(err, users) {
              if (err) {
                fromusercb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
              }
              if (typeof users != "undefined" && users.length > 0) {

                fromusername = users[0].fullName();

                if (!fromusername)
                  fromusername = users[0].mobilenumber;

                var reqchatData = {};
                reqchatData['fromuser'] = userid;
                reqchatData.groupid = groupid;
                reqchatData.messagestatus = 'sent';
                reqchatData.mediatype = 'text';
                reqchatData.ischatheader = true;
                reqchatData.chattype = 'groupchat';
                reqchatData.mediadata = 'You left ' + objGroup.groupname;
                reqchatData.chatheadertype = 'userleft';
                reqchatData.actionsby = userid;
                reqchatData.actionon = userid;
                reqchatData.touser = userid;

                Chat.create(
                  reqchatData
                ).exec(function (err, newchat) {
                  if (err) {
                    fromusercb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
                  }
                  User.message(userid, {
                    actions: "headeruserleft",
                    actionsdata: newchat
                  });
                  fromusercb();
                });
              } else {
                fromusercb(err);
              }
            });
        },
        function (groupdata) {
          if (!isgroupexist) {
            groupdata();
            return;
          }
          setTimeout(
            function () {
              UserGroup.find({
                  id: groupid
                })
                .populateAll()
                .exec(function afterwards(err, objgroup) {
                  if (err) {
                    return groupdata();
                  }
                  objGroup = objgroup[0];
                  groupdata();
                });
            },
            1000
          );
        },
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
        function (sendmessagecb) {

          if (isgroupexist) {
            var users = objGroup.users;

            var reqchatData = {};
            reqchatData['fromuser'] = userid;
            reqchatData.groupid = groupid;
            reqchatData.messagestatus = 'sent';
            reqchatData.mediatype = 'text';
            reqchatData.ischatheader = true;
            reqchatData.chattype = 'groupchat';
            reqchatData.mediadata = fromusername+' left';
            reqchatData.chatheadertype = 'userleft';
            reqchatData.actionsby = userid;
            reqchatData.actionon = userid;

            async.eachSeries(users, function (user, cb) {
              reqchatData.touser = user.id;
              reqchatData.messagegroup = objeGroupMessage;
              var objchat;

              async.series([
                  function (createchatcb) {
                    Chat.create(
                      reqchatData
                    ).exec(function (err, newchat) {
                      if (err) {
                        createchatcb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
                      }
                      objchat = newchat;
                      createchatcb();
                    });
                  },
                  function (tousercb) {

                    if (!user.socketid) {

                      if (userid != user.id) {
                        MuteGroup.find({
                          groupid: objGroup.id,
                          userid: user.id
                        }).exec(function (err, objMuteGroup) {
                          if (err)
                            return tousercb(err);

                          if (typeof objMuteGroup != "undefined" && objMuteGroup.length > 0) {
                            sails.log("group muted for this user");
                            tousercb();
                          } else {
                            sails.log("send message to user");

                            if (!user.devicetoken) {
                              sails.log("token not found");
                              return tousercb();
                            }

                            var mediadata = {};
                            mediadata['mediatitle'] = fromusername + ' left ' + objGroup.groupname;
                            mediadata['sender'] = fromusername;
                            mediadata['groupid'] = objGroup.id;
                            mediadata['actions'] = "headeruserleft";
                            mediadata['mediadata'] = fromusername+' left';
                            mediadata['chatid'] = objchat.id;
                            mediadata['mediatype'] = objchat.mediatype;
                            mediadata['notificationtype'] = objchat.chattype;
                            mediadata['groupname'] = objGroup.groupname;

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
                        actions: "headeruserleft",
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
          } else {
            sendmessagecb();
          }
        }
      ],
      function (err, finalresult) {
        if (err)
          res.serverError({
            message: sails.config.localised.responses.somethingwentwrong,
            err
          });
        else
          res.send({
            message: sails.config.localised.groups.groupleavesuccess
          });
      });
  },

  removedfromGroup: function (req, res) {

    var params = eval(req.body);
    var userid = params.userid;
    var memberid = params.memberid;
    var groupid = req.param("groupid");
    var fromusername;
    var removedmembername;

    if (!groupid) {
      sails.log("Group id not set");
      return res.badRequest({
        data: "",
        message: sails.config.localised.commonvalidation.groupidrequired
      });
    }
    sails.log("User " + memberid + " want to leave group with id " + groupid + "params" + params);
    var objGroup;
    var isgroupexist = false;

    async.series([
        function (cb) {
          UserGroup.find({
              id: groupid
            })
            .populateAll()
            .exec(function afterwards(err, selgroup) {
              if (err) {
                return res.serverError({
                  message: "Somehting went wrong!",
                  err
                });
              }

              if (typeof selgroup != "undefined" && selgroup.length > 0) {
                UserGroup.subscribe(req, groupid, ['message', 'destroy', 'update', 'add:users', 'remove:users']);
                selgroup[0].users.remove(memberid);
                isgroupexist = true;
                objGroup = selgroup[0];
                selgroup[0].save(function (err) {

                  cb();
                });
              } else {
                var error = new Error({
                  message: sails.config.localised.groups.groupnotexist
                });
                error.status = 500;
                isgroupexist = false;
                cb(error);
              }
            });
        },
        function (fromusercb) {
          if (!isgroupexist) {
            fromusercb();
            return;
          }
          User.find(userid)
            .exec(function afterwards(err, users) {
              if (err) {
                fromusercb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
              }
              if (typeof users != "undefined" && users.length > 0) {

                fromusername = users[0].fullName();
                if (!fromusername)
                  fromusername = users[0].mobilenumber;

                fromusercb();
              } else {
                fromusercb(err);
              }
            });
        },
        function (groupdata) {

          if (!isgroupexist) {
            groupdata();
            return;
          }

          setTimeout(
            function () {
              UserGroup.find({
                  id: groupid
                })
                .populateAll()
                .exec(function afterwards(err, objgroup) {
                  if (err) {
                    return groupdata();
                  }
                  objGroup = objgroup[0];
                  groupdata();
                });
            },
            1000
          );
        },
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
        function (removedcb) {
          if (!isgroupexist) {
            removedcb();
            return;
          }
          User.find(memberid)
            .exec(function afterwards(err, users) {
              if (err) {
                removedcb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
              }
              if (typeof users != "undefined" && users.length > 0) {

                removedmembername = users[0].fullName();

                if (!removedmembername)
                  removedmembername = users[0].mobilenumber;

                var user = users[0];

                var reqchatData = {};
                reqchatData['fromuser'] = userid;
                reqchatData.groupid = groupid;
                reqchatData.messagestatus = 'sent';
                reqchatData.mediatype = 'text';
                reqchatData.ischatheader = true;
                reqchatData.chattype = 'groupchat';
                reqchatData.mediadata = "you removed by "+fromusername;
                reqchatData.chatheadertype = 'userremoved';
                reqchatData.actionsby = userid;
                reqchatData.actionon = memberid;
                reqchatData.touser = memberid;
                reqchatData.messagegroup = objeGroupMessage;
                var objchat;

                Chat.create(
                  reqchatData
                ).exec(function (err, newchat) {
                  if (err) {
                    removedcb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
                  }

                  objchat = newchat;

                  if (!user.socketid) {

                    if (!user.devicetoken)
                      return removedcb();

                    var mediadata = {};
                    //mediadata['mediatitle'] = removedmembername + ' had removed by ' + fromusername + ' @ ' + objGroup.groupname;
                    mediadata['mediatitle'] = "you removed by "+fromusername;
                    mediadata['sender'] = fromusername;
                    mediadata['groupid'] = objGroup.id;
                    mediadata['actions'] = "headeruserremoved";
                    mediadata['chatid'] = objchat.id;
                    mediadata['mediatype'] = objchat.mediatype;
                    mediadata['notificationtype'] = objchat.chattype;
                    mediadata['mediadata']="you removed by "+fromusername;
                    mediadata['groupname'] = objGroup.groupname;

                    pushService.createPushJob({
                      user: user,
                      mediadata: mediadata
                    }, function (err) {
                      if (err) {
                        sails.log("Sails error");
                        return removedcb(err);
                      }
                      removedcb();
                    });
                  } else {
                    User.message(memberid, {
                      actions: "headeruserremoved",
                      actionsdata: objchat
                    });
                    removedcb();
                  }
                });
              } else {
                removedcb(err);
              }
            });
        },
        function (sendmessagecb) {
          if (isgroupexist) {
            var users = objGroup.users;

            var reqchatData = {};
            reqchatData['fromuser'] = userid;
            reqchatData.groupid = groupid;
            reqchatData.messagestatus = 'sent';
            reqchatData.mediatype = 'text';
            reqchatData.ischatheader = true;
            reqchatData.chattype = 'groupchat';
            reqchatData.mediadata = removedmembername + ' removed by ' + fromusername;
            reqchatData.chatheadertype = 'userremoved';
            reqchatData.actionsby = userid;
            reqchatData.actionon = memberid;

            async.eachSeries(users, function (user, cb) {
              reqchatData.touser = user.id;
              reqchatData.messagegroup = objeGroupMessage;
              var objchat;

              async.series([
                  function (createchatcb) {
                    Chat.create(
                      reqchatData
                    ).exec(function (err, newchat) {
                      if (err) {
                        createchatcb(err); //return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
                      }
                      objchat = newchat;
                      createchatcb();
                    });
                  },
                  function (tousercb) {

                    if (!user.socketid) {

                      if (userid != user.id) {
                        MuteGroup.find({
                          groupid: objGroup.id,
                          userid: user.id
                        }).exec(function (err, objMuteGroup) {
                          if (err)
                            return tousercb(err);

                          if (typeof objMuteGroup != "undefined" && objMuteGroup.length > 0) {
                            sails.log("group muted for this user");
                            tousercb();
                          } else {
                            sails.log("send message to user");

                            if (!user.devicetoken) {
                              sails.log("token not found");
                              return tousercb();
                            }

                            var mediadata = {};
                            mediadata['mediatitle'] = removedmembername + ' removed by ' + fromusername;
                            mediadata['sender'] = fromusername;
                            mediadata['groupid'] = objGroup.id;
                            mediadata['actions'] = "headeruserremoved";
                            //mediadata['mediadata'] = objchat.mediadata.substr(0, 200);
                            mediadata['mediadata'] = removedmembername + ' removed by ' + fromusername;
                            mediadata['chatid'] = objchat.id;
                            mediadata['mediatype'] = objchat.mediatype;
                            mediadata['notificationtype'] = objchat.chattype;
                            mediadata['groupname'] = objGroup.groupname;
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
                        actions: "headeruserremoved",
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
          } else {
            sendmessagecb();
          }
        }
      ],
      function (err, finalresult) {
        if (err)
          res.serverError({
            message: sails.config.localised.responses.somethingwentwrong,
            err
          });
        else
          res.send({
            message: sails.config.localised.groups.groupremovedsuccess
          });
      });
  }
};
