module.exports = {

  addUserSpam: function (req, res) {
    var reqData = eval(req.body);
    var spamResult,userStatus;
    var reqDataStatus={};
    async.series([
        function (userCb) {
          if(!reqData.touserid)
          {
            userCb();
            return;
          }
          User.find({id: reqData.touserid}).exec(function (err, result) {
            if (err) {
              res.serverError({
                message: sails.config.localised.responses.servererror
              });
              return;
            }
            if (result.length == 0) {
              userCb({
                message: sails.config.localised.user.usernotexist
              });
              return;
            }
            userStatus=result[0];
            userCb();
          });
        },
        function (spamCb) {
          Spam.create(reqData).exec(function (err, result) {
            if (err) {
              res.serverError({
                message: sails.config.localised.responses.servererror
              });
              return;
            }
            spamResult=result;
            spamCb();
          });
        },
        function(spamCb)
         {
          if(!reqData.touserid)
          {
            spamCb();
            return;
          }
        Spam.count({touserid:reqData.touserid}).exec(function(err,result){
          sails.log("result count",result);
            if(result>=sails.config.const.spam24 && result < sails.config.const.spampermanent)
                reqDataStatus['spamstatus']='24hourblock';
            else if(result>=sails.config.const.spampermanent)
            reqDataStatus['spamstatus']='permanentblock';
            else
            reqDataStatus['spamstatus']="notblock";

            sails.log("reqData spam",reqDataStatus);
            spamCb();
        });
      },
      function (updateusercb) {
        if(!reqData.touserid)
          {
            updateusercb();
            return;
          }
        if(userStatus.spamstatus==reqDataStatus['spamstatus'])
        {
          updateusercb();
          return;
        }
        User.update({
          id: reqData.touserid
        }, reqDataStatus).exec(function afterwards(err, user) {
          if (err) {
            return updateusercb(err);
          }

          if (typeof user != "undefined" && user.length > 0) {
            sails.log("User exist",userStatus.socketid);
            if (userStatus.socketid) {
              sails.log("inside socket");
              updatedUser = user[0];
                  User.message(reqData.touserid, {
                    actions: "userstatusupdate",
                    actionsdata: updatedUser
                  });
                  updateusercb();

            } else {
              if (!user[0].devicetoken) {
                 updateusercb();
                 return;
              }
              console.log("user update",user);
              var updateUserStatus=user[0].spamstatus;
              var mediaTitle;
              if(userStatus.spamstatus==updateUserStatus)
              {
                updateusercb();
                return;
              }
              if(updateUserStatus=="notblock")
                mediaTitle="Your account is unblocked";
              else if(updateUserStatus=="24hourblock")
                mediaTitle="Your account is blocked for 24 hours";
              else
                mediaTitle="Your account is permanently blocked";


              var fromusername=userStatus.firstname+' '+userStatus.lastname;
              var mediadata = {};
              mediadata['mediatitle'] = mediaTitle;
              mediadata['sender'] = fromusername;
              mediadata['spamstatus'] = updateUserStatus;
              mediadata['actions'] = "userstatusupdate";

              pushService.createPushJob({
                user: user[0],
                mediadata: mediadata
              }, function (err) {
                if (err) {
                  sails.log("Sails error");
                  return  updateusercb();
                }
                updateusercb();
              });

            }
          } else {
            updateusercb();
          }
        });
      },
        function(groupCb)
        {
          if(reqData.touserid)
          {
            groupCb();
            return;
          }
          UserGroup.find({id: reqData.groupid}).populateAll().exec(function afterwards(err, selgroup)
          {
            if (err) {
              return res.serverError({
                message: sails.config.localised.responses.servererror
              });
            }

            if (typeof selgroup != "undefined" && selgroup.length > 0) {
                selgroup[0].users.remove(reqData.fromuserid);
                selgroup[0].save(function (err) {
                  groupCb();
                });
             }
            else
              groupCb();

          });
        }
      ],
      function (err, finalresult) {
        if (err)
          res.badRequest(err);
        else
          res.send({
            message: sails.config.localised.spam.spamaddsuccess,
            data: spamResult
          });
      });

  },

  removeSpam:function(req,res)
  {
    var type=req.param("type");
    var fromid=req.param("fromid");
    var toid=req.param("toid");
    var removeData,userStatus;
    var reqDataStatus={};
    async.series([
        function(spamCb)
        {
          var obj={};
          if(type=="group")
          {
            obj['fromuserid']=fromid;
            obj['groupid']=toid;
          }
          else
          {
            obj['fromuserid']=fromid;
            obj['touserid']=toid;
          }
          Spam.destroy(obj).exec(function(err,result){
            if (err) {
              res.serverError({
                message: sails.config.localised.responses.servererror
              });
              return;
            }
            if(result.length==0)
            {
              spamCb({message:sails.config.localised.spam.spamnotfound});
              return;
            }
            removeData=result;
            spamCb();
          });
        },
        function (userCb) {
          if(type=="group")
          {
            userCb();
            return;
          }
          User.find({id:toid}).exec(function (err, result) {
            if (err) {
              res.serverError({
                message: sails.config.localised.responses.servererror
              });
              return;
            }
            if (result.length == 0) {
              userCb({
                message: sails.config.localised.user.usernotexist
              });
              return;
            }
            userStatus=result[0];
            userCb();
          });
        },
        function(spamCb)
        {
          if(type=="group")
         {
           spamCb();
           return;
         }
       Spam.count({touserid:toid}).exec(function(err,result){
           if(result>=sails.config.const.spam24 && result < sails.config.const.spampermanent)
               reqDataStatus['spamstatus']='24hourblock';
           else if(result>=sails.config.const.spampermanent)
           reqDataStatus['spamstatus']='permanentblock';
           else
           reqDataStatus['spamstatus']="notblock";

           spamCb();
       });
     },
     function (updateusercb) {
        if(type=="group")
        {
          updateusercb();
          return;
        }
      if(userStatus.spamstatus==reqDataStatus['spamstatus'])
      {
        updateusercb();
        return;
      }
      User.update({
        id: toid
      }, reqDataStatus).exec(function afterwards(err, user) {
        if (err) {
          return updateusercb(err);
        }

        if (typeof user != "undefined" && user.length > 0) {

          if (userStatus.socketid) {
            sails.log("inside socket");
            updatedUser = user[0];
                User.message(toid, {
                  actions: "userstatusupdate",
                  actionsdata: updatedUser
                });
                updateusercb();

          } else {
            if (!user[0].devicetoken) {
              updateusercb();
              return;
           }
            var updateUserStatus=user[0].spamstatus;
            var mediaTitle;
            if(userStatus.spamstatus==updateUserStatus)
            {
              updateusercb();
              return;
            }
            if(updateUserStatus=="notblock")
              mediaTitle="Your account is unblocked";
            else if(updateUserStatus=="24hourblock")
              mediaTitle="Your account is blocked for 24 hours";
            else
              mediaTitle="Your account is permanently blocked";


            var fromusername=userStatus.firstname+' '+userStatus.lastname;
            var mediadata = {};
            mediadata['mediatitle'] = mediaTitle;
            mediadata['sender'] = fromusername;
            mediadata['spamstatus'] = updateUserStatus;
            mediadata['actions'] = "userstatusupdate";

            pushService.createPushJob({
              user: user[0],
              mediadata: mediadata
            }, function (err) {
              if (err) {
                sails.log("Sails error");
                return  updateusercb();
              }
              updateusercb();
            });

          }
        } else {
          updateusercb();
        }
      });
    },
        // function(groupCb)
        // {
        //   if(type=="user")
        //   {
        //     groupCb();
        //     return;
        //   }
        //   UserGroup.find({id: toid}).populateAll().exec(function afterwards(err, selgroup)
        //   {
        //     if (err) {
        //       return res.serverError({
        //         message: sails.config.localised.responses.servererror
        //       });
        //     }

        //     if (typeof selgroup != "undefined" && selgroup.length > 0) {
        //         selgroup[0].users.add(fromid);
        //         selgroup[0].save(function (err) {
        //           groupCb();
        //         });
        //      }
        //     else
        //       groupCb();

        //   });
        // }
    ],
    function(err,finalresult)
    {
        if(err)
          res.badRequest(err);
        else
          res.send({message: sails.config.localised.spam.spamremovesuccess,data:removeData});
    });
  },

  spamList:function(req,res)
  {
    var userid=req.param("userid");

    Spam.find({fromuserid:userid}).exec(function(err,result){
        if(err)
        {
          return res.serverError({
            message: sails.config.localised.responses.servererror
          });
        }

        if(result.length==0)
        {
            res.send({message:sails.config.localised.spam.spamnotfound});
            return;
        }
        res.send({message:sails.config.localised.spam.spamlist,data:result});
    });
  }


};
