var mongoose = require('mongoose'),
    conv = require('../public/conversions.js'),
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

// Testing data generator
var testDataGenerator = {
    dateIncr: 24 * 60 * 60 * 1000,
    kmsIncr: 1,
    litersIncr: 0.1,
    source: {
        "userEmail": "wojciech@sierakowski.eu",
        "reg": "99w811",
        "kms": 100,
        "liters": 3,
        // todays date minus year
        "logtime": (new Date().getTime() - 365.242 * 24 * 60 * 60 * 1000)
    },
    generate: function(num) {
        var ret = [];
        for (var i = 0; i < num; i++) {
            ret.push({
                userEmail: this.source.userEmail,
                reg: this.source.reg,
                kms: this.source.kms + i * this.kmsIncr,
                liters: this.source.liters + i * this.litersIncr,
                logtime: new Date(this.source.logtime + i * this.dateIncr).toISOString()
            });
        }
        return JSON.stringify(ret);
    }
};