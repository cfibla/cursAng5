'use strict'

//modulos
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');

//modelos
var User = require('../models/user');

//sevicio JWT
var jwt = require('../services/jwt');


function pruebas (req, res){
	res.status(200).send({
		message:'Hola desde el UserController',
		user: req.user
	})
};
//Método para REGISTRAR NUEVOS USUARIOS
function saveUser (req, res){

	//Crear objeto usuario
	var user = new User();

	//Recoger los parametros de la peticion
	var params = req.body;

	if (params.password && params.name && params.surname && params.email) {
		//asignar valores al objeto usuario
		user.name = params.name;
		user.surname = params.surname;
		user.email = params.email;
		user.role = 'ROLE_USER';
		user.image = null;

		User.findOne({email: user.email.toLowerCase()}, (err, issetUser) => {
			if(err){
				res.status(500).send({message:'Error al comprobar USER'});
			} else {
				if (!issetUser){
					//Cifrar contraseña
					bcrypt.hash(params.password, null, null, function (err, hash){
						user.password = hash;

						//Guardar usuario en BD
						user.save((err, userStored) => {
							if (err){
								res.status(500).send({message:'Error al guardar USER'});
							} else {
								if(!userStored){
									res.status(404).send({message:'USER no encontrado'});
								} else {
									res.status(200).send({user: userStored});
								}
							}
						});
					});
				} else {
					res.status(200).send({
						message: 'USER existente'
					})
				}
			}
		});

	} else {
		res.status(200).send({
			message: 'Los datos no son correctos'
		})
	}

};


//Método para LOGIN
function login(req, res){
	var params = req.body;

	var email = params.email;
	var password = params.password;

	User.findOne({email: email.toLowerCase()}, (err, issetUser) => {
		if(err){
			res.status(500).send({message:'Error al comprobar USER'});
		} else {
			if (issetUser){
				bcrypt.compare(password, issetUser.password, (err, check) => {
					if (check){
						//Comprobar token
						if(params.gettoken){
							//crear y devolver token JWT
							res.status(200).send({
								token: jwt.createToken(issetUser)
							});
						} else {
							res.status(200).send({user: issetUser});
						}						
					} else {
					res.status(404).send({
						message: 'PASSWORD incorrecta'
					})
					}
				})
			} else {
				res.status(404).send({
					message: 'USER inexistente'
				})
			}
		}
	});
}


//Método para UPDATE
function updateUser (req, res){
	var userId = req.params.id;
	var update = req.body;
	delete update.password;

	if (userId != req.user.sub){
		return res.status(500).send({
			message:'Permiso denegado'
		});
	}

	User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated) => {
		if (err){
			res.status(500).send({
				message:'Error al actualizar user'
			});
		} else {
			if(!userUpdated){
				res.status(404).send({
					message:'No se ha podido actualizar user'
				}) 
				} else {
					res.status(200).send({user:userUpdated})
			}
		}
	})
}

//Método para subir archivos
function uploadImage(req, res){
	var userId = req.params.id;
	var file_name = 'No subido...';

	if(req.files){
		//PRIMERO: Saber el nombre del fichero
		var file_path = req.files.image.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];

		//SEGUNDO: Saber la expensión del fichero
		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif' ) {
			if (userId != req.user.sub){
				return res.status(500).send({
					message:'Permiso denegado'
				});
			}

			User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err, userUpdated) => {
				if (err){
					res.status(500).send({
						message:'Error al actualizar user'
					});
				} else {
					if(!userUpdated){
						res.status(404).send({
							message:'No se ha podido actualizar user'
						}) 
						} else {
							res.status(200).send({user:userUpdated, image: file_name})
					}
				}
			});
		} else {
			//Borrar el archivo
			fs.unlink(file_path, (err) =>{
				if (err) {
					res.status(200).send({message: 'Invalid extension y fichero no borrado'});
				} else {
					res.status(200).send({message: 'Invalid extension y fichero borrado'});
				}
			})
		}

	} else {
		res.status(200).send({ message: 'No se han subido archivos' });
	}
}

//Método para recuperar la imagen
function getImageFile (req, res){
	var imageFile = req.params.imageFile;
	//directorio de la imagen
	var path_file = './uploads/users/'+imageFile;

	//comprobar que existe el fichero
	fs.exists(path_file, function(exists){
		if (exists){
			res.sendFile(path.resolve(path_file));
		} else {
			res.status(404).send({message: 'La imagen no existe'});
		}
	})
}

function getKeepers(req, res){
	User.find({role:'ROLE_ADMIN'}).exec((err, users) => {
		if(err) {
			res.status(500).send({message: 'Error en la petición'});
		} else {
			if(!users) {
				res.status(404).send({message: 'No se encuentran los usuarios'});
			} else {
				res.status(200).send({users});
			}
		}
	});	
}

module.exports = {
	pruebas,
	saveUser,
	login,
	updateUser,
	uploadImage,
	getImageFile,
	getKeepers
}