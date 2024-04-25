/////// app.js

const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const User = require('./userModel.js');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const mongoDb = process.env.DATABASE_URL;
mongoose.connect(mongoDb);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

const app = express();
app.set('views', __dirname);
app.set('view engine', 'ejs');

app.use(
  session({
    secret: 'cats',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: mongoDb,
    }),
  }),
  (req, res, next) => {
    console.log('Calls app.use(session())');
    next();
  }
);
app.use(passport.session(), (req, res, next) => {
  console.log('Calls "app.use(passport.session())"');
  next();
});
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log(req.sessionID);
  console.log(req.session);
  console.log(req.user);
  next();
});
// PASSPORT

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

//ROUTE
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});
app.get('/sign-up', (req, res) => {
  res.render('sign-up-form');
});

app.post('/sign-up', async (req, res, next) => {
  try {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });
    bcrypt.hash(user.password, 10, async (err, hashedPassword) => {
      // if err, do something
      if (err) {
        console.log(err);
        return;
      } else {
        user.password = hashedPassword;
        const result = await user.save();
      }
    });

    res.redirect('/');
  } catch (err) {
    return next(err);
  }
});

require('./passport.js');

app.post('/log-in', passport.authenticate('local'), (req, res, next) => {
  console.log('done passport.authenticate, redirecting...');
  console.log(`did it deserialize? ${req.user.username}`);
  res.redirect('/');
});

app.get('/log-out', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

//passport config

app.listen(3000, () => console.log('app listening on port 3000!'));
