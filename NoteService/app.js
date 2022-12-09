var createError = require('http-errors');
var express = require('express');
var path = require('path');

var logger = require('morgan');
var cors = require('cors');
var session = require('express-session')


var notesRouter = require('./routes/notes');

var app = express();

// session set up
app.set('trust proxy', 1)
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: {
    sameSite: 'lax',
    maxAge: 30 * 60000, // 30 minutes
    }
}))

// cors 
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.options('*', cors());

// database
let monk = require('monk');
const mongodbServerURL = 'localhost:27017/assignment2';
let db = monk(mongodbServerURL);

app.use((req, res, next) => {
  req.db = db;
  next();
})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, 'public')));



app.use('/', notesRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

// module.exports = app;
app.listen(3001, () => console.log("Listening on port 3001"));