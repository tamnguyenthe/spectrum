var express = require('express');
var router = express.Router();
//var User = require('../models/user');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    passwordConf: {
        type: String,
        required: true,
    }
});

var UserProgressSchema = new mongoose.Schema({
    username: String,
    caseNumber: Number,
    isViewed: Boolean,
    isAnswered: Boolean,
    isViewedTeacherNote: Boolean
}, {collection: "userprogresses"});

//authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({ email: email })
        .exec(function (err, user) {
            if (err) {
                return callback(err)
            } else if (!user) {
                var err = new Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(password, user.password, function (err, result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    return callback();
                }
            })
        });
};

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
});


var User = mongoose.model('User', UserSchema);
var UserProgress = mongoose.model('UserProgress', UserProgressSchema);

// GET route for reading data
router.get('/', function (req, res, next) {
  return res.render("mainpage", {});
});


router.get('/home', function (req, res, next) {
    if (req.session.userId) {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return next(error);
                } else {
                    if (user === null) {
                        var err = new Error('Not authorized! Go back!');
                        err.status = 400;
                        return next(err);
                    } else {
                        res.render("home", {username: user.username});
                    }
                }
            });
    } else {
        return res.render("home", {username: "guest"});
    }
});

router.get('/caseselect', function (req, res, next) {
    if (req.session.userId) {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return next(error);
                } else {
                    if (user === null) {
                        var err = new Error('Not authorized! Go back!');
                        err.status = 400;
                        return next(err);
                    } else {
                        res.render("caseselect", {username: user.username});
                    }
                }
            });
    } else {
        return res.render("caseselect", {username: "guest"});
    }
});

router.get('/lifecases', function (req, res, next) {
    if (req.session.userId) {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return next(error);
                } else {
                    if (user === null) {
                        var err = new Error('Not authorized! Go back!');
                        err.status = 400;
                        return next(err);
                    } else {
                        res.render("lifecases", {username: user.username});
                    }
                }
            });
    } else {
        return res.render("lifecases", {username: "guest"});
    }
});

router.get('/reflection', function (req, res, next) {
    if(req.session.userId) {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return next(error);
                } else {
                    if (user === null) {
                        var err = new Error('Not authorized! Go back!');
                        err.status = 400;
                        return next(err);
                    } else {
                        UserProgress.findOne({username: user.username, caseNumber: req.query.caseNumber}, function (error, userProgress) {
                            if (userProgress === null) {
                                var userP = {
                                    username: user.username,
                                    caseNumber: req.query.caseNumber,
                                    isViewed: true,
                                    isAnswered: false,
                                    isViewedTeacherNote: false
                                };
                                UserProgress.create(userP, function (error, userProg) {
                                    if (error) {
                                        return next(error);
                                    } else {
                                        return res.render("casestudy_" + req.query.caseNumber + "_Reflections", {});
                                    }
                                });
                            } else {
                                return res.render("casestudy_" + req.query.caseNumber + "_Reflections", {});
                            }
                        });
                    }
                }
            });
    } else {
        return res.render("casestudy_" + req.query.caseNumber + "_Reflections", {});
    }
});

router.get('/answer', function (req, res, next) {
    if(req.session.userId) {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return next(error);
                } else {
                    if (user === null) {
                        var err = new Error('Not authorized! Go back!');
                        err.status = 400;
                        return next(err);
                    } else {
                        UserProgress.findOneAndUpdate({username: user.username, caseNumber: req.query.caseNumber}, {$set:{isAnswered: true}}, function (error, doc) {
                            return res.render("casestudy_" + req.query.caseNumber +"_answers" , {});
                        });
                    }
                }
            });
    } else {
        return res.render("casestudy_" + req.query.caseNumber + "_answers", {});
    }
});

router.get('/tnote', function (req, res, next) {
    if(req.session.userId) {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return next(error);
                } else {
                    if (user === null) {
                        var err = new Error('Not authorized! Go back!');
                        err.status = 400;
                        return next(err);
                    } else {
                        UserProgress.findOneAndUpdate({username: user.username, caseNumber: req.query.caseNumber}, {$set:{isViewedTeacherNote: true}}, function (error, doc) {
                            return res.render("TNote_" + req.query.caseNumber, {});
                        });
                    }
                }
            });
    } else {
        return res.render("TNote_" + req.query.caseNumber, {});
    }
});


//POST route for updating data
router.post('/', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});


//POST route for updating data
router.post('/spectrumLogin', function (req, res, next) {
    // confirm that user typed same password twice
    if (req.body.password !== req.body.passwordConf) {
        var err = new Error('Passwords do not match.');
        err.status = 400;
        res.send("passwords dont match");
        return next(err);
    }

    if (req.body.email &&
        req.body.username &&
        req.body.password &&
        req.body.passwordConf) {

        var userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            passwordConf: req.body.passwordConf,
        }

        User.create(userData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                req.session.userId = user._id;
                return res.redirect('/profile');
            }
        });

    } else if (req.body.spectrumEmail && req.body.spectrumPassword) {
        User.authenticate(req.body.spectrumEmail, req.body.spectrumPassword, function (error, user) {
            if (error || !user) {
                var err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user._id;
                return res.redirect('/profile');
            }
        });
    } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});

// GET route after registering
router.get('/profile', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
            res.render("home", {username: user.username});
          //return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
        }
      }
    });
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/home');
      }
    });
  }
});

module.exports = router;