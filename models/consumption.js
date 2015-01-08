var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.Types.ObjectId;

var consumptionSchema = new Schema({
	userCarId: {type: ObjectId, ref: 'UserCar'},
	logtime: {type: Date, required: true},
	kms: {type: Number, required: true},
	liters: {type: Number, required: true},
	consumption: {type: Number, required: true}
});

module.exports = mongoose.model('Consumption', consumptionSchema);