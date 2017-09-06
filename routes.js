module.exports = function(Logement, Categorie, Place) {
    var express = require('express');
    var router = express.Router();

    

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
                    if (index > 50327) {
                        var logement = new Logement({
                            'id': element[0],
                            'name': element[1],
                            'hostId': element[2],
                            'neighbourhood': element[5],
                            'latitiude': element[6],
                            'longitude': element[7],
                            'roomType': element[8],
                            'price': element[9],
                            'minNights': element[10],
                            'nbReviews': element[11]
                        });

                        logement.save(function(error) {
                            if (error) {
                                console.error(error);
                            } else {
                                console.log("SAVE OK");
                            }
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
