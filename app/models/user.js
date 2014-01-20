var mongoose = require('mongoose'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt'),
    Post = require('./post');

var user = new mongoose.Schema({
  email:              { type: String, required: true },
  hashed_password:    String,
  password_salt:      String,
  joined:             { type: Date, default: Date.now },
  confirmation_code:  String,
  confirmed:          { type: Boolean, default: false }
});

var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var target = "friendscentral.org";

user.path('email').validate(function(email) {
  return (re.test(email) && (email.substr(email.length - target.length) == target));
});

user.pre('save', function(next) {
  this.model('User').count({ email: this.email }, function(err, count) {
    if (count > 0) {
      next(new Error("Email must be unique."))
    } else {
      next();
    }
  });
});

user.pre('save', function(next) {
  if (this.password && this.password.length > 4 && (this.confirmed || this.password == this.password_confirmation)) {
    bcrypt.genSalt(10, function(err, salt) {
      this.password_salt = salt;
      this.model('User').hashPassword(this.password, this.password_salt, function(hash) {
        this.hashed_password = hash;
        this.generateConfirmationCode();
        next();
      }.bind(this));
    }.bind(this));
  } else {
    next(new Error("Password must be >5 chars."));
  }
});

user.post('save', function(doc) {
  Post.update({ email: doc.email }, { _user: doc._id }, { multi: true }, function(err) {
    if (err) console.log(err);
  });
});

user.pre('remove', function(next) {
  Post.update({ _user: this._id }, { _user: undefined }, { multi: true }, function(err) {
    if (err) console.log(err);
    next();
  });
});

user.methods = {
  generateConfirmationCode: function() {
    var text = (new Date()) + "--" + this.email + "--" + this.hashed_password;

    var shasum = crypto.createHash('sha1');
    shasum.update(text);
    this.confirmation_code = shasum.digest('hex');
  },
};

user.statics = {
  hashPassword: function(password, salt, callback) {
    bcrypt.hash(password, salt, function(err, hash) {
      callback(hash);
    });
  },

  authenticate: function(email, password, callback) {
    this.findOne({ email: email }).exec(function(err, user) {
      if (user) {
        this.hashPassword(password, user.password_salt, function(hash) {
          if (hash == user.hashed_password) {
            callback(user);
          } else {
            callback(null);
          }
        });
      } else {
        callback(null);
      }
    }.bind(this));
  }
};

module.exports = mongoose.model('User', user);