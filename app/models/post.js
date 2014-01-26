var mongoose = require('mongoose'),
    marked = require('marked'),
    crypto = require('crypto'),
    dateformat = require('dateformat'),
    helper = require('../../lib/helper');

var renderer = new marked.Renderer();
renderer.heading = function(text, level) {
  var hashes = '';
  for (var i = 0; i < level; i++) {
    hashes += '#';
  }
  return '<p>' + hashes + ' ' + text + '</p>';
};
renderer.hr = function() {
  return '';
};
marked.setOptions({
  sanitize: true,
  renderer: renderer
});

var post = new mongoose.Schema({
  title:              { type: String, required: true },
  text_markdown:      { type: String, required: true },
  text_formatted:     String,
  email:              String,
  _user:              { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  _category:          { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' },
  confirmation_code:  String,
  confirmed:          { type: Boolean, default: false },
  date:               { type: Date, default: Date.now }
});

post.path('email').validate(function(email) {
  return helper.testEmail(email);
});

post.path('title').validate(function(title) {
  return title.trim().length > 0;
});

post.path('text_markdown').validate(function(text) {
  return text.trim().length > 0;
});

post.pre('save', function(next) {
  this.generateConfirmationCode();
  this.formatText(next);
});

post.methods = {
  prettyDate: function(format) {
    return dateformat(this.date, format);
  },

  generateConfirmationCode: function() {
    var text = (new Date()) + "--" + this.email + "--" + this.title + "--" + this.text_markdown;

    var shasum = crypto.createHash('sha1');
    shasum.update(text);
    this.confirmation_code = shasum.digest('hex');
  },

  formatText: function(callback) {
    marked(this.text_markdown, function(err, result) {
      if (err) throw err;
      this.text_formatted = result;
      
      callback();
    }.bind(this));
  },

  url: function() {
    return "/" + this._category.slug + "/" + this.id;
  }
};

post.statics = {
  findWithCategory: function(id, category) {
    var newID = mongoose.Types.ObjectId(id);
    return this.findOne({_id: newID, _category: category._id});
  },

  findByIdString: function(id) {
    var newID = mongoose.Types.ObjectId(id);
    return this.findById(newID);
  }
};

module.exports = mongoose.model('Post', post);