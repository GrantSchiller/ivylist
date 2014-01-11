var ejs = require('ejs'),
    fs = require('fs'),
    User = require('../app/models/user');

var types = {
  "html": "html",
  "js": "javascript"
};

function render(location, data, request, response, status) {
  var file = "./app/views/" + location + ".ejs";

  data = data || { };
  data.filename = file;
  data.currentUser = request.user;

  fs.readFile(file, 'utf8', function(err, template) {
    if (err) {
      console.log(err);
    } else {
      var body = ejs.render(template, data);
      response.writeHead(status, {"Content-Type" : "text/" + types[location.split(".")[1]] });
      response.write(body);
      response.end();

      console.log("  Rendered 'views/" + location + ".ejs' (" + status + ")");
      console.log("  Completed in " + (new Date() - request.startTime) + "ms\n");
    }
  });
}

function renderError(code, request, response) {
  render("errors/" + code + ".html", { title: "Error " + code }, request, response, code);
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
exports.renderError = renderError;
exports.redirectTo = redirectTo;
exports.signIn = signIn;
exports.signOut = signOut;
exports.currentUser = currentUser;