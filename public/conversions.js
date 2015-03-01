var converter = {};

converter.MILETOKMS = 1.60934;
converter.GALLONS_TO_LITER_US = 3.78541;
converter.GALLONS_TO_LITER_UK = 4.54609;

converter.milesToKms = function(miles) {
    return miles * converter.MILETOKMS;
};

converter.milesToKms = function(miles) {
    return miles * converter.MILETOKMS;
};

converter.gallonsToLiters = function(gallons) {
    return gallons * converter.GALLONS_TO_LITER_UK;
};

converter.kmsToMiles = function(kms) {
    return kms / converter.MILETOKMS;
};

converter.litersToGallons = function(liters) {
    return liters / converter.GALLONS_TO_LITER_UK;
};

converter.getConsumption = function(liters, kms) {
    return 100 * liters / kms;
};

converter.getConsumptionMpg = function(liters, kms) {
    return converter.kmsToMiles(kms) / converter.litersToGallons(liters);
};

// TODO what is the official way to make a file module or not?
if (require) {
    module.exports = converter;
}