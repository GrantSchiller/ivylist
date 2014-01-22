var ejs = require('ejs'),
    fs = require('fs'),
    User = require('../app/models/user');

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

exports.renderPartial = renderPartial;
exports.renderError = renderError;
exports.signIn = signIn;
exports.signOut = signOut;
exports.currentUser = currentUser;