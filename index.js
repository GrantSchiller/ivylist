var server = require ("./lib/server"),
    router = require("./lib/router"),
    routes = require("./config/routes");

server.start(router.route, routes, __dirname + '/public');