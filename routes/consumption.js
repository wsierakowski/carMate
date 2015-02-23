// http://en.wikipedia.org/wiki/Fuel_efficiency

var _ = require('underscore'),

  UserCar = require('../models/usercar.js'),
  Car = require('../models/car.js'),
  FuelType = require('../models/fuelType.js'),
  Consumption = require('../models/consumption.js'),

  navbar = require('./navbar.js'),
  strForm = require('../myutils/stringFormatter.js'),

  paginator = require('../myutils/paginator.js');

// defaults
var CONSUM_PER_PAGE = 10,
    CONSUM_BUTTON_NUM = 5,

// Consumption table headers
    CONSUM_TABLE_HEADERS = [{
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

var consumPaginator = paginator(CONSUM_PER_PAGE, CONSUM_BUTTON_NUM);

exports.consumptionGet = function(req, res, next) {
  if (req.session.user) {

    ////////////////////////////////////////////
    // This is what we send to render for jade.
    ////////////////////////////////////////////

    var renderData = {
      userName: req.session.user.name,
      menu: navbar('Consumption'),

      // If there is more than just one car, the the user has a choice.
      // By default the first one return will be picked.
      cars: {
        currentCar: {reg: null, id: 0},
        data: null
      },

      // Deep clone as we are going to modify object in a minute...
      consumHead: {
        defaultOrder: -1,
        data: _.map(CONSUM_TABLE_HEADERS, function(item) {
          return {name: item.name, sortBy: item.sortBy};
        }),
        // By default consumption results will be sorted by logtime column descending.
        activeColumn: {
          sortBy: CONSUM_TABLE_HEADERS[0].sortBy,
          order: -1
        }
      },

      // Consumption data to populate the table
      consumptions: {
        data: null,
        avgCons: null,
        avgConsMpg: null
      },

      consumPagination: null
    };

    ////////////////////////////////////////////

    // 1. We need to get list of cars for this user
    UserCar
      .find({userId: req.session.user.id})
      .populate('makeId fuelType')
      .exec(function(err, userCarList) {

        if (err) return next(err);

        // TODO check what if there is no cars for that user
        renderData.cars.currentCar.reg = userCarList[0].reg;

        // If car id was returned as a param then this car will be the current car.
        // If car from the url param doesn't exists then stay with defaults.
        if (req.params.id) {
          // bit hacky way to get the reg and populate id
          _.find(userCarList, function(item, i) {
              if (item._id.toString() === req.params.id) {
                renderData.cars.currentCar.reg = item.reg;
                renderData.cars.currentCar.id = i;
                return true;
              }
            });
        }

        // If sortBy was passed by parameter then use this as sorting criteria.
        // Make sure such a sortBy field exists.
        if (req.query.sortBy &&
            _.some(CONSUM_TABLE_HEADERS, function(item) {
              return req.query.sortBy === item.sortBy;
            })
          ) {
          renderData.consumHead.activeColumn.sortBy = req.query.sortBy;
          var order = parseInt(req.query.order);
          if (_.isNumber(order) && Math.abs(order) === 1) {
            renderData.consumHead.activeColumn.order = order;
          }
        }

        // 2. Get consumption log for the selected car
        var sortObj = {};
        sortObj[renderData.consumHead.activeColumn.sortBy] =
          renderData.consumHead.activeColumn.order;

        // One query construct, two requests.
        Consumption
          .count()
          .where({
            reg: renderData.cars.currentCar.reg,
            userId: req.session.user.id
          })
          .exec(function(err, count) {
            if (err) return next(err);

            var consumCount = count,
                consumPage = req.query.page ? parseInt(req.query.page) : 1;

            renderData.consumPagination = consumPaginator(consumPage, consumCount);
            // Paginator may adjust the page so read it again
            consumPage = renderData.consumPagination.summary.currentPage;

            Consumption
              .find()
              .where({
                reg: renderData.cars.currentCar.reg,
                userId: req.session.user.id
              })
              //ex: '{logtime: -1}' //Sort by logtime desc
              .sort(sortObj)
              //TODO: skip should be 0 or 1?
              .skip(CONSUM_PER_PAGE * (consumPage - 1))
              .limit(CONSUM_PER_PAGE)
              .exec(function(err, consList) {

                if (err) return next(err);

                // 3. Cars information mapping
                renderData.cars.data = _.map(userCarList, function(item, index) {
                    return {
                      id: item._id,
                      make: item.makeId.title,
                      // Finding a sub-document http://mongoosejs.com/docs/subdocs.html
                      model: item.makeId.models.id(item.modelId).title,
                      year: item.year,
                      fuelType: item.fuelType._id,
                      engineSize: item.engineSize,
                      reg: item.reg,
                      active: index === renderData.cars.currentCar.id
                    };
                });

                // 4. Consumption information mapping
                renderData.consumptions.data = _.map(consList, function(i) {
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

                renderData.consumptions.avgCons = (_.reduce(consList, function(memo, record) {
                  return memo + record.consumption;
                }, 0) / consList.length).toFixed(3);

                renderData.consumptions.avgConsMpg = (_.reduce(consList, function(memo, record) {
                  return memo + record.consumptionMpg;
                }, 0) / consList.length).toFixed(3);

                res.render('consumption', renderData);
              });
          });
      });
  } else {
    req.session.error = 'Please log in.';
    res.redirect('/login');
  }
};