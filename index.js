var http = require('http'),

    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    mongoose = require('mongoose'),

    routeApi = require('./routes/api.js'),
    routeConsumption = require('./routes/consumption.js'),

    conf = require('./conf.json');

/*
mongodb://username:password@host:port/database?options
 */
mongoose.connect(
    'mongodb://' +
    //conf.db.username + ':' +
    //conf.db.password + '@' +
    conf.db.host + ':' +
    conf.db.port + '/' +
    conf.db.database
);

// todo: http://stackoverflow.com/questions/14588032/mongoose-password-hashing

mongoose.connection.on('open', function() {
    console.log('Db connection opened.');
    //console.log(mongoose.connection.collection);
    // mongoose.connection.db.collectionNames(function(err, names) {
    //     if (err) throw err;
    //     console.log('--->', names);
    // });
});

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

var app = express();

app.set('views', './views');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);

app.locals.title = "Your Best Car Mate";

if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

app.use(bodyParser());
app.use(cookieParser('grzybniaZPatatajnia'));
app.use(session());
app.use(function(req, res, next){
    if (req.method === 'POST') {
        routeApi.clearMessages(req, res);
    }
    next();
});

app.get('/', routeApi.home);
app.get('/dashboard', routeApi.dashboard);
app.get('/consumption', routeConsumption.consumptionGet);
app.get('/consumption/:id', routeConsumption.consumptionGet);

app.get('/logout', routeApi.logout);

app.get('/login', routeApi.loginGet);
app.post('/login', routeApi.loginPost);

app.get('/register', routeApi.registerGet);
app.post('/register', routeApi.registerPost);
// app.get('/jade', api.jadeGet);
// app.get('/jadeLogin', api.jadeLogin);

var port = process.argv[2] || conf.general.port;
http
    .createServer(app)
    .listen(port, function(data) {
        console.log('Express server listening on port %d.', port);
    });