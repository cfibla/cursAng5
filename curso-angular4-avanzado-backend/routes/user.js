'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

//Subir archivos
//Importamos módulo
var multipart = require('connect-multiparty');
//Directorio para guardar uploads
var md_upload = multipart({ uploadDir: './uploads/users' });

api.get('/pruebas-del-controlador',		md_auth.ensureAuth, UserController.pruebas);
api.post('/register',					UserController.saveUser);
api.post('/login',						UserController.login);
api.put('/update-user/:id',				md_auth.ensureAuth, UserController.updateUser);
api.post('/upload-image-user/:id',		[md_auth.ensureAuth, md_upload], UserController.uploadImage);
api.get('/get-image-file/:imageFile',	UserController.getImageFile);
api.get('/keepers',						UserController.getKeepers);

module.exports = api;