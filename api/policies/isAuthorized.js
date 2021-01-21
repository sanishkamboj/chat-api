module.exports = function (req, res, next) {
	var token,tokenClone;
  
	if (req.headers && req.headers.authorization) 
	{
	  var parts = req.headers.authorization.split(' ');
	  if (parts.length == 2) 
	  {
		var scheme = parts[0],
		  credentials = parts[1];
  
		if (/^Bearer$/i.test(scheme)) {
		  token = credentials;
		  tokenClone=token;
		}
	  } 
	  else {
		return res.json(401, {message: 'Format is Authorization: Bearer [token]'});
	  }
	} 
	else if (req.param('token')) {
	  token = req.param('token');
	  tokenClone=token;
	  // We delete the token from param to not mess with blueprints
	  delete req.query.token;
	} 
	else if (req.socket && req.socket.handshake && req.socket.handshake.query && req.socket.handshake.query.token) {
		console.log("req.socket.handshake.query.token;",req.socket.handshake.query.token);
		token = req.socket.handshake.query.token;
		tokenClone=token;
	}
	else {
	  return res.json(401, {message: 'No Authorization header was found'});
	}
	
	jwToken.verify(token, function (err, token) {
		console.log("token",token);
	  if (err)
	  {
		  if(err.name=="TokenExpiredError")
		  {
				jwToken.refreshToken(tokenClone,function(result){
					 res.json(200,{token: result});
				 	return;
				});
		  }
		  else
		   		return res.json(401, {message: 'Invalid Token!'});
	  }
	  else
	  {
		req.token = token; // This is the decrypted token or the payload you provided

		User.findOneById(token.id).exec(function(err,result){
			if (err) {
				return res.json(401, { message: 'db error' });
			}

			if (!result)
				return res.json(401, { message: 'Token Missmatch' });

				next();
		});
	 }
	});
  };