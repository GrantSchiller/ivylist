var ejs = require('ejs'),
    fs = require('fs'),
    sendgrid = require('sendgrid')(process.env.SENDGRID_USER, process.env.SENDGRID_KEY),
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

function sendEmail(options) {
  sendgrid.send(options, function(err, json) {
    if (err) {
      console.log(err);
    } else {
      console.log("    Email sent to: " + options.to + "\n");
    }
  });
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

var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var target = "upenn.edu";

function emailValid(email) {
  return (re.test(email) && (email.substr(email.length - target.length) == target)) || (email == "mluzuriaga@friendscentral.org") || (email == "gschiller@friendscentral.org");
}

exports.renderPartial = renderPartial;
exports.renderError = renderError;
exports.sendEmail = sendEmail;
exports.signIn = signIn;
exports.signOut = signOut;
exports.currentUser = currentUser;
exports.emailValid = emailValid;