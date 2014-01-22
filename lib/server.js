var express = require('express'),
    http = require('http'),
    path = require('path'),
    io = require('socket.io'),
    url = require('url'),
    qs = require('querystring'),
    helper = require('./helper');

var sockets = {'' : []};

function start(route, routes, rootUrl) {
  var app = express();

  var server = http.createServer(app);
  io = io.listen(server, { log: false });
  io.sockets.on('connection', function(socket) {
    socket.on('listening', function(data) {
      if (!sockets[data.category]) {
        sockets[data.category] = [];
      }

      sockets[data.category].push(socket);
    });

    socket.on('disconnect', function() {
      for (var category in sockets) {
        var array = sockets[category];
        var index = array.indexOf(socket);

        if (index != -1) {
          array.splice(array.indexOf(socket), 1);
        }
      }
    });
  });
  
  app.set('port', process.env.PORT || 8000);
  app.use(express.static(path.join(rootUrl, 'public')));

  app.use(function(request, response, next) {
    request.startTime = new Date();
    var isAjax = request.headers['x-requested-with'] == 'XMLHttpRequest';

    console.log(request.method + ": '" + request.path + "' on " + new Date());
    console.log("  From: " + request.connection.remoteAddress);

    next();
  });

  app.set('view engine', 'ejs');
  app.set('views', path.join(rootUrl, 'app', 'views'));
  app.use(express.cookieParser('blah-blah-this-is-my-secret'));
  app.use(express.session());

  app.use(express.bodyParser());

  app.use(function(request, response, next) {
    helper.currentUser(request, function(user) {
      request.user = user;
      response.locals.currentUser = user;
      next();
    });
  });

  app.use(function(request, response, next) {
    var _render = response.render;
    response.render = function(view, options, callback) {
      if (options.js) {
        response.header('Content-Type', 'application/javascript')
      }

      options.jsURL = options.customJS ? view : undefined;
      _render.call(response, view, options, callback);

      console.log("  Rendered 'views/" + view + ".ejs' (" + response.statusCode + ")");
      console.log("  Completed in " + (new Date() - request.startTime) + "ms\n");
    };

    var _redirect = response.redirect;
    response.redirect = function(url) {
      _redirect.call(response, url);

      console.log("  Redirecting to '" + url + "' (" + response.statusCode + ")");
      console.log("  Completed in " + (new Date() - request.startTime) + "ms\n");
    };

    next();
  });

  app.use(app.router);
  routes(app);

  var port = process.env.PORT || 8000;
  console.log("Starting application on port " + port + "\n");
  server.listen(port);
}

exports.start = start;
