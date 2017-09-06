module.exports = function(mysql, connection) {
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
