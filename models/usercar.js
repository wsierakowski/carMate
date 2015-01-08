var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.Types.ObjectId;

var userCarSchema = new Schema({
	//_id: ObjectId, <-- wrong, _id is populated anyway and if we use ObjectId in schema
	//it is usually done to reference other schemas:
	//http://stackoverflow.com/questions/8111846/how-to-set-objectid-as-a-data-type-in-mongoose
	userId: {type: String, ref: 'User'},
	makeId: {type: String, ref: 'Car'},
	modelId: String,
	year: Date,
	fuelType: {type:String, ref: 'FuelType'},
	engineSize: Number,
});

module.exports = mongoose.model('UserCar', userCarSchema);