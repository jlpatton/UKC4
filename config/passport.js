const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');


// Load donor model
require('../models/Donor');
const Donor = mongoose.model('donors');


module.exports = function(passport){
    passport.use('local-signin', new LocalStrategy({passReqToCallback : true},(username,password,done) => {
        Donor.findOne({ email: username }, function (err, user) {
            if (err) { return done(err); }
            if (!donor) { return done(null, false); }
            // if (!donor.verifyPassword(password)) { return done(null, false); }
            return done(null, donor);
          });
    }));
}
