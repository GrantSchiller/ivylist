var db = require("./lib/db.js");

process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres@localhost/ivylist_development";

namespace('db', function() {
  desc('Migrate the database');
  task('migrate', function(env) {
    env = env || "dev"
    jake.exec(["./node_modules/.bin/db-migrate up --config config/database.json --env "+env], { printStdout: true});
  });

  desc('Migrate the database down');
  task('down', function(env) {
    env = env || "dev"
    jake.exec(["./node_modules/.bin/db-migrate dowb --config config/database.json --env "+env], { printStdout: true});
  });

  desc('Reset the database');
  task('reset', {async: true}, function() {
    db.reset(function() {
      console.log("Database cleared");
      complete();
    });

    jake.addListener('complete', function () {
      process.exit();
    });
  });
});

namespace('admin', function() {
  desc('Create a new admin');
  task('create', {async: true}, function(username, password) {
    var admin = new Admin();
    admin.username = username;
    admin.password = password;

    admin.save(function() {
      console.log("created user: " + username);
      complete();
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