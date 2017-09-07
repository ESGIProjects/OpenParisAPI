module.exports = function(express, mysql, connection) {
    var Promise = require('promise');
    var async = require('async');
    var router = express.Router();

    router.post('/login', function(req, res) {

    });

    router.post('/signup', function(req, res) {

    });
/*
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

        // Attraction data placeholder
        var attractions = [12];

        var logements = [];

        // 2. Get logements corresponding to first parameters

        connection.query(
            mysql.format('SELECT * FROM logements WHERE price >= ? AND price <= ? AND minNights <= ? AND neighborhood = ?',
            [req.query.priceMin, req.query.priceMax, req.query.duration, req.query.neighborhood]), function(error, results, fields) {

            results.forEach(function(logementElement, logementIndex) {
                // 3. Get lat/lon values on all directions
                var latitudes = {
                    'n': getNewLatitude(logementElement.latitude, 1),
                    'e': parseFloat(logementElement.latitude),
                    'w': parseFloat(logementElement.latitude),
                    's': getNewLatitude(logementElement.latitude, -1)
                };

                var longitudes = {
                    'n': getNewLongitude(logementElement.longitude, latitudes['n'], 0),
                    'e': getNewLongitude(logementElement.longitude, latitudes['e'], 1),
                    'w': getNewLongitude(logementElement.longitude, latitudes['w'], -1),
                    's': getNewLongitude(logementElement.longitude, latitudes['s'], 0),
                };

                // 4. Search for each category
                var validLogement = true;
                var places = [];

                attractions.forEach(function(placeElement, placeIndex) {
                    connection.query(
                        mysql.format('SELECT * FROM places WHERE cat_id = ? AND latitude >= ? AND latitude <= ? AND longitude >= ? AND longitude <= ?',
                        [placeElement, latitudes['s'], latitudes['n'], longitudes['w'], longitudes['e']]), function(error, results, fields) {

                        if (placeIndex == 0) {
                            places = results;
                            console.log(results);
                        }

                        if (results.length > 0) {

                        } else {
                            validLogement = false;
                        }
                    });
                });

                if (validLogement) {
                    logements.push({
                        'id': logementElement.id,
                        'name': logementElement.name,
                        'hostId': logementElement.hostId,
                        'neighborhood': logementElement.neighborhood,
                        'latitude': logementElement.latitude,
                        'longitude': logementElement.longitude,
                        'roomType': logementElement.roomType,
                        'price': logementElement.price,
                        'minNights': logementElement.minNights,
                        'nbReviews': logementElement.nbReviews,
                        'places': places
                    });
                }
            });
            res.status(200).send({'count': logements.length, 'array':logements});
        });
    });
*/
    router.get('/psearch', function(req, res) {
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

        // Attraction data placeholder
        var attractions = [12];

        var logements = [];

        // 2. Get logements corresponding to first parameters
        var sql = mysql.format('SELECT * FROM logements WHERE price >= ? AND price <= ? AND minNights <= ? AND neighborhood = ?',
        [req.query.priceMin, req.query.priceMax, req.query.duration, req.query.neighborhood]);

        query(sql).then(function(results) {

            results.forEach(function(logementElement, logementIndex) {
                // 3. Get lat/lon values on all directions
                var latitudes = {
                    'n': getNewLatitude(logementElement.latitude, 1),
                    'e': parseFloat(logementElement.latitude),
                    'w': parseFloat(logementElement.latitude),
                    's': getNewLatitude(logementElement.latitude, -1)
                };

                var longitudes = {
                    'n': getNewLongitude(logementElement.longitude, latitudes['n'], 0),
                    'e': getNewLongitude(logementElement.longitude, latitudes['e'], 1),
                    'w': getNewLongitude(logementElement.longitude, latitudes['w'], -1),
                    's': getNewLongitude(logementElement.longitude, latitudes['s'], 0),
                };

                // 4. Search for each category
                var validLogement = true;
                var places = [];

                attractions.forEach(function(placeElement, placeIndex) {

                var sql = mysql.format('SELECT * FROM places WHERE cat_id = ? AND latitude >= ? AND latitude <= ? AND longitude >= ? AND longitude <= ?', [placeElement, latitudes['s'], latitudes['n'], longitudes['w'], longitudes['e']]);

                    query(sql).then(function(results) {

                        if (placeIndex == 0) {
                            places = results;
                        }

                        if (results.length > 0) {

                        } else {
                            validLogement = false;
                        }
                    });
                });

                if (validLogement) {
                    logements.push({
                        'id': logementElement.id,
                        'name': logementElement.name,
                        'hostId': logementElement.hostId,
                        'neighborhood': logementElement.neighborhood,
                        'latitude': logementElement.latitude,
                        'longitude': logementElement.longitude,
                        'roomType': logementElement.roomType,
                        'price': logementElement.price,
                        'minNights': logementElement.minNights,
                        'nbReviews': logementElement.nbReviews,
                        'places': places
                    });
                }
            });
            res.status(200).send({'count': logements.length, 'array':logements});
        });
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

    return router;
};
