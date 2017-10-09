// Dépendances
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var request = require('request');
var cron = require('node-cron');
//var memcached = require('memcached');

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

// Configuration memcached
//var Memcached = new Memcached('127.0.0.1:11211');

// Cron task
cron.schedule('0 59 1 * * *', handle_update);

//connection.end();

// Routes
app.use('/', require('./routes')(express, mysql, connection));

// Lancement
app.listen(port, function() {
    console.log('Running on port ' + port);
});

function handle_update() {
    // Retrieve all categories first
    connection.query('SELECT id FROM categories ORDER by id', function(error, results, fields) {
        if (error) { console.error(error); }
        else {
            results.forEach(function(element, index) {
                 // Cron on each category
                 // og cron schedule '0 '+ (index * 2) +' 2 * * *'
                cron.schedule('0 '+ index +' 2 * * *' , function() {
                    retrieveAttractions(element.id)
                });
            });           
        }
    });
}

function retrieveAttractions(cat_id) {
    console.log("retrieving cat_id " + cat_id);
    var url = 'https://api.paris.fr/api/data/1.1/Equipements/get_equipements/?token=be82901c787874a6a855f122e93245eb8955989ba2e172e4e16f4a3648462afe&cid=' + cat_id + '&offset=0&limit=300';

    request(url, function(error, response, body) {
        console.log('statusCode: ', response && response.statusCode);
        if (error) { console.error(error) }
        else {
            var json = JSON.parse(body);
            var data = json['data'];

            data.forEach(function(place, index) {
                connection.query(mysql.format('SELECT * FROM places WHERE id = ?', [place['id']]), function(error, results, fields) {
                    if (results.length == 0) {
                        var entry = {
                            'id': place['id'],
                            'name': place['name'],
                            'address': place['address'],
                            'zipCode': place['zipCode'],
                            'latitiude': place['lat'],
                            'longitude': place['lon'],
                            'cat_id': cat_id,
                            'user_id': null
                        };

                        connection.query(mysql.format('INSERT INTO places VALUES(?, ?, ?, ?, ?, ?, ?, ?)', [entry['id'], entry['name'], entry['address'], entry['zipCode'], entry['latitiude'], entry['longitude'], entry['cat_id'], entry['user_id']]), function(error, results, fields) {
                            if (error) console.error(error);
                            else console.log(results.insertId);
                        });
                    }
                });
            });
        }
    });   
}