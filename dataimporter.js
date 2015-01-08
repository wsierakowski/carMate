var util = require('util'),

    optimist = require('optimist'),
    args = optimist.argv,
    mongoose = require('mongoose'),
    async = require('async'),
    path = require('path'),

    jsonLoader = require('./myutils/jsonLoader'),

    conf = require('./conf.json');

    //mongoose models
var models = {};
    models.User = require('./models/user');
    models.Car = require('./models/car');
    models.FuelType = require('./models/fuelType');
    models.UserCar = require('./models/usercar');
    models.Consumption = require('./models/consumption');

//Note that non-single-letter flags must be passed in as --flag.
var shouldDropDB = !!args.dropDB;
if (shouldDropDB) util.log('-1- will drop DB!');
else util.log('-1- will not drop DB.');

var dataPath = args.dataPath || "./data/dataImporter.json";

var modelDataMappings = {};
var modelDatas = {};

// 1. Load data source json
function loadModelDataMappings() {
    jsonLoader(dataPath, function(err, data) {
        if (err) throw err;
        modelDataMappings = data;
        util.log('-2- dataMap loaded.');
        loadModelData();
    });
}

// 2. Load data for each model
function loadModelData() {
    util.log('-3- loading model data...');
    async.each(modelDataMappings.data, function(dataMap, callback) {
        var filePath = path.join('.', modelDataMappings.path, dataMap.source);
        jsonLoader(filePath, function(err, data) {
            if (err) return callback(err);
            modelDatas[dataMap.model] = data;
            util.log('-3- -- loaded data for ' + dataMap.model + '.');
            return callback(null);//, dataMap.model);
        });
    }, function(err) {
        if (err) throw err;
        util.log('-3- completed loading model data.');
        connectToDB();
    });
}

// 3. Connect to DB
function connectToDB() {
    /*
    mongodb://username:password@host:port/database?options
     */
    mongoose.connect(
        'mongodb://' +
        //conf.db.username + ':' +
        //conf.db.password + '@' +
        conf.db.host + ':' +
        conf.db.port + '/' +
        conf.db.database
    );

    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    mongoose.connection.on('open', function() {
        util.log('-4- DB connection opened.');
        dropDB();
    });
}

// 4. We've got all model data, now if db needs to be dropped, let's drop it.
function dropDB() {
    if (shouldDropDB) {
        mongoose.connection.db.dropDatabase(function(err) {
            if (err) throw err;
            util.log('-5- DB dropped');
            populateCollection();
        });
    } else {
        util.log('-5- skipping dropping DB');
        populateCollection();
    }
}

// 5. Popupulate DB by creating collections
//    We do this in series as they need to be imported in order
//    since they are in relations with each other.
function populateCollection() {
    async.eachSeries(modelDataMappings.data, function(dataMap, callback) {
        var model = dataMap.model;
        if (!models[model]) {
            return callback("-6- --Can't find model definition for: " + dataMap.model);
        }
        async.each(modelDatas[model], function(modelData, innerCallback) {
            models[model].create(modelData, function(err, record) {
                if (err) return innerCallback(err);
                innerCallback(null);
            });
        }, function(err) {
            if (err) {
                return callback('-6- --' +
                    'Error when populating one of the instances in model: ' +
                    model + ': ' + err
                );
            }
            util.log('-6- -- Finished importing data for model: ' + model + '.');
            callback();
        });
    }, function(err) {
        if (err) throw err;
        util.log('-6- Populating collection finished.');
        process.exit(code=0);
    });
}

loadModelDataMappings();