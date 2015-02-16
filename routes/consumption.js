// http://en.wikipedia.org/wiki/Fuel_efficiency

var _ = require('underscore'),

  UserCar = require('../models/usercar.js'),
  Car = require('../models/car.js'),
  FuelType = require('../models/fuelType.js'),
  Consumption = require('../models/consumption.js'),

  navbar = require('./navbar.js');
  strForm = require('../myutils/stringFormatter.js');

// defaults
var CONSUM_LIMIT_PER_PAGE = 2;

// Consumption table headers
var CONSUM_TABLE_HEADERS = [{
    name: "Log Time ",
    sortBy: "logtime"
  }, {
    name: "Km/100 ",
    sortBy: "consumption"
  }, {
    name: "Mpg ",
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
      consumTableHeaders: _.map(CONSUM_TABLE_HEADERS, function(item) {
        return {name: item.name, sortBy: item.sortBy, order: 'desc'};
      })
    };

    // If there is more than just one car, the the user has a choice.
    // By default the first one return will be picked.
    var currentCar = {
      reg: null,
      id: 0
    };

    // By default consumption results will be sorted by logtime column descending.
    var activeHeaderSort = {
      field: CONSUM_TABLE_HEADERS[0].sortBy,
      order: req.query.order ? req.query.order : 'desc'
    };

    var consumTablePage = req.query.page ? req.query.page : 1;

    // 1. We need to get list of cars for this user
    UserCar
      .find({userId: req.session.user.id})
      .populate('makeId fuelType')
      .exec(function(err, userCarList) {

        if (err) return next(err);

        // TODO check what if there is no cars for that user
        currentCar.reg = userCarList[0].reg;

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

        // If sortBy was passed by parameter then use this as sorting criteria.
        // Make sure such a sortBy field exists.
        if (req.query.sortBy &&
          _.some(CONSUM_TABLE_HEADERS, function(item) {
            return req.query.sortBy === item.sortBy;
          })) {
          activeHeaderSort.field = req.query.sortBy;
        }

        var header = _.find(renderData.consumTableHeaders, function(item) {
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

        var consumCount;

        // One query construct, two requests.
        Consumption
          .count()
          .where({
            reg: currentCar.reg,
            userId: req.session.user.id
          })
          .exec(function(err, count) {
            if (err) return next(err);
            consumCount = count;
            console.log('1. count', count);

            Consumption
              .find()
              .where({
                reg: currentCar.reg,
                userId: req.session.user.id
              })
              //ex: '-logtime' //Sort by logtime desc
              .sort(sortObj)
              //.skip()
              //.limit()
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
      });
  } else {
    req.session.error = 'Please log in.';
    res.redirect('/login');
  }
};