var helper = require("../../lib/helper"),
    db = require("../../lib/db");

function index(response, request, params, postData) {
  Idea.count(function(c) {
    helper.render("ideas/index.html", { count: c }, response, 200);
  });
}

function submit(response, request, params, postData) {
  var r = function(e, c) {
    if (params.isAjax) {
      helper.render("ideas/submit.js", { error: e, count: c }, response, 200);
    } else {
      helper.redirectTo("/", request, response);
    }
  };

  if (/\S/.test(postData.idea)) {
    var idea = new Idea( { name: postData.idea } );

    idea.save(function() {
      Idea.count(function(c) {
        r(false, c);
      });
    });
  } else {
    Idea.count(function(c) {
      r(true, c);
    });
  }
}

function count(response, request, params, postData) {
  Idea.count(function(c) {
    helper.render("ideas/count.js", { count: c }, response, 200);
  });
}

function destroy(response, request, params, postData) {
  var r = function(eye_dee) {
    if (params.isAjax) {
      helper.render("ideas/destroy.js", { id: eye_dee }, response, 200);
    } else {
      helper.redirectTo("/admin", request, response);
    }
  }

  Idea.find(parseInt(params.id), function(idea) {
    if (idea) {
      var id = idea.id;
      idea.destroy(function() {
        r(id);
      });
    } else {
      r(null);
    }
  });
}

exports.index = index;
exports.submit = submit;
exports.count = count;
exports.destroy = destroy;