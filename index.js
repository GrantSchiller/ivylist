var server = require ("./lib/server"),
    db = require("./lib/db"),
    router = require("./lib/router"),
    routes = require("./config/routes");

db.connect(function() {
  server.start(router.route, routes, __dirname + '/public');
});