var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Post = require('./post');

var user = new mongoose.Schema({
  email: String,
  hashed_password: String,
  joined: { type: Date, default: Date.now }
});

user.pre('save', function(next) {
  this.hashed_password = this.model('User').hashPassword(this.password);
  next();
});

user.post('save', function(doc) {
  Post.update({ email: doc.email }, { _user: doc._id }, function(err) {
    if (err) console.log(err);
  });
});

user.pre('remove', function(next) {
  Post.update({ _user: this._id }, { _user: undefined }, function(err) {
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