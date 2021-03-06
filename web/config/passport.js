const LocalStrategy  = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = require('../../db/config/key').secretName;

// Load user model
const UserSchema = require('../models/UserSchema');


module.exports = function(passport){
  passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    console.log('获取的字段：' + email+'/'+ password)
    // Match user
    UserSchema.findOne({
      email:email
    }).then(users => {
      console.log('user存在吗？' + users)
      if(!users){
        return done(null, false, {message: 'No User Found'});
      } 

      // Match password
      bcrypt.compare(password, users.password, (err, isMatch) => {
        console.log('password   ' + password);
        console.log('user.password' + users.password);
        if(err) throw err;
        if(isMatch){
          console.log('isMatch   ' + isMatch)
          //登录成功，返回 token
          const rule = {
              id: users._id,
              email:users.email,
              admin:'true'
          };

          jwt.sign(rule,secretKey,{expiresIn:3600},(err,token) => {
            if(err) throw err;
            const tokenKey = {
              sucess:true,
              token:"Bearer " + token
            };
            console.log('token         ' + res.json(tokenKey))
          });
          return done(null, users);
        } else {
          return done(null, false, {message: 'Password Incorrect'});
        }
      })
    })
  }));


  /**下面两个方法是用来对数据进行序列化的
   * serializeUser  将users.id序列化到session中
   * deserializeUser  若id存在则从数据库中查询users并存储与req.users中
   * 
   * 此处的 users 为表名
   */
  passport.serializeUser(function(users, done) {
    done(null, users.id);
  });
  
  passport.deserializeUser(function(id, done) {
    UserSchema.findById(id, function(err, users) {
      done(err, users);
    });
  });
}