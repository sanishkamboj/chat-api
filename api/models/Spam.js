module.exports = {

  attributes: {
    fromuserid: {
      type: 'integer'
    },
    touserid: {
      type: 'integer'
    },
    groupid: {
      type: 'integer'
    },
    description:{
      type:'text',
      defaultsTo:""
    }
  }
};
