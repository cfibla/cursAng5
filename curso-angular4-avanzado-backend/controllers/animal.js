'use strict'

//modulos
var fs = require('fs');
var path = require('path');

//modelos
var User = require('../models/user');
var Animal = require('../models/animal');

//sevicio JWT
var jwt = require('../services/jwt');


function pruebas (req, res){
	res.status(200).send({
		message:'Hola desde el AnimalController',
		user: req.user
	})
};

function saveAnimal (req, res){
	var animal = new Animal();

	var params = req.body;

	if(params.name){
		animal.name = params.name;
		animal.description = params.description;
		animal.year = params.year;
		animal.image = null;
		animal.user = req.user.sub;

		animal.save((err, animalStored) => {
			if(err){
				res.status(500).send({message:'Error en el servidor'});
			} else {
				if(!animalStored){
					res.status(404).send({message:'Animal no guardado'});
				} else {
					res.status(200).send({animal: animalStored});
				}
			}
		});
	} else {
		res.status(200).send({
		message:'Nombre del animal obligatorio',
		})
	}
};

function getAnimals(req, res){
	Animal.find({}).populate({path:'user'}).exec((err, animals) => {
		if (err){
			res.status(500).send({message:'Error en la petición'});
		} else {
			if(!animals){
				res.status(404).send({message:'No hay animales'});
			} else {
				res.status(200).send(animals);
			}
		}
	})
}

function getAnimal(req, res){
	var animalId = req.params.id;

	Animal.findById(animalId).populate({path:'user'}).exec((err, animal) => {
		if (err){
			res.status(500).send({message:'Error en la petición'});
		} else {
			if(!animal){
				res.status(404).send({message:'El animal no existe'});
			} else {
				res.status(200).send(animal);
			}
		}
	})
}

function updateAnimal(req, res){
	var animalId = req.params.id;
	var update = req.body

	Animal.findByIdAndUpdate(animalId, update, {new:true}, (err, animalUpdated) => {
		if(err){
			res.status(500).send({message:'Error en la petición'});
		} else {
			if(!animalUpdated){
				res.status(404).send({message:'El animal no se ha actualizado'});
			} else {
				res.status(200).send({animal:animalUpdated});
			}
		}
	})
}

//Método para subir archivos
function uploadImage(req, res){
	var animalId = req.params.id;
	var file_name = 'No subido...';

	if(req.files){
		//PRIMERO: Saber el nombre del fichero
		var file_path = req.files.image.path;
		// Separamos los elementos del path
		var file_split = file_path.split('\\');
		// El nombre del fichero es el paramentro numero [2]
		var file_name = file_split[2];

		//SEGUNDO: Saber la expensión del fichero
		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif' ) {

			Animal.findByIdAndUpdate(animalId, {image: file_name}, {new:true}, (err, animalUpdated) => {
				if (err){
					res.status(500).send({
						message:'Error al actualizar animal'
					});
				} else {
					if(!animalUpdated){
						res.status(404).send({
							message:'No se ha podido actualizar animal'
						}) 
						} else {
							res.status(200).send({animal:animalUpdated, image: file_name})
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
	var path_file = './uploads/animals/'+imageFile;

	//comprobar que existe el fichero
	fs.exists(path_file, function(exists){
		if (exists){
			res.sendFile(path.resolve(path_file));
		} else {
			res.status(404).send({message: 'La imagen no existe'});
		}
	})
}


// Borrar animal
function deleteAnimal (req, res) {
	var animalId = req.params.id;

	Animal.findByIdAndRemove(animalId, (err, animalRemoved) => {
		if (err){
			res.status(500).send({
						message:'Error al borrar animal'
					});
		} else {
			if(!animalRemoved){
				res.status(404).send({message: 'El animal no existe'});
			} else {
				res.status(200).send({ animal: animalRemoved });
			}
		}
	})
}


module.exports = {
	pruebas,
	saveAnimal,
	getAnimals,
	getAnimal,
	updateAnimal,
	uploadImage,
	getImageFile,
	deleteAnimal
};