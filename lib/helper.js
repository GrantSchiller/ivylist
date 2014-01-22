var ejs = require('ejs'),
    fs = require('fs'),
    User = require('../app/models/user');

var types = {
  "html": "html",
  "js": "javascript"
};

var templates = {};

function _renderTemplate(location, template, data, request, response, status) {
  var body = ejs.render(template, data);
  response.writeHead(status, {"Content-Type" : "text/" + types[location.split(".")[1]] });
  response.write(body);
  response.end();

  console.log("  Rendered 'views/" + location + ".ejs' (" + status + ")");
  console.log("  Completed in " + (new Date() - request.startTime) + "ms\n");
}

function render(location, data, request, response, status) {
  var file = "./app/views/" + location + ".ejs";

  data = data || { };
  data.filename = file;
  data.currentUser = request.user;
  data.jsURL = data.customJS ? location.split(".")[0] : undefined;

  var template = templates[file];

  if (template) {
    console.log("  Rendering from cache...");
    _renderTemplate(location, template, data, request, response, status)
  } else {
    fs.readFile(file, 'utf8', function(err, contents) {
      if (err) {
        console.log(err);
      } else {
        console.log("  Caching template for future use...");
        templates[file] = contents;
        _renderTemplate(location, contents, data, request, response, status);
      }
    });
  }
}

function renderPartial(location, data, handler) {
  var file = "./app/views/" + location + ".ejs";

  fs.readFile(file, 'utf8', function(err, template) {
    if (err) {
      console.log(err);
    } else {
      var body = ejs.render(template, data);
      handler(body);
    }
  });
}

function renderError(code, response) {
  response.status(404);
  response.render('errors/' + code, { title: "Error " + code});
  // render("errors/" + code + ".html", { title: "Error " + code }, request, response, code);
}

function redirectTo(path, request, response) {
  var baseUrl = request.headers.host;

  response.writeHead(303,
    { Location: 'http://' + baseUrl + path }
  );
  response.end();

  console.log("  Redirecting to '" + path + "' (" + 303 + ")");
  console.log("  Completed in " + (new Date() - request.startTime) + "ms\n");
}

function signIn(user, request) {
  console.log("  Signing in: " + user.email);
  request.session.loggedInEmail = user.email;
}

function signOut(request) {
  console.log("  Signing out: " + request.session.loggedInEmail);
  request.session.loggedInEmail = undefined;
}

function currentUser(request, handler) {
  var email = request.session.loggedInEmail;

  if (email) {
    User.findOne({ email: email }, function(err, user) {
      if (user) {
        handler(user);
      } else {
        request.session.loggedInEmail = undefined;
        handler(undefined);
      }
    });
  } else {
    handler(undefined);
  }
}

exports.render = render;
exports.renderPartial = renderPartial;
exports.renderError = renderError;
exports.redirectTo = redirectTo;
exports.signIn = signIn;
exports.signOut = signOut;
exports.currentUser = currentUser;