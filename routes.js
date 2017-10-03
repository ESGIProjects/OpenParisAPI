module.exports = function(express, mysql, connection) {
    var Promise = require('promise');
    var router = express.Router();

    router.post('/login', function(req, res) {

    });

    router.post('/signup', function(req, res) {

    });

    function getNewLatitude(lat, distance) {
        var earthRadius = 6378;
        return parseFloat(lat) + parseFloat(distance / earthRadius) * parseFloat(180/Math.PI);
    }

    function getNewLongitude(lon, lat, distance) {
        var earthRadius = 6378;
        return parseFloat(lon) + parseFloat(distance / earthRadius) * parseFloat(180 / Math.PI) / parseFloat(Math.cos(lat * Math.PI/180));
    }

    function query(query) {
        return new Promise(function(resolve, reject) {
            connection.query(query, function(error, results, fields) {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }

    function isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    router.get('/places', function(req, res) {
        if (req.query.latitude === undefined) {
            res.sendStatus(400);
            return;
        }

        if (req.query.longitude === undefined) {
            res.sendStatus(400);
            return;
        }

        var latitudes = {
            'n': getNewLatitude(req.query.latitude, 1),
            'e': parseFloat(req.query.latitude),
            'w': parseFloat(req.query.latitude),
            's': getNewLatitude(req.query.latitude, -1)
        };

        var longitudes = {
            'n': getNewLongitude(req.query.longitude, latitudes['n'], 0),
            'e': getNewLongitude(req.query.longitude, latitudes['e'], 1),
            'w': getNewLongitude(req.query.longitude, latitudes['w'], -1),
            's': getNewLongitude(req.query.longitude, latitudes['s'], 0),
        };

        var values = {
            'latitude': latitudes,
            'longitude': longitudes
        };

        res.status(200).send(values);
    });

    router.post('/places', function(req, res) {

        if (req.body.name === undefined) {
            res.sendStatus(400);
            return;
        }

        if (req.body.address === undefined) {
            res.sendStatus(400);
            return;
        }

        if (req.body.zipCode === undefined) {
            res.sendStatus(400);
            return;
        }

        if (req.body.latitude === undefined) {
            res.sendStatus(400);
            return;
        }

        if (req.body.longitude === undefined) {
            res.sendStatus(400);
            return;
        }

        if (req.body.catId === undefined) {
            res.sendStatus(400);
            return;
        }

        if (req.body.userId === undefined) {
            res.sendStatus(400);
            return;
        }

        connection.query(mysql.format('INSERT INTO places (name, address, zipCode, latitude, longitude, cat_id, user_id) VALUES(?, ?, ?, ?, ?, ?, ?)', [req.body.name, req.body.address, req.body.zipCode, req.body.latitude, req.body.longitude, req.body.catId, req.body.userId]), function(error, results, fields) {
            if (error) {
                console.error(error);
                res.status(500).send({'message': 'error when inserting'});
            } else {
                res.status(201).send({'id': results.insertId});
            }
        });
    });

    router.get('/update', function(req, res) {
        var url = "https://api.paris.fr/api/data/1.0/Equipements/get_categories/?token=be82901c787874a6a855f122e93245eb8955989ba2e172e4e16f4a3648462afe"

        request(url, function (error, response, body) {
            console.log('statusCode:', response && response.statusCode);
            if (error) console.log('error:', error);
            else {
                console.log('body:', body);
            }
        });

        res.status(200).send("");
    });

    router.get('/parser', function(req, res) {
        var csv = require('csv');
        var fs = require('fs');

        fs.readFile('listing.csv', 'utf8', function(err, data){
            if (err) { return console.log(err); }

            csv.parse(data, function(err, data){
                csv.transform(data, function(data) {
                    return data.map(function(value) {
                        return value.toUpperCase();
                    });
                }, function(err, data) {

                    data.forEach(function(element, index) {
                        if (index > 0) {
                            connection.query(mysql.format('INSERT INTO logements VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [element[0], element[1], element[2], element[5], element[6], element[7], element[8], element[9], element[10], element[11]]), function(error, results, fields) {
                                if (error) throw error;
                                console.log(results.insertId);
                            });
                        }
                    });

                    res.status(200).send("success");
                });
            });
        });
    });

    router.get('/search', function(req, res) {
        // 1. Check received data

        if (req.query.priceMin === undefined) {
            res.sendStatus(400);
            return;
        }

        if (req.query.priceMax === undefined) {
            res.sendStatus(400);
            return;
        }

        if (req.query.duration === undefined) {
            res.sendStatus(400);
            return;
        }

        if (req.query.neighborhood === undefined) {
            res.sendStatus(400);
            return;
        }

        var logementSql = mysql.format('SELECT * FROM logements WHERE price >= ? AND price <= ? AND minNights <= ? AND neighborhood = ?',
        [req.query.priceMin, req.query.priceMax, req.query.duration, req.query.neighborhood]);

        var placesSql = mysql.format('SELECT * FROM places WHERE cat_id = 12');

        var json = [];

        query(logementSql).then(function(logements) {
            query(placesSql).then(function(places) {

                logements.forEach(function(logement, logementIndex) {

                    //console.log("Logement id : " + logementIndex);

                    var latitudes = {
                        'n': getNewLatitude(logement.latitude, 1),
                        'e': parseFloat(logement.latitude),
                        'w': parseFloat(logement.latitude),
                        's': getNewLatitude(logement.latitude, -1)
                    };
    
                    var longitudes = {
                        'n': getNewLongitude(logement.longitude, latitudes['n'], 0),
                        'e': getNewLongitude(logement.longitude, latitudes['e'], 1),
                        'w': getNewLongitude(logement.longitude, latitudes['w'], -1),
                        's': getNewLongitude(logement.longitude, latitudes['s'], 0),
                    };

                    var jsonLogement = {
                        'id' : logement.id,
                        'name' : logement.name,
                        'hostId' : logement.hostId,
                        'neighborhood' : logement.neighborhood,
                        'latitude' : logement.latitude,
                        'longitude' : logement.longitude,
                        'roomType' : logement.roomType,
                        'price' : logement.price,
                        'minNights' : logement.minNights,
                        'nbReviews' : logement.nbReviews,
                        'places' : []
                    };

                    places.forEach(function(place, placeIndex) {
                        //console.log("Place id : " + placeIndex);

                        if (place.latitude >= latitudes['s'] && place.latitude <= latitudes['n'] && place.longitude >= longitudes['w'] && place.longitude <= longitudes['e']) {
                            jsonLogement['places'].push(place);
                        }
                        
                    });

                    if (jsonLogement['places'].length > 0) {
                        // On doit vérifier si on a toutes les catégories avant d'add

                        json.push(jsonLogement);
                    }
                });

                res.status(200).send({
                    'count': json.length,
                    'array': json
                });
            });
        });
    });

    return router;
};