const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const stylus = require('stylus');
const nib = require('nib');
const fs = require('fs');

const index = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(function (req, res, next) {
  // Hijack the render function to insert a `pg`
  res._render = res.render;
  res.render = function(...params) {
    res.locals.pg = params[0];
    return res._render.apply(this, params);
  };
  next();
});

const hasSocial = fs.existsSync('./public/images/social.png');
app.use(function (req, res, next) {
  res.locals.base = req.get('host');
  res.locals.hasSocial = hasSocial;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// optional features, uncomment to use!

/* Mongoose */
// app.use(require('./lib/mongoose')());

/* Cachebusting */
app.use(require('./lib/cachebust')()); // heroku labs:enable runtime-dyno-metadata -a <<app>>

/* Helpers */
app.use(require('./lib/helpers'));

app.use('/', index);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
