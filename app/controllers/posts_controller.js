var helper = require("../../lib/helper"),
    db = require("../../lib/db"),
    Post = require('../models/post');

function index(response, request, params, postData) {
  Post.getAllConfirmed(function(posts) {
    helper.render("posts/index.html", null, response, 200);
  });
}

function add(response, request, params, postData) {
  helper.render("posts/new.html", null, response, 200);
}

exports.index = index;
exports.add = add;