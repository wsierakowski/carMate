var crypto = require('crypto'),
	bcrypt = require('bcrypt'),
	_ = require('underscore');

function hashSha256(pwd) {
	return crypto.createHash('sha256').update(pwd).digest('base64').toString();
}


// http://codetheory.in/using-the-node-js-bcrypt-module-to-hash-and-safely-store-passwords/
// swf = Salt Work Factor
function hashBcrypt(pwd, swf, cb) {
	if (_.isFunction(swf)) {
		cb = swf;
		swf = null;
	}
	bcrypt.genSalt(swf || 10, function(err, salt) {
		if (err) return cb(err);
		bcrypt.hash(pwd, salt, cb);
	});
}

function compareBcrypt(pwd, hash, cb) {
	bcrypt.compare(pwd, hash, cb);
}

exports.hashSha256 = hashSha256;
exports.hashBcrypt = hashBcrypt;
exports.compareBcrypt = compareBcrypt;