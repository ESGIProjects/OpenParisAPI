// Dépendances
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var port = process.env.PORT || 8080;
var app = express();

// Middleware pour parser les requêtes POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration mysql
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'openparis'
});

connection.connect();

connection.query('SELECT * FROM categories ORDER BY id', function(error, results, fields) {
    if (error) throw error;
    results.forEach(function(element, index) {
        console.log(element.name);
    });
});

//connection.end();

// Routes
app.use('/', require('./routes')(mysql, connection));

// Lancement
app.listen(port, function() {
    console.log('Running on port ' + port);
});
