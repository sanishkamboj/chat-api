/**
 * UserGroup.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    autosubscribe: ['destroy', 'update', 'add:users', 'remove:users'],

    attributes: {
        groupname: {
            type: 'string',
            defaultsTo: ""
        },
        creator: {
            type: 'integer'
        },
        socketid: {
            type: 'string',
            defaultsTo: ""
        },
        grouptype: {
            type: 'string',
            defaultsTo: ""
        },
        groupdesc: {
            type: 'string',
            defaultsTo: ""
        },
        groupimage: {
            type: 'string',
            defaultsTo: ""
        },
        groupthumbimage: {
            type: 'string',
            defaultsTo: ""
        },
        isprivate: {
            type: "boolean",
            defaultsTo: false
        },
        ismembercaninvite: {
            type: "boolean",
            defaultsTo: false
        },
        users: {
            collection: "user",
            via: "groups"
        }
    }
};

