var mongoose = require('mongoose'),
    Post = require('./post');

var category = new mongoose.Schema({
  name: { type: String, required: true }
});

category.methods = {

};

category.statics = {

};

module.exports = mongoose.model('Category', category);