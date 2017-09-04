// Dépendances
var express = require('express');
var bodyParser = require('body-parser');

var port = process.env.PORT || 8080;
var app = express();

// Middleware pour parser les requêtes POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', require('./routes')(port));

app.listen(port, function() {
    console.log('Running on port ' + port);
});
