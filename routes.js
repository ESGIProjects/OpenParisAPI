module.exports = function(port) {
    var express = require('express');
    var router = express.Router();

    router.get('/', function(req, res) {
        console.log('Hello');
    });

    return router;
};
