var helper = require("./helper");

function route(handle, pathname, request, response, postData, params, isAjax, sockets) {
  var routeFound;

  var parts = pathname.split("/");
  parts.shift();
  if (parts.length > 1 && parts[parts.length-1] == '') {
    parts.pop();
  }

  for (var i=0; i<parts.length; i++) {
    routeFound = false;

    var newHandle = handle[parts[i]];

    if ((typeof newHandle) === 'object') {
      handle = newHandle;
      routeFound = true;
    } else {
      var keys = Object.keys(handle);
      for (var ii=0; ii<keys.length; ii++) {
        var bits = keys[ii].split(":");
        if (bits.length == 2) {
          params[bits[1]] = parts[i];
          handle = handle[keys[ii]];
          routeFound = true;
          break;
        }
      }
    }

    if (!routeFound) {
      break;
    }
  }

  if (Object.getOwnPropertyNames(params).length != 0) {
    process.stdout.write("  Options: ");
    console.log(params);
  }

  params.isAjax = isAjax;

  if (routeFound) {
    if (handle.secure) {
      console.log("  [post data hidden]");
    } else if(postData) {
      process.stdout.write("  Data: ");
      console.log(postData);
    }

    var method = request.method;

    if (handle.accept.indexOf(method) != -1) {
      if (!handle.ajaxOnly || (handle.ajaxOnly && isAjax)) {
        helper.currentUser(request, function(user) {
          request.user = user;
          if (user) console.log("  User: " + user.email);
          if (handle.loggedInOnly && !user) {
            helper.redirectTo("/login", request, response);
          } else {
            handle.action(response, request, params, postData, sockets);
          }
        });
      } else {
        helper.renderError(403, request, response);
      }
    } else {
      helper.renderError(405, request, response);
    }
  } else {
    helper.renderError(404, request, response);
  }
}

exports.route = route;