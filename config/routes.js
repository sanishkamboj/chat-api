/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {
  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
   * etc. depending on your default view engine) your home page.              *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  /****** User Routes ******/
  "post /user": {
    controller: "UserController",
    action: "createUser",
  },
  "post /user/mute": {
    controller: "UserController",
    action: "muteUser",
  },
  "get /user/:userid": {
    controller: "UserController",
    action: "getUser",
  },
  "get /user/:userid/:requesteruserid": {
    controller: "UserController",
    action: "getUser",
  },
  "get /user/:userid/:requesteruserid/:flag": {
    controller: "UserController",
    action: "getUser",
  },
  "get /userlist": {
    controller: "UserController",
    action: "getUsers",
  },

  "post /mobileverification": {
    controller: "UserController",
    action: "userMobileVerification",
  },
  "post /verifycode": {
    controller: "UserController",
    action: "verifyCode",
  },
  "get /resendcode/:callortext/:mobileno": {
    controller: "UserController",
    action: "resendVerifyCode",
  },
  "post /profile": {
    controller: "UserController",
    action: "profileUpdate",
  },

  /****** User verification code link ******/
  "get /verificationlink/:verificationcode": {
    controller: "UserController",
    action: "verificationLink",
  },

  /****** Contacts Routes ******/
  "post /contacts": {
    controller: "ContactController",
    action: "addContacts",
  },
  "get /contacts/:userid": {
    controller: "ContactController",
    action: "getContacts",
  },
  "post /invites": {
    controller: "ContactController",
    action: "inviteContacts",
  },

  /****** User Settings Routes ******/
  "post /usersettings": {
    controller: "UserSettingsController",
    action: "UserSettings",
  },
  "get /usersettings/:userid": {
    controller: "UserSettingsController",
    action: "GetUserSettings",
  },

  /****** Messagelists Routes ******/
  "get /messagelists": {
    controller: "MessagelistController",
    action: "messageLists",
  },

  /****** Twilio call response generate ******/
  "/twiliovoicecode/:verificationcode": {
    controller: "MessagelistController",
    action: "twiliocallresponse",
  },

  /****** Extra Routes for testing ******/
  "post /testingfuction": {
    controller: "MessagelistController",
    action: "testcode",
  },
  "post /notification": {
    controller: "MessagelistController",
    action: "sendNotification",
  },
  "post /user/devicetoken": {
    controller: "UserController",
    action: "UpdatedeviceToken",
  },
  "post /user/refreshdevicetoken": {
    controller: "UserController",
    action: "RefreshdeviceToken",
  },
  "get /currencycodelist": {
    controller: "MessagelistController",
    action: "currencyCodeLists",
  },

  /****** Group Routes ******/
  "post /usergroup": {
    controller: "UserGroupController",
    action: "createGroup",
  },
  "get /usergroup/:groupid": {
    controller: "UserGroupController",
    action: "getGroupsDetail",
  },
  "get /usergroup/:groupid/:userid": {
    controller: "UserGroupController",
    action: "getGroupsDetail",
  },
  "get /new/usergroup/:groupid": {
    controller: "UserGroupController",
    action: "getNewGroupDetail",
  },
  "get /new/usergroup/:groupid/:userid": {
    controller: "UserGroupController",
    action: "getNewGroupDetail",
  },
  "get /new/usergroup/:groupid/:userid/:flag": {
    controller: "UserGroupController",
    action: "getNewGroupDetail",
  },
  "get /usergroups/:userid": {
    controller: "UserGroupController",
    action: "getGroups",
  },
  "put /usergroup": {
    controller: "UserGroupController",
    action: "joinGroup",
  },
  "put /usergroupnameupdate": {
    controller: "UserGroupController",
    action: "updateGroupName",
  },
  "put /usergroup/leave": {
    controller: "UserGroupController",
    action: "leaveGroup",
  },
  "put /usergroup/removed": {
    controller: "UserGroupController",
    action: "removedfromGroup",
  },
  "post /usergroup/mute": {
    controller: "UserGroupController",
    action: "muteUserGroup",
  },

  /***************************************************************************
   *                                                                          *
   * Sockets routes                                                              *
   *                                                                          *
   ***************************************************************************/

  /****** User Routes ******/
  "post /updateuserstatus": {
    controller: "UserController",
    action: "updateUserStatus",
  },
  "get /onlineuser/:userid": {
    controller: "UserController",
    action: "getOnlineUsers",
  },
  "post /userblock": {
    controller: "UserController",
    action: "blockUser",
  },
  "get /usermuteblock/:userid": {
    controller: "UserController",
    action: "blockedUserList",
  },

  /****** Chat Routes ******/
  "post /chat/privatemessage": {
    controller: "ChatController",
    action: "privateMessage",
  },
  "post /chat/privatemessagestatus": {
    controller: "ChatController",
    action: "privateMessageStatus",
  },
  "post /chat/multiplemessagestatus": {
    controller: "ChatController",
    action: "multipleMessageStatus",
  },
  "post /chat/multiplemessagestatusupdate": {
    controller: "ChatController",
    action: "multipleMessageStatusforUser",
  },
  "post /chat/usertyping": {
    controller: "ChatController",
    action: "userTyping",
  },
  "post /chat/detail": {
    controller: "ChatController",
    action: "chatDetail",
  },
  "post /chat/history": {
    controller: "ChatController",
    action: "chatHistory",
  },
  "post /chat/groupmessage": {
    controller: "ChatController",
    action: "groupMessage",
  },
  "post /chat/grouptyping": {
    controller: "ChatController",
    action: "groupMessageTyping",
  },
  "post /chat/groupmessagedetail": {
    controller: "ChatController",
    action: "getGroupMessage",
  },
  "post /refreshtoken": {
    controller: "UserController",
    action: "refreshToken",
  },

  "post /spam": {
    controller: "SpamController",
    action: "addUserSpam",
  },
  "delete /spam": {
    controller: "SpamController",
    action: "removeSpam",
  },
  "get /spam/:userid": {
    controller: "SpamController",
    action: "spamList",
  },
  /******** disable image uploading in chat ********/
  // "post /chat/chatmedia": {
  //     controller: "ChatController",
  //     action: "mediaUpload",
  // },

  "post /laraveluserdelete": {
    controller: "UserController",
    action: "laravelUserDelete",
  },

  "get /language": {
    controller: "LanguageController",
    action: "languageAdd",
  },
  "get /languagelist": {
    controller: "LanguageController",
    action: "languageList",
  },
  "get /userlanguage": {
    controller: "LanguageController",
    action: "userLanguageUpdate",
  },

  "/": {
    view: "homepage",
  },

  /***************************************************************************
   *                                                                          *
   * Custom routes here...                                                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the custom routes above, it   *
   * is matched against Sails route blueprints. See `config/blueprints.js`    *
   * for configuration options and examples.                                  *
   *                                                                          *
   ***************************************************************************/
};
