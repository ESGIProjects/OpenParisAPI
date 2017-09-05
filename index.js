// Dépendances
var express = require('express');
var bodyParser = require('body-parser');

var port = process.env.PORT || 8080;
var app = express();

// Middleware pour parser les requêtes POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mongoose
var mongoose = require('mongoose');
var Logement = mongoose.model('Logement', new mongoose.Schema({
    id: Number,
    name: String,
    hostId: Number,
    neighbourhood: String,
    latitiude: Number,
    longitude: Number,
    roomType: String,
    price: Number,
    minNights: Number,
    nbReviews: Number
}));

mongoose.connect(process.env.MONGODB_URI, function(error) {
    if (error) console.error(error);
    else console.log('mongo connected');
});

app.use('/', require('./routes')(port));

app.listen(port, function() {
    console.log('Running on port ' + port);
});
