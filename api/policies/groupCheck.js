module.exports = function (req, res, next) {

        // User is allowed, proceed to the next policy,
        // or if this is the last policy, the controller
        var groupid = req.param("groupid");
        if (req.isSocket) {
            console.log("Req for socket id in group check : ",req.socketid);
        }
        console.log("Request for group id : ",groupid);

        if (!groupid)
        return res.forbidden({
            data: "",
            message: sails.config.localised.commonvalidation.groupidrequired
        });

        UserGroup.find(groupid)
        .exec(function afterwards(err, group) {
            if (err) {
                return res.forbidden({ message: sails.config.localised.responses.somethingwentwrong, err });
            }

            if (typeof group != "undefined" && group.length > 0) {
                return next();
            }
            else {
                return res.forbidden({data: "", message:sails.config.localised.groups.groupnotexist});
            }
        });
    };