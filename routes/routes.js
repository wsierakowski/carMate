var shared = require('./shared'),
    mainRoutes = require('./api.js'),
    consRoutes = require('./consumption.js');

module.exports = function(app) {
    app.get('/', mainRoutes.home);
    app.get('/dashboard', shared.checkUser, mainRoutes.dashboard);

    app.get('/consumption', shared.checkUser, shared.getUserCars, consRoutes.consumptionGet);
    app.get('/consumption/:usercarid', shared.checkUser, shared.getUserCars, consRoutes.consumptionGet);
    app.get('/consumptionnew', shared.checkUser, shared.getUserCars, consRoutes.consumptionNewGet);
    app.get('/consumptionnew/:usercarid', shared.checkUser, shared.getUserCars, consRoutes.consumptionNewGet);
    app.post('/consumptionnew', shared.checkUser, shared.getUserCars, consRoutes.consumptionNewPost);

    app.get('/logout', mainRoutes.logout);

    app.get('/login', mainRoutes.loginGet);
    app.post('/login', mainRoutes.loginPost);

    app.get('/register', mainRoutes.registerGet);
    app.post('/register', mainRoutes.registerPost);
    // app.get('/jade', api.jadeGet);
    // app.get('/jadeLogin', api.jadeLogin);
};