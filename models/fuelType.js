var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.Types.ObjectId;

var fuelTypeSchema = new Schema({
	_id: {type:String, index: 1, unique: true, required: true},
});

module.exports = mongoose.model('FuelType', fuelTypeSchema);