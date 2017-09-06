// Dépendances
var express = require('express');
var bodyParser = require('body-parser');

var port = process.env.PORT || 8080;
var app = express();

// Middleware pour parser les requêtes POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration Mongoose
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

var Categorie = mongoose.model('Categorie', new mongoose.Schema({
    id: Number,
    name: String
}));

var Place = mongoose.model('Place', new mongoose.Schema({
    id: Number,
    name: String,
    address: String,
    zipCode: Number,
    latitude: Number,
    longitude: Number
}));

mongoose.connect(process.env.MONGODB_URI, function(error) {
    if (error) console.error(error);
    else {
        console.log('mongo connected');

        // Mise à jour de la base tous les matins
        var cron = require('node-cron');
        cron.schedule('*/5 * * * * *', function() {
            console.log('running task every 5 seconds');
        });
    }
});

// Routes

app.use('/', require('./routes')(Logement, Categorie, Place));

// Lancement

app.listen(port, function() {
    console.log('Running on port ' + port);
});
