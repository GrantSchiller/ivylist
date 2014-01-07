var helper = require("../../lib/helper"),
    db = require("../../lib/db"),
    nodemailer = require("nodemailer"),
    Post = require('../models/post');

// var smtpTransport = nodemailer.createTransport("SMTP", {
//   service: "Gmail",
//   auth: {
//     user: "max@luzuriaga.com",
//     pass: ""
//   }
// });

function index(response, request, params, postData) {
  Post.getAllConfirmed(function(posts) {
    helper.render("posts/index.html", { posts: posts }, response, 200);
  });
}

function add(response, request, params, postData) {
  var post = new Post();
  helper.render("posts/add.html", { post: post }, response, 200);
}

function create(response, request, params, postData) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var target = "friendscentral.org";
  if (re.test(postData.email) && (postData.email.substr(postData.email.length - target.length) == target) && postData.title && postData.text) {
    var post = new Post({
      title: postData.title,
      email: postData.email,
      text_markdown: postData.text
    });

    post.save(function() {
      var confirmLink ='http://' + request.headers.host + "/confirm/" + post.confirmation_code;
      var mail = nodemailer.mail;

      mail({
        from: "Max Luzuriaga <max@luzuriaga.com>",
        to: post.email,
        subject: "Confirm your Ivylist post",
        text: confirmLink,
        html: '<a href="' + confirmLink + '">Confirm your post!</a>'
      });

      // var mailOptions = {
      //   from: "Max Luzuriaga <max@luzuriaga.com>",
      //   to: post.email,
      //   subject: "Confirm your Ivylist post",
      //   text: confirmLink,
      //   html: '<a href="' + confirmLink + '">Confirm your post!</a>'
      // }

      // smtpTransport.sendMail(mailOptions, function(error, response){
      //   if(error){
      //     console.log(error);
      //   }else{
      //     console.log("Message sent: " + response.message);
      //   }
      // });

      helper.render("posts/create.html", { post: post }, response, 200);
    });
  } else {
    helper.redirectTo("/new", request, response);
  }
}

function confirm(response, request, params, postData) {
  Post.findByConfirmationCode(params.confirmation_code, function(post) {
    if (post) {
      if (post.confirmed) {
        helper.redirectTo("/posts/" + post.id, request, response);
      } else {
        post.confirm(function() {
          helper.redirectTo("/posts/" + post.id, request, response);
        });
      }
    } else {
      helper.renderError(404, response);
    }
  });
}

exports.index = index;
exports.add = add;
exports.create = create;
exports.confirm = confirm;