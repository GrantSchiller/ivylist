var mongoose = require('mongoose'),
    Post = require('./post');

var category = new mongoose.Schema({
  slug: { type: String, required: true },
  name: { type: String, required: true }
});

category.methods = {
  findPosts: function() {
    return Post.find({ confirmed: true, category: this.slug });
  }
};

category.statics = {

};

module.exports = mongoose.model('Category', category);