const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const app = express();
const usersRoutes = require('./routes/users');
const postsRoutes = require('./routes/posts');
const commentsRoutes = require('./routes/comments');


const path = require('path');

// dotenv
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
// Middleware pour les headers de requêtes et éviter les erreurs CORS 
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*'); 
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-with, Content, Accept, Content-Type, Authorization',
	); //on autorise certains headers
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, DELETE, PATCH, OPTIONS',
	); // on autorise certaines méthod
	next();
});

/* BODY PARSER */
app.use(bodyParser.json()); // va transformer le corps des requêtes en objets JSON
app.use(bodyParser.urlencoded({ extended: true }));


/* HELMET */
app.use(helmet());


/*MULTER*/
app.use('/images', express.static(path.join(__dirname, 'images')));

// routes
app.use('/api/users/', usersRoutes);
app.use('/api/posts/', postsRoutes);
app.use('/api/posts/', commentsRoutes);


module.exports = app;
