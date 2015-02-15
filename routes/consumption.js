// http://en.wikipedia.org/wiki/Fuel_efficiency

var _ = require('underscore'),

  UserCar = require('../models/usercar.js'),
  Car = require('../models/car.js'),
  FuelType = require('../models/fuelType.js'),
  Consumption = require('../models/consumption.js'),

  navbar = require('./navbar.js');
  strForm = require('../myutils/stringFormatter.js');

// Consumption table headers
var consTableHeaders = [{
    name: "Log Time ",
    sortBy: "logtime"
  }, {
    name: "Km/100 ",
    sortBy: "consumption"
  }, {
    name: "MPG ",
    sortBy: "consumptionMpg"
  }, {
    name: "Miles ",
    sortBy: "miles"
  }, {
    name: "Kms ",
    sortBy: "kms"
  }, {
    name: "Gallons ",
    sortBy: "gallons"
  }, {
    name: "Liters ",
    sortBy: "liters"
  }
];

exports.consumptionGet = function(req, res, next) {
  if (req.session.user) {

    // The data we will render at the end.
    var renderData = {
      name: req.session.user.name,
      menu: navbar('Consumption'),
      // deep clone as we are going to modify object in a minute...
      consTableHeaders: _.map(consTableHeaders, function(item) {
        return {name: item.name, sortBy: item.sortBy, order: 'desc'};
      })
    };

    // 1. We need to get list of cars for this user
    UserCar
      .find({userId: req.session.user.id})
      .populate('makeId fuelType')
      .exec(function(err, userCarList) {

        if (err) return next(err);

        // If there is more than just one car, the the user has a choice.
        // By default the first one return will be picked.
        var currentCar = {
          reg: userCarList[0].reg,
          id: 0
        };

        // If car id was returned as a param then this car will be the current car.
        if (req.params.id) {
          // bit hacky way to get the reg and populate id
          currentCar.reg = _.find(userCarList, function(item, i) {
            if (item._id.toString() === req.params.id) {
              currentCar.id = i;
              return true;
            }
          }).reg;
        }

        renderData.currentCar = currentCar;

        // By default consumption results will be sorted by logtime column descending.
        var activeHeaderSort = {
          field: consTableHeaders[0].sortBy,
          order: req.query.order ? req.query.order : 'desc'
        };

        // If sortBy was passed by parameter then use this as sorting criteria.
        // Make sure such a sortBy field exists.
        if (req.query.sortBy &&
          _.some(consTableHeaders, function(item) {
            return req.query.sortBy === item.sortBy;
          })) {
          activeHeaderSort.field = req.query.sortBy;
        }

        var header = _.find(renderData.consTableHeaders, function(item) {
          return item.sortBy === activeHeaderSort.field;
        });
        header.activeOrder = activeHeaderSort.order;
        // If current order for the selected column is 'desc' then the link should
        // trigger 'asc'.
        header.order = activeHeaderSort.order === 'desc' ? 'asc' : 'desc';
        //renderData.activeHeaderSort = activeHeaderSort;

        // 2. Get consumption log for the selected car
        var sortObj = {};
        sortObj[activeHeaderSort.field] =  activeHeaderSort.order === 'desc' ? -1 : 1;

        Consumption
          .find({
            reg: currentCar.reg,
            userId: req.session.user.id
            //userId: userCarList[0].userId
          })
          //ex: '-logtime' //Sort by logtime desc
          .sort(sortObj)
          .exec(function(err, consRes) {

            if (err) return next(err);

            // 3. Cars information mapping
            renderData.cars = _.map(userCarList, function(item, index) {
                return {
                  id: item._id,
                  make: item.makeId.title,
                  // Finding a sub-document http://mongoosejs.com/docs/subdocs.html
                  model: item.makeId.models.id(item.modelId).title,
                  year: item.year,
                  fuelType: item.fuelType._id,
                  engineSize: item.engineSize,
                  reg: item.reg,
                  active: index === currentCar.id
                };
            });

            // 4. Consumption information mapping
            renderData.consumptions = _.map(consRes, function(i) {
                return {
                  logtime: strForm.getDateStd(i.logtime),
                  kms: i.kms,
                  miles: i.miles,
                  liters: i.liters,
                  gallons: i.gallons,
                  consumption: i.consumption,
                  consumptionMpg: i.consumptionMpg
                };
            });

            renderData.avgCons = (_.reduce(consRes, function(memo, record) {
              return memo + record.consumption;
            }, 0) / consRes.length).toFixed(3);

            renderData.avgConsMpg = (_.reduce(consRes, function(memo, record) {
              return memo + record.consumptionMpg;
            }, 0) / consRes.length).toFixed(3);

            res.render('consumption', renderData);
          });
      });
  } else {
    req.session.error = 'Please log in.';
    res.redirect('/login');
  }
};