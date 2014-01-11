var connect = require("connect"),
    url = require("url"),
    qs = require("querystring");

function start(route, handle, pub_url) {
  var app = connect();
  app.use(connect.static(pub_url));
  app.use(connect.cookieParser());
  app.use(connect.cookieSession({ secret: 'blah-blah-this-is-my-secret', cookie: { maxAge: 60*60*60*1000 } }));
  app.use(function(request, response) {
    request.startTime = new Date();
    var pathname = url.parse(request.url).pathname;
    var isAjax = request.headers['x-requested-with'] == 'XMLHttpRequest';
    var postData = "";

    console.log(request.method + ": '" + pathname + "' on " + new Date());
    console.log("  From: " + request.connection.remoteAddress);

    request.setEncoding('utf8');

    request.addListener("data", function(chunk) {
      postData += chunk;
    });

    request.addListener("end", function(chunk) {
      if (postData) {
        postData = qs.parse(postData);
      };
      var params = qs.parse(url.parse(request.url).query);
      route(handle, pathname, request, response, postData, params, isAjax);
    });
  });

  var port = process.env.PORT || 8000;
  console.log("Starting application on port " + port + "\n");
  app.listen(port);
}

exports.start = start;
