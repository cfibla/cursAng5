'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta';

exports.ensureAuth = function(req, res, next){
	if(!req.headers.authorization){
		return res.status(403).send({message: 'No Headers'})
	}

	//creamos la variable token y le quitamos las comillas con las REGEXP
	var token = req.headers.authorization.replace(/['"]+/g, '');

	try{
		//decodificamos el token
		var payload = jwt.decode(token, secret);

		//comprobamos si ha expirado
		if (payload.exp <= moment().unix){
			return res.status(401).send({
				message:'TOKEN expirado'
			})
		}

		//si hay excepcion (error)
	}catch(ex){
		return res.status(404).send({
				message:'TOKEN no válido'
			})
	}

	//creamos req.user para pasarle los valores de payload
	//y así poder ver el usuario desde todos métodos de la aplicación
	req.user = payload;

	next();
}