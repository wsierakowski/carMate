// http://en.wikipedia.org/wiki/Fuel_efficiency

var _ = require('underscore'),
  mongoose = require('mongoose'),

  UserCar = require('../models/usercar.js'),
  Car = require('../models/car.js'),
  FuelType = require('../models/fuelType.js'),
  Consumption = require('../models/consumption.js'),

  navbar = require('./navbar.js'),
  strForm = require('../myutils/stringFormatter.js'),
  conv = require('../public/conversions.js'),

  paginator = require('../myutils/paginator.js');

// defaults
var CONSUM_PER_PAGE = 10,
    CONSUM_BUTTON_NUM = 5,

    MIN_CONSUM_VAL = 1,
    MAX_CONSUM_VAL = 50,

    ERRLOC_CONSUMPTION_NEW_POST = "ERRLOC_CONSUMPTION_NEW_POST",

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

  // TODO check what if there is no cars for that user
  renderData.cars.currentCar.reg = req.userCarsList[0].reg;

  // If car id was returned as a param then this car will be the current car.
  // If car from the url param doesn't exists then stay with defaults.
  if (req.params.usercarid) {
    // bit hacky way to get the reg and populate id
    _.find(req.userCarsList, function(item, i) {
        if (item._id.toString() === req.params.usercarid) {
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

  var filter = {
    reg: renderData.cars.currentCar.reg,
    userId: req.session.user.id
  };

  // One query construct, two requests.
  Consumption
    .count()
    .where(filter)
    .exec(function(err, count) {
      if (err) return next(err);

      var consumCount = count,
          consumPage = req.query.page ? parseInt(req.query.page) : 1;

      renderData.consumPagination = consumPaginator(consumPage, consumCount);
      // Paginator may adjust the page so read it again
      consumPage = renderData.consumPagination.summary.currentPage;

      Consumption
        .find()
        .where(filter)
        //ex: '{logtime: -1}' //Sort by logtime desc
        .sort(sortObj)
        //TODO: skip should be 0 or 1?
        .skip(CONSUM_PER_PAGE * (consumPage - 1))
        .limit(CONSUM_PER_PAGE)
        .exec(function(err, consList) {

          if (err) return next(err);

          // 3. Cars information mapping
          renderData.cars.data = _.map(req.userCarsList, function(item, index) {
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

          // TODO: This is a wrong way to calculate average as it only accounts for
          // the returned paginated data, not all numbers. We need to use aggregate.
          // http://docs.mongodb.org/manual/reference/operator/aggregation/group/
          // renderData.consumptions.avgCons = (_.reduce(consList, function(memo, record) {
          //   return memo + record.consumption;
          // }, 0) / consList.length).toFixed(3);

          // renderData.consumptions.avgConsMpg = (_.reduce(consList, function(memo, record) {
          //   return memo + record.consumptionMpg;
          // }, 0) / consList.length).toFixed(3);

          // We do casting here as mongoose isn't doing this for us in the aggregate:
          // http://stackoverflow.com/questions/14551387/cant-use-match-with-mongoose-and-the-aggregation-framework
          // Also we need to use mongoose.Types.ObjectId instead of mongoose.Schema.Types.ObjectId otherwise
          // it will not work!
          // Example of filter object:
          // {reg: "99W811", userId: new mongoose.Types.ObjectId("54e87f07dd248cc830c53403")}
          filter.userId = new mongoose.Types.ObjectId(filter.userId);
          Consumption
            .aggregate([
              {$match: filter},
              {$group: {
                _id: 0,
                average: {$avg: "$consumption"},
                averageMpg: {$avg: "$consumptionMpg"},
                min: {$min: "$consumption"},
                minMpg: {$min: "$consumptionMpg"},
                max: {$max: "$consumption"},
                maxMpg: {$max: "$consumptionMpg"}
              }
            }], function(err, aggres) {
              if (err) return next(err);
              console.log(aggres);

              renderData.consumptions.avgCons = aggres[0].average;
              renderData.consumptions.avgConsMpg = aggres[0].averageMpg;

              res.render('consumption', renderData);
            });
        });
    });
};

exports.consumptionNewGet = function(req, res, next) {

  var renderData = {
    userName: req.session.user.name,
    menu: navbar('Consumption'),

    // If there is more than just one car, the the user has a choice.
    // By default the first one return will be picked.
    cars: {
      currentCar: {reg: null, id: 0},
      data: null
    }
  };

  // TODO check what if there is no cars for that user
  renderData.cars.currentCar.reg = req.userCarsList[0].reg;

  // If car id was returned as a param then this car will be the current car.
  // If car from the url param doesn't exists then stay with defaults.
  if (req.params.usercarid) {
    // bit hacky way to get the reg and populate id
    _.find(req.userCarsList, function(item, i) {
        if (item._id.toString() === req.params.usercarid) {
          renderData.cars.currentCar.reg = item.reg;
          renderData.cars.currentCar.id = i;
          return true;
        }
      });
  }

  if (req.session.submitError && req.session.submitError.location === ERRLOC_CONSUMPTION_NEW_POST) {
    renderData.submitError = {};
    renderData.submitError.data = req.session.submitError.data;
    renderData.submitError.msg = req.session.submitError.msg;
    req.session.submitError = null;
  }

  // TODO DRY?
  renderData.cars.data = _.map(req.userCarsList, function(item, index) {
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
  res.render('consumptionnew', renderData);
};

exports.consumptionNewPost = function(req, res, next) {
  //console.log("Received this: " + JSON.stringify(req.body));

  // Form sends only these input elements that are not disabled, in our case
  // we need only kms or miles and liters or gallons. We then calculate it again
  // here on the server side - we don't trust calculations on the client side -
  // they might be tampered.

  // For the puprpose of this tutorial we accept the fact that we are going to do
  // conversions here and also the same conversions in the consumptions model's
  // pre-save functions.

  // First we need to make sure the input data is correct, otherwise respond with error.
  var errMsg, kms, liters, miles, gallons, consum, car;
  // 1. Validation if we have got all necessary input elements
  if (!req.body.kms && !req.body.miles) {
    errMsg = "KMs or miles are required to compute consumption.";
  }

  if (!req.body.liters && !req.body.gallons) {
    errMsg = "Liters or gallons are required to compute consumption.";
  }

  // 2. Validation if the input elements are positive float numbers
  if (req.body.kms) kms = parseFloat(req.body.kms);
  else if (req.body.miles) miles = parseFloat(req.body.miles);
  if (req.body.liters) liters = parseFloat(req.body.liters);
  else if (req.body.miles) miles = parseFloat(req.body.miles);

  if (isNaN(kms) && isNaN(miles) || isNaN(liters) && isNaN(gallons)) {
    errMsg = "Input values must be floats.";
  }

  // 3. Validation if the calculated values are within realistic values, maybe the
  //    user mistyped a value
  if (miles) kms = conv.milesToKms(miles).toFixed(3);
  if (gallons) liters = conv.gallonsToLiters(gallons).toFixed(3);
  consum = conv.getConsumption(liters, kms).toFixed(3);

  if (consum < MIN_CONSUM_VAL || consum > MAX_CONSUM_VAL) {
    errMsg = "Your consumption seems to be a bit unrealistic: " + consum +
    ". Are you sure you provided correct input values?";
  }

  if (!req.body.carid) {
    errMsg = "Unknown car id.";
  }

  car = _.find(req.userCarsList, function(item) {
    return item._id.toString() === req.body.carid;
  });
  if (!car) {
    errMsg = "Incorrect car.";
  }

  if (errMsg) {
    req.session.submitError = {};
    req.session.submitError.location = ERRLOC_CONSUMPTION_NEW_POST;
    req.session.submitError.msg = errMsg;
    req.session.submitError.data = req.body;

    return res.redirect('/consumptionnew');
  }

  Consumption.create({
      kms: kms,
      liters: liters,
      reg: car.reg,
      userId: req.session.user.id
    }, function(err, consumRes) {

    if (err) return next(err);
    res.redirect('/Consumption');
  });
};