/*
https://gist.github.com/fwielstra/1025038
*/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ucrypto = require('../myutils/ucrypto.js');

var userSchema = new Schema({
    email: {type: String, index: 1, unique: true, required: true},
    name: {type: String, default: 'Anonumous'},
    password: {type: String, required: true}
});

userSchema.pre('save', function(next) {
	var user = this;

	if (!user.isModified('password')) return next();

	ucrypto.hashBcrypt(user.password, function(err, hash) {
		if (err) return next(err);
		user.password = hash;
		next();
	});
});

// instance method: available on docs
// i.e. var User = mongoose.model('User', userSchema);
//      var user1 = new User({name: 'test'});
//      user1.getName()
userSchema.methods.getName = function() {
	//this.model('User').name
	var greeting = this.name
		? "User name is " + this.name
		: "Noname user";
	console.log(greeting);
};

// statics: available on the model
userSchema.statics.findWithoutName = function() {
	//this.find()
};

module.exports = mongoose.model('User', userSchema);

/*
User:
---------------
email
name
password


Car:
---------------
makeId
title
models [modelId, title]


UserCar:
---------------
_id
userId
makeId
modelId
year
fuelType
engineSize


Consumption:
---------------
userCar._id
logtime
kms
liters
consumption
*/