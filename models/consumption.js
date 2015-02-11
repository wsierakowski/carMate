var mongoose = require('mongoose'),
    conv = require('../logic/conversions.js'),
	Schema = mongoose.Schema,
	ObjectId = Schema.Types.ObjectId;

var consumptionSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
	reg: {type: String, required: true, ref: 'UserCar', set: function(v) {return v.toUpperCase();}},
	logtime: {type: Date, required: true, default: Date.now},
	kms: {type: Number},
    miles: {type: Number},
	liters: {type: Number},
    gallons: {type: Number},
	consumption: {type: Number},
    consumptionMpg: {type: Number}
});

consumptionSchema.pre('save', function(next) {

    var cons = this;
    if (!cons.kms && !cons.miles) {
        return next(new Error("Kms or miles are required."));
    }

    if (!cons.liters && !cons.gallons) {
        return next(new Error("Liters or gallons are required."));
    }

    if (cons.kms && !cons.miles) cons.miles = conv.kmsToMiles(cons.kms);
    if (cons.miles && !cons.kms) cons.kms = conv.milesToKms(cons.miles);

    if (cons.liters && !cons.gallons) cons.gallons = conv.litersToGallons(cons.liters);
    if (cons.gallons && !cons.liters) cons.liters = conv.litersToGallons(cons.gallons);

    cons.kms = cons.kms.toFixed(3);
    cons.miles = cons.miles.toFixed(3);
    cons.liters = cons.liters.toFixed(3);
    cons.gallons = cons.gallons.toFixed(3);

    cons.consumption = conv.getConsumption(cons.liters, cons.kms).toFixed(3);
    cons.consumptionMpg = conv.getConsumptionMpg(cons.liters, cons.kms).toFixed(3);

    next();
});

module.exports = mongoose.model('Consumption', consumptionSchema);