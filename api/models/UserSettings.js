/**
 * Usersetting.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        userid: {
            type: 'string',
            defaultsTo: ""
        },
        canlocate: {
            type: "boolean",
            defaultsTo: true
        },
        notification: {
            type: "boolean",
            defaultsTo: true
        },

        messagenotification: {
            type: "boolean",
            defaultsTo: true
        },
        messagetone: {
            type: "boolean",
            defaultsTo: true
        },
        messagevibrate: {
            type: "boolean",
            defaultsTo: true
        },

        groupnotification: {
            type: "boolean",
            defaultsTo: true
        },
        grouptone: {
            type: "boolean",
            defaultsTo: true
        },
        groupvibrate: {
            type: "boolean",
            defaultsTo: true
        },

        filtermessages: {
            type: "boolean",
            defaultsTo: true
        },

        imagedownloadoverwifi: {
            type: "boolean",
            defaultsTo: false
        },
        imagedownloadovermobilenet: {
            type: "boolean",
            defaultsTo: false
        },
        imagesavetodevice: {
            type: "boolean",
            defaultsTo: false
        },

        avdownloadoverwifi: {
            type: "boolean",
            defaultsTo: false
        },
        avdownloadovermobilenet: {
            type: "boolean",
            defaultsTo: false
        },
        avsavetodevice: {
            type: "boolean",
            defaultsTo: false
        },

        otherfilesdownloadoverwifi: {
            type: "boolean",
            defaultsTo: false
        },
        otherfilesdownloadovermobilenet: {
            type: "boolean",
            defaultsTo: false
        },
        otherfilessavetodevice: {
            type: "boolean",
            defaultsTo: false
        },

        hidetyping: {
            type: "boolean",
            defaultsTo: false
        },
        myinfo: {
            type: "string",
            enum: ["mycontacts", "anyone", "nobody"],
            defaultsTo: "mycontacts"
        },
        onlinestatus: {
            type: "string",
            enum: ["mycontacts", "anyone", "nobody"],
            defaultsTo: "mycontacts"
        },
        seenstatus: {
            type: "string",
            enum: ["mycontacts", "anyone", "nobody"],
            defaultsTo: "mycontacts"
        },
        lastseen: {
            type: "string",
            enum: ["mycontacts", "anyone", "nobody"],
            defaultsTo: "mycontacts"
        },
        showyourphoto: {
            type: "string",
            enum: ["mycontacts", "anyone", "nobody"],
            defaultsTo: "mycontacts"
        }
    }
};