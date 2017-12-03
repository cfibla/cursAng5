'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3789;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/zoo',{useMongoClient: true})
	.then(() => {
		console.log('Conectado a la DB');
		app.listen(port,() =>{
			console.log('Servidor OK')
		})
	})
	.catch(err => console.log(err));