var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Post = require('./post');

var user = new mongoose.Schema({
  email: { type: String, required: true },
  hashed_password: String,
  joined: { type: Date, default: Date.now }
});

var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var target = "friendscentral.org";

user.path('email').validate(function(email) {
  return (re.test(email) && (email.substr(email.length - target.length) == target));
});

user.pre('save', function(next) {
  if (this.password && this.password..length > 4) {
    this.hashed_password = this.model('User').hashPassword(this.password);
    next();
  } else {
    next(new Error("Password must be >5 chars"));
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

};

user.statics = {
  hashPassword: function(password) {
    var text = "--IVYSALT--" + password;

    var shasum = crypto.createHash('sha1');
    shasum.update(text);
    return shasum.digest('hex');
  },

  authenticate: function(email, password) {
    return this.findOne({ email: email, hashed_password: this.hashPassword(password) });
  }
};

module.exports = mongoose.model('User', user);