var db = require("./lib/db.js"),
    Post = require("./app/models/post"),
    Category = require("./app/models/category");

process.env.MONGOLAB_URI = process.env.MONGOLAB_URI || "mongodb://localhost/ivylist_development";

desc('Create seed posts');
task('seed', {async: true}, function(username, password) {
  db.connect(function() {
    Category.findOne({ slug: 'misc' }, function(err, category) {
      var post = new Post({
        title: 'This is a fresh new test post',
        email: 'gschiller@friendscentral.org',
        confirmed: true,
        _category: category._id,
        text_markdown: 'Lorem ipsum dolor **sit amet**, consectetur adipisicing elit, sed do _eiusmod tempor incididunt_ ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
      });

      post.save(function(err, post) {
        complete();
      });
    });
  });

  jake.addListener('complete', function () {
    process.exit();
  });
});

var mongoose = require('mongoose');

task('fixlucas', {async: true}, function() {
  db.connect(function() {
    var post = Post.new({
      _user: new mongoose.Types.ObjectId("52e6fb968c9f10020054430e"),
      _category: new mongoose.Types.ObjectId("52db48f6090f9c0200dada90"),
      confirmed: true,
      title: "Fall Out Boy & Paramore @ Susquehanna Bank Center *PIT* - $122",
      text: "These tickets are being sold by the North American Ticket Organization (natotickets.com). To view these tickets please visit our website (http://natotickets.com/product/fall-out-boy-and-paramore-the-susquehanna-bank-center-62714/)\r\n\r\nOur tickets are being sold cheaper than tickets on any other website and the show is sold out, you will not find a better deal anywhere else! \r\n\r\nThe tickets are in the PIT section of the venue, directly in front of the stage.\r\n\r\nAll payments are processed through PayPal and we are PayPal verified.\r\n",
    });

    post.save(function(err, post) {
      complete();
    });
  });

  jake.addListener('complete', function () {
    process.exit();
  });
});

desc('Create category');
task('setup', {async: true}, function(name, slug) {
  db.connect(function() {
    var category = new Category({
      name: 'Misc.',
      slug: 'misc',
    });

    category.save(function(err, post) {
      category = new Category({
        name: 'Textbooks',
        slug: 'textbooks',
      });

      category.save(function(err, post) {
        category = new Category({
          name: 'Tickets',
          slug: 'tickets',
        });

        category.save(function(err, post) {
          complete();
        });
      });
    });
  });

  jake.addListener('complete', function () {
    process.exit();
  });
});

desc('Run the test suite');
task('test', function() {
  jake.exec(["./node_modules/.bin/mocha --reporter list"], { printStdout: true });
});