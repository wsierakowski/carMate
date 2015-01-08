// http://www.slideshare.net/the_undefined/nodejs-best-practices-10428790

var optimist = require('optimist'),
    args = optimist.argv,
    mongoose = require('mongoose'),

    conf = require('./conf.json'),

    Car = require('./models/car.js'),
    carJson = require('./data/github.com.VinceG.Auto-Cars-Makes-And-Models.git.json');

//Note that non-single-letter flags must be passed in as --flag.
var dropDb = !!args.dropDb;
console.log('Dropping DB!');
var loadingCount = 0;
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
    console.log('Db connection opened.');

    // if dropDb
    // mongoose.connection.db.dropDatabase();

    // 1. Populate DB only if there isn't any records
	Car.count({}, function(err, count) {
		if (err) throw err;
		if (count > 0) {
			console.log("Cars db already populated.");
			process.exit(code=0);
		}

		// // 2. Parse JSON data
		// var cars;

		// try {
		// 	cars = JSON.parse(carJson);
		// } catch (e) {
		// 	console.log('ERROR:', err);
		//}

		// 3. We've got the data, time to populate it
		//populateCars(cars, loadingCount);
		populateCars(carJson, loadingCount);
	});

});

function populateCars(cars, iterator) {
	if (iterator === cars.length) {
		console.log('Import process finished: 100%');
		process.exit(code=0);
	}
	console.log(
		'Importing progress: %d out of %d (%d%)',
		(iterator + 1),
		cars.length,
		Math.round((iterator/cars.length )* 100)
	);

	var car = new Car({
		_id: cars[iterator].value,
		title: cars[iterator].title,
		models: cars[iterator].models.map(function(item) {
			return {_id: item.value, title: item.title};
		})
	});

	car.save(function(err, doc) {
		if (err) throw err;
		populateCars(cars, ++iterator);
	});
}

// SAMPLE JSON:
// {
//    "value":"ALFA",
//    "title":"Alfa Romeo",
//    "models":[
//       {
//          "value":"ALFA164",
//          "title":"164"
//       },
//  }