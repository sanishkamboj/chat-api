/**
 * UsersettingController
 *
 * @description :: Server-side logic for managing usersettings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    UserSettings: function (req, res) {
        var userid = req.param("userid");

        if (!userid)
            return res.badRequest({
                data: "",
                message: sails.config.localised.commonvalidation.useridrequired
            });

        var user;
        var reqData = eval(req.body);

        UserSettings.updateOrCreate({ userid: userid }, reqData)
            .then((objSettings) => {
                if (userid) {
                    User.message(userid, {
                        actions: 'usersetting',
                        actionsdata: {
                            userid: userid,
                            usersettings: objSettings
                        }
                    });
                }
                res.send({ message: sails.config.localised.usersettings.usersettingsaddsuccess, userid: userid, data: objSettings });
            })
            .catch(sails.log.error);
    },

    GetUserSettings: function (req, res) {

        var reqData = eval(req.body);
        var userid = req.param("userid");

        delete reqData.userid;

        if (!userid)
            return res.badRequest({
                data: "",
                message: sails.config.localised.commonvalidation.useridrequired
            });

        UserSettings.find(
            { userid: userid }
        ).exec(function (err, objSettings) {
            if (err) {
                return res.badRequest({
                    data: "",
                    error: sails.config.localised.usersettings.usersettingsnotexist
                });
            }

            if (typeof result != "undefined" && result.length > 0) {
                if (userid) {
                    User.message(userid, {
                        actions: 'usersetting',
                        actionsdata: {
                            userid: userid,
                            usersettings: objSettings[0]
                        }
                    });
                }
                res.send({ message: sails.config.localised.usersettings.usersettingsfetchsuccess, userid: userid, data: objSettings[0] });
            }
            else {
                UserSettings.updateOrCreate({ userid: userid }, reqData)
                    .then((objSettings) => {
                        if (userid) {
                            User.message(userid, {
                                actions: 'usersetting',
                                actionsdata: {
                                    userid: userid,
                                    usersettings: objSettings
                                }
                            });
                        }
                        res.send({ message: sails.config.localised.usersettings.usersettingsaddsuccess, userid: userid, data: objSettings });
                    })
                    .catch(sails.log.error);
            }
        });
    },
};

