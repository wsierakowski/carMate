var fs = require('fs');

module.exports = function(path, cb) {
    fs.readFile(path, function(err, data) {
        if (err) return cb(err);
        var parsedData;
        try {
            parsedData = JSON.parse(data);
        } catch (error) {
            return cb(error);
        }
        cb(null, parsedData);
    });
};