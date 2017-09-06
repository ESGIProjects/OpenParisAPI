module.exports = function(express, mysql, connection) {
    var router = express.Router();

    router.post('/login', function(req, res) {

    });

    router.post('/signup', function(req, res) {

    });

    router.get('/search', function(req, res) {

        console.log(req.query.priceMin);

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

        if (req.query.neighbourhood === undefined) {
            res.sendStatus(400);
            return;
        }

        connection.query(mysql.format('SELECT * FROM logements WHERE price >= ? AND price <= ? AND minNights <= ? AND neighbourhood = ?', [req.query.priceMin, req.query.priceMax, req.query.duration, req.query.neighbourhood]), function(error, results, fields) {
            res.status(200).send(results);
        });

    });

    router.get('/places', function(req, res) {

    });

    router.post('/places', function(req, res) {

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
