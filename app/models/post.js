var mongoose = require('mongoose'),
    marked = require('marked'),
    crypto = require('crypto'),
    dateformat = require('dateformat');

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
  title: String,
  text_markdown: String,
  text_formatted: String,
  email: String,
  _user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  confirmation_code: String,
  confirmed: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
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
  }
};

post.statics = {
  numPages: function(perPage, callback) {
    this.count({ confirmed: true }, function(err, count) {
      callback(Math.ceil(count/perPage));
    });
  },

  findPostsOnPage: function(currentPage, totalPages, perPage, callback) {
    return this.find({ confirmed: true }).sort({date: -1}).skip(perPage * (currentPage - 1)).limit(perPage);
  },

  findByIdString: function(id) {
    var newID = mongoose.Types.ObjectId(id);
    return this.findById(newID);
  }
};

module.exports = mongoose.model('Post', post);