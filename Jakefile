var db = require("./lib/db.js"),
    Post = require("./app/models/post"),
    Category = require("./app/models/category");

process.env.MONGOLAB_URI = process.env.MONGOLAB_URI || "mongodb://localhost/ivylist_development";

desc('Create seed posts');
task('seed', {async: true}, function(username, password) {
  db.connect(function() {
    var post = new Post({
      title: 'This is a fresh new test post',
      email: 'mluzuriaga@friendscentral.org',
      confirmed: true,
      category: 'misc',
      text_markdown: 'Lorem ipsum dolor **sit amet**, consectetur adipisicing elit, sed do _eiusmod tempor incididunt_ ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
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

desc('Convert existing posts to misc.');
task('convert', {async: true}, function() {
  Category.findOne({slug: 'misc'}).exec(function(err, cat) {
    Post.update({confirmed: true}, {_category: cat._id}, {multi: true}).exec(function(err) {
      complete();  
    });
  });

  jake.addListener('complete', function () {
    process.exit();
  });
});
});

desc('Run the test suite');
task('test', function() {
  jake.exec(["./node_modules/.bin/mocha --reporter list"], { printStdout: true });
});