var helper = require("../../lib/helper"),
    db = require("../../lib/db");

function index(response, request, params, postData) {
  Idea.count(function(c) {
    helper.render("ideas/index.html", { count: c }, response, 200);
  });
}

exports.index = index;