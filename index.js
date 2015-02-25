var http = require('http'),
    path = require('path'),

    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    mongoose = require('mongoose'),

    conf = require('./conf.json'),

    shared = require('./routes/shared');

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

app.use("/public", express.static(path.join(__dirname, 'public')));
app.use(bodyParser());
app.use(cookieParser('grzybniaZPatatajnia'));
app.use(session());

// Do we still need that?
app.use(shared.clearMessages);

require('./routes/routes.js')(app);

var port = process.argv[2] || conf.general.port;
http
    .createServer(app)
    .listen(port, function(data) {
        console.log('Express server listening on port %d.', port);
    });