const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./userModel');
const bcrypt = require('bcryptjs');

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      console.log('calls Local Strategy');
      const user = await User.findOne({ username: username });
      const match = await bcrypt.compare(password, user.password);
      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }
      if (!match) {
        return done(null, false, { message: 'Incorrect password' });
      }
      console.log('Local Strategy PASSED!');
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);
passport.serializeUser((user, done) => {
  console.log('serializeUser');
  done(null, { id: user.id, username: user.username });
});

passport.deserializeUser(async (user, done) => {
  console.log('deserializeUser');
  done(null, user);
});
