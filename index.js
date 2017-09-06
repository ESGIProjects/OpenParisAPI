// Dépendances
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var request = require('request');
var cron = require('node-cron');

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

cron.schedule('0 0 2 * * *', handle_update);

//connection.end();

// Routes
app.use('/', require('./routes')(express, mysql, connection));
//handle_update();

// Lancement
app.listen(port, function() {
    console.log('Running on port ' + port);
});

function handle_update() {

    // 1. get all categories
    connection.query('SELECT id FROM categories ORDER BY id', function(error, results, fields) {
        if (error) {
            console.error(error);
        }
        else {
            // 2. make array with categories
            var categories = [];
            results.forEach(function(element, index) {
                categories[index] = element.id;
            });

            categories = [289, 300];

            // 3. make forEach on categories array
            categories.forEach(function(category, index) {
                var url = 'https://api.paris.fr/api/data/1.1/Equipements/get_equipements/?token=be82901c787874a6a855f122e93245eb8955989ba2e172e4e16f4a3648462afe&cid=' + category + '&offset=0&limit=300';

                console.log('category: ', category);

                // 4. Make request to ParisAPI

                request(url, function(error, response, body) {
                    console.log('statusCode:', response && response.statusCode);
                    if (error) {
                        console.error(error);
                    } else {
                        var json = JSON.parse(body);
                        var data = json['data'];

                        data.forEach(function(place, index) {
                            // 5. Vérif de l'existence
                            connection.query(mysql.format('SELECT * FROM places WHERE id = ?', [place['id']]), function(error, results, fields) {
                                // 6. Ajout seulement si nouvelle entrée
                                if (results.length == 0) {
                                    var entry = {
                                        'id': place['id'],
                                        'name': place['name'],
                                        'address': place['address'],
                                        'zipCode': place['zipCode'],
                                        'latitiude': place['lat'],
                                        'longitude': place['lon'],
                                        'cat_id': category,
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
            });
        }
    });
}
