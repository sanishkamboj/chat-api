/**
 * MuteUser.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    muteduserid: {
        type: 'integer'
    },
    userid: {
        type: 'integer'
    },
    ismuted: {
        type: "boolean",
        defaultsTo: true
    }
  }
};

