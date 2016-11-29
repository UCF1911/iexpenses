var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(session);
//var moment = require('moment');

var routes = require('./routes/index');

var app = express();

//mongoose.connect('localhost:27017/iexpense');
mongoose.connect('ucf:ucf@ds111748.mlab.com:11748/iexpense');

// view engine setup
app.engine('.hbs', expressHbs({
    defaultLayout: 'layout',
    extname: '.hbs',
    helpers: {
        fromJSON: function (object) {
            return JSON.stringify(object);
        }
        ,
        reverseHB: function(arr){
            arr.reverse();
         }
        ,
        add1HB: function(i){
         return i+1;
        }
        ,
        reverseCounterHB: function(l, index){
         return l-index;
        }
        ,
        less50HB:function(i){
            return i<50;
        }
        ,
        dayHB: function(d){
            return d.getDate();
        },
        monthHB: function(d){
            return d.getMonth()+1;
        },
        yearHB: function(d){
            return d.getFullYear();
        },
        hourHB:function(d) {
            if(d.getHours()<10) {
                return '0' + d.getHours();
            }
            return d.getHours();

        },minutesHB:function(d){
            if(d.getMinutes()<10) {
                return '0' + d.getMinutes();
            }
            return d.getMinutes();
        }
    }
}));
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    secret: 'mySessionsKey',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection}),
    cookie: {maxAge:180*60*1000} //180 minutes
}));

app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
