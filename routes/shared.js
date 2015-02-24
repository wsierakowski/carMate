var _ = require('underscore'),
    UserCar = require('../models/usercar.js');

exports.clearMessages = function(req, res, next) {
  if (req.method !== 'POST') return next();
  req.session.msg = null;
  req.session.regError = null;
  req.session.error = null;
  next();
};

exports.checkUser = function(req, res, next) {
  if (!req.session.user) {
    req.session.error = 'Please log in.';
    return res.redirect('/login');
  }
  return next();
};

exports.getUserCars = function(req, res, next) {
  UserCar
    .find({userId: req.session.user.id})
    .populate('makeId fuelType')
    .exec(function(err, userCarsList) {

      if (err) return next(err);
      req.userCarsList = userCarsList;

      return next();
    });
};