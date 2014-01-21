var express = require('express'),
    connect = require('connect'),
    http = require('http'),
    path = require('path'),
    io = require('socket.io'),
    url = require('url'),
    qs = require('querystring');

var sockets = {'' : []};

function start(route, routes, rootUrl) {
  var app = express();

  // var server = http.createServer(app);
  // io = io.listen(server, { log: false });
  // io.sockets.on('connection', function(socket) {
  //   socket.on('listening', function(data) {
  //     if (!sockets[data.category]) {
  //       sockets[data.category] = [];
  //     }

  //     sockets[data.category].push(socket);
  //   });

  //   socket.on('disconnect', function() {
  //     for (var category in sockets) {
  //       var array = sockets[category];
  //       var index = array.indexOf(socket);

  //       if (index != -1) {
  //         array.splice(array.indexOf(socket), 1);
  //       }
  //     }
  //   });
  // });
  
  app.set('port', process.env.PORT || 8000);
  app.set('views', path.join(rootUrl, 'app', 'views'));
  app.set('view engine', 'ejs');
  app.use(express.static(path.join(rootUrl, 'public')));
  app.use(express.cookieParser('blah-blah-this-is-my-secret'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.logger('dev'));

  app.use(express.errorHandler());

  routes(app);
  // app.use(function(request, response) {
  //   request.startTime = new Date();
  //   var pathname = url.parse(request.url).pathname;
  //   var isAjax = request.headers['x-requested-with'] == 'XMLHttpRequest';
  //   var postData = "";

  //   console.log(request.method + ": '" + pathname + "' on " + new Date());
  //   console.log("  From: " + request.connection.remoteAddress);

  //   request.setEncoding('utf8');

  //   request.addListener("data", function(chunk) {
  //     postData += chunk;
  //   });

  //   request.addListener("end", function(chunk) {
  //     if (postData) {
  //       postData = qs.parse(postData);
  //     };
  //     var params = qs.parse(url.parse(request.url).query);
  //     route(handle, pathname, request, response, postData, params, isAjax, sockets);
  //   });
  // });

  var port = process.env.PORT || 8000;
  console.log("Starting application on port " + port + "\n");
  app.listen(port);
}

exports.start = start;
