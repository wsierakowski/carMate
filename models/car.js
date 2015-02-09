var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var modelSchema = new Schema({
	_id: {type: String, index: 1, unique: true, required: true},
	title: {type: String, index: 1, unique: true, required: true}
});

var makeSchema = new Schema({
	_id: {type: String, index: 1, unique: true, required: true},
	title: {type: String, index: 1, unique: true, required: true},
	models: [modelSchema]
});

module.exports = mongoose.model('Car', makeSchema);