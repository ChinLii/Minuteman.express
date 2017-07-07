var express = require('express');
var cluster = require('cluster');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var config = require('./config/database.js');
var mongoose = require('mongoose');

var port = process.env.PORT || 3000;
var cCPUs = require('os').cpus().length;
mongoose.Promise = global.Promise;
mongoose.connect(config.url);

mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + (config.url));
});

mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

if (cluster.isMaster) {
    for (var i = 0; i < cCPUs; i++) {
        cluster.fork();
    }
    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online. ');
    });
    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died.');
    });

} else {
    var htmlRouter = require('./app/routers/htmlRouter');
    var dataRouter = require('./app/routers/dataRouter');
    var apiRouter = require('./app/routers/apiRouter');
    var authHtmlRouter = require('./app/routers/authHtmlRouter');
    var app = express();
    app.use(cookieParser());
    /*app.use(flash());
    app.use(session({
        name: 'server-session-cookie-id',
        secret: config.secret,
        resave: false,
        saveUninitialized: false,
        unset: 'keep'
    })); */

    app.use(express.static(__dirname + '/public'));
    app.use(bodyParser()); // get information from html forms
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(morgan('dev'));
    //setting template for app
    app.set('view engine', 'ejs');
    app.use('/', htmlRouter,authHtmlRouter);
    app.use('/data',dataRouter);
    app.use('/api',apiRouter);
   

    app.listen(port);
    console.log('The magic happens on port ' + port);
}