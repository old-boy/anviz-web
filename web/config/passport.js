const LocalStrategy  = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Load user model
require('../models/UserSchema');
const User = mongoose.model('users');

module.exports = function(passport){
  passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    // Match user
    User.findOne({
      email:email
    }).then(user => {
      if(!user){
        return done(null, false, {message: 'No User Found'});
      } 

      // Match password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        console.log('password   ' + password)
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        } else {
          return done(null, false, {message: 'Password Incorrect'});
        }
      })
    })
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}