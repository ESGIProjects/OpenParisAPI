module.exports = function(port) {
    var express = require('express');
    var router = express.Router();
    var csv = require('csv');
    var fs = require('fs');

    router.get('/', function(req, res) {

        fs.readFile('listing.csv', 'utf8', function(err, data){
            if (err) { return console.log(err); }

          csv.parse(data, function(err, data){
            csv.transform(data, function(data){
              return data.map(function(value){return value.toUpperCase()});
            }, function(err, data){
                console.log(data);
              /*csv.stringify(data, function(err, data){
                process.stdout.write(data);
            });*/
            });
          });
      });
    });

    return router;
};
