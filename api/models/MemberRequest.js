/**
 * MemberRequest.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        groupid: {
            type: 'integer'
        },
        userid: {
            model: 'user'
        },
        requeststatus: {
            type: "string",
            enum: ["requested", "approved", "rejected"],
            defaultsTo: 'offline'
        },
    }
};

