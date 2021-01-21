var jwt = require('jsonwebtoken');
var tokenSecret = "secretissecet";
//var jwtrefresh = require('jwt-refresh-token');
var jwtrefresh = require('jsonwebtoken-refresh');

module.exports = {
  issue: function (payload) {
    return jwt.sign(
      payload,
      tokenSecret, {
        expiresIn: '365d' // Token Expire time  60, "2 days", "10h", "7d"
      }
    );
  },

  verify: function (token, callback) {
    return jwt.verify(
      token, // The token to be verified
      tokenSecret, // Same token we used to sign
      {},
      //{ignoreExpiration:true}, // No Option, for more see https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
      function (err, decoded) {
        callback(err, decoded);
      }
    );
  },

  refreshToken: function (token, cb) {
    var originalDecoded = jwt.decode(token, {
      complete: true
    });
    var refreshed = jwtrefresh.refresh(originalDecoded, '365d', tokenSecret);
    cb(refreshed);
  }

};
