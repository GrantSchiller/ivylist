var db = require("./lib/db.js"),
    Post = require("./app/models/post");

process.env.DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/ivylist_development";

desc('Create seed posts');
task('seed', {async: true}, function(username, password) {
  db.connect(function() {

  });

  var post = new Post({
    title: 'This is a fresh new test post',
    email: 'mluzuriaga@friendscentral.org',
    confirmed: true,
    text_markdown: 'Lorem ipsum dolor **sit amet**, consectetur adipisicing elit, sed do _eiusmod tempor incididunt_ ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  });

  post.save(function(err, post) {
    complete();
  });

  jake.addListener('complete', function () {
    process.exit();
  });
});

desc('Run the test suite');
task('test', function() {
  jake.exec(["./node_modules/.bin/mocha --reporter list"], { printStdout: true });
});