# ConnectSails

a [Sails](http://sailsjs.org) application

for sails queries
LOG_QUERIES=true sails lift

#Reference code for async

async.series([
            function (checkUserCb) {
                    checkUserCb(null, '');
            },
            function (updatecode) {
                    updatecode();
            }],
            function (err, finalresult) {
                if (err)
                    res.serverError({ message: err.message });
                else
                    res.send({ message: sails.config.localised.user.verificationcodesent });
            }
        );

#Reference code for find request data check

        if (typeof user != "undefined" && user.length > 0) {
        }
        else {
        }

#Reference code for find request data check
         var error = new Error({ message: sails.config.localised.user.usernotexist });
         error.status = 500;

#Reference find code

FriendRequest.find(
            { userid: userid }
        ).exec(function (err, objFriendRequests) {
            if (err) { return res.serverError({ message: sails.config.localised.responses.servererror, err }); }

            sails.log("Mute group object", objFriendRequests);
            if (typeof objFriendRequests != "undefined" && objFriendRequests.length > 0) {
                res.json({ data: friendRequest, message: sails.config.localised.friendrequest.friendrequestupdated });
            }
            else {
                res.json({ data: {}, message: sails.config.localised.friendrequest.friendrequestnotfound });
            }
        });