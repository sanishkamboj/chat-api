//['seconds', 'minutes', 'hours', 'dayOfMonth', 'month', 'dayOfWeek']
module.exports.cron = {
  myJob: {
    schedule: '*/60 * * * * *',
    onTick: function () {
      async.series([
        function(deleteSpamCb)
        {
        var cquery="SELECT *,COUNT(touserid) as spamcount FROM spam WHERE touserid!='' GROUP BY touserid,id";
        sails.log("cquery",cquery);
        Spam.query(cquery, [], function (err, result) {

          //sails.log("result",result);
          async.eachSeries(result,function(user,cb){
            //console.log("user",user.touserid);
            if(user.spamcount>=sails.config.const.spam24 && user.spamcount < sails.config.const.spampermanent)
            {
              var query="DELETE  FROM `spam` WHERE touserid="+user.touserid+" AND createdAt BETWEEN (CURDATE() - INTERVAL 1 DAY) AND CURDATE() ORDER BY createdAt DESC";
              Spam.query(query,[],function(err,delResult){
                if(delResult.affectedRows==0)
                {
                  cb();
                  return;
                }
                sails.log("call cron updatecall",delResult);
                User.update({id: user.touserid}, {spamstatus:"notblock"}).exec(function afterwards(err, user){
                  if(user[0].socketid)
                  {
                    User.message(user[0].id, {
                      actions: "userstatusupdate",
                      actionsdata: user
                    });
                    cb();
                  }
                  else
                  {
                    var fromusername=user[0].firstname+' '+user[0].lastname;
                    var mediadata = {};
                    mediadata['mediatitle'] = "Your account is unblocked";
                    mediadata['sender'] = fromusername;
                    mediadata['spamstatus'] = user[0].spamstatus;
                    mediadata['actions'] = "userstatusupdate";

                    pushService.createPushJob({
                      user: user[0],
                      mediadata: mediadata
                    }, function (err) {
                      if (err) {
                        sails.log("Sails error");
                        return  cb();
                      }
                      cb();
                    });
                  }
                });
              });
            }
            else
              cb();
          },function(err){
            deleteSpamCb();
          });
        });
      },
      ],
      function(err,result)
      {

      }
    );
    },
    start: true,
    //timezone: 'Ukraine/Kiev',
    // context: undefined, // Custom context for onTick callback
    runOnInit: true // Will fire your onTick function as soon as the requisit initialization has happened.
  }

};
