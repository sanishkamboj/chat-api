/**
 * Chat.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        fromuser: {
            type: 'integer'
        },
        touser: {
            type: 'integer'
        },
        groupid: {
            type: 'integer'
        },
        messagegroup: {
            model: 'groupmessage'
        },
        localchatid: {
            type: 'string'
        },
        chattype: {
            type: "string",
            enum: ["normalchat", "privatechat", "groupchat"],
            defaultsTo: 'normalchat'
        },
        ischatheader: {
            type: "boolean",
            defaultsTo: false
        },
        chatheadertype: {
            type: "string",
            enum: ["groupcreate", "userleft", "userremoved","userjoined","groupnamechange","groupimagechange"]
        },
        actionsby: {
            type: 'integer'
        },
        actionon: {
            type: 'integer'
        },
        messagestatus: {
            type: "string",
            enum: ["sent", "delivered", "viewed"],
            defaultsTo: 'sent'
        },
        mediatype: {
            type: 'string',
            enum: ["text", "image", "audio", "video", "contact", "location"],
            defaultsTo: ""
        },
        mediadata: {
            type: 'longtext',
            defaultsTo: ""
        },
        translatedmediadata: {
            type: 'longtext',
            defaultsTo: ""
        },
        translatedlangcode: {
            type: 'longtext',
            defaultsTo: ""
        },
        mediasize: {
            type: 'integer',
            defaultsTo: 0
        },
        imgheight: {
            type: 'integer',
            defaultsTo: 0
        },
        imgwidth: {
            type: 'integer',
            defaultsTo: 0
        },
        groupimage:{
          type:'string',
          defaultsTo:''
        },
        groupthumbimage:{
          type:'string',
          defaultsTo:''
        },
        groupname:{
          type:'string',
          defaultsTo:''
        }

    }
};

