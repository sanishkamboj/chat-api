module.exports = function (req, res, next) {

    // User is allowed, proceed to the next policy,
    // or if this is the last policy, the controller

    var params = eval(req.body);
    //console.log("publicAuth params : ",params);
    var userid = req.param("userid");
    if (req.isSocket) {
        console.log("Req for socket id: ",req.socketid);
    }

    console.log("Request for user id : ",userid);

    if (!userid)
    return res.forbidden({
        data: "",
        message: sails.config.localised.commonvalidation.useridrequired
    });

    User.find(userid)
    .exec(function afterwards(err, user) {
        if (err) {
            return res.forbidden({ message: sails.config.localised.responses.somethingwentwrong, err });
        }

        if (typeof user != "undefined" && user.length > 0) {
            return next();
        }
        else {
            return res.forbidden({data: "", message:sails.config.localised.user.usernotexist});
        }
    });
};