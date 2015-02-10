var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.Types.ObjectId;

var consumptionSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
	carReg: {type: String, ref: 'UserCar', set: function(v) {return v.toUpperCase();}},
	logtime: {type: Date, required: true, default: Date.now},
	kms: {type: Number, required: true},
	liters: {type: Number, required: true},
	consumption: {type: Number, required: true}
});

consumptionSchema.pre('save', function(next) {
    // We want to calculate consumption here
    // var userCar = this;

    // if (!userCar.isModified('reg')) return next();

    // userCar.reg = userCar.reg.toUpperCase();
    // next();
});

module.exports = mongoose.model('Consumption', consumptionSchema);