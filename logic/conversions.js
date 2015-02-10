var MILETOKMS = 1.60934,
    GALLONS_TO_LITER_US = 3.78541,
    GALLONS_TO_LITER_UK = 4.54609;

exports.milesToKms = function(miles) {
    return miles * MILETOKMS;
};

exports.gallonsToLiters = function(gallons) {
    return gallons * GALLONS_TO_LITER_UK;
};

exports.kmsToMiles = function(kms) {
    return kms / MILETOKMS;
};

exports.litersToGallons = function(liters) {
    return liters / GALLONS_TO_LITER_UK;
};

exports.getConsumption = function(liters, kms) {
    return 100 * liters / kms;
};

exports.getConsumptionMpg = function(liters, kms) {
    return kmsToMiles(kms) / litersToGallons(liters);
};