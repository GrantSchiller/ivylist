var helper = require("./helper");

function route(handle, pathname, request, response, postData, params, isAjax) {
  var r = handle[pathname];
  params.isAjax = isAjax;

  if ((typeof r) === 'object') {
    if(r.secure) {
      console.log("  [post data hidden]");
    } else if(postData) {
      console.log(postData);
    }

    var method = request.method;

    if(r.accept.indexOf(method) != -1) {
      if(!r.ajaxOnly || (r.ajaxOnly && isAjax)) {
        if (r.adminOnly) {
          helper.isSignedIn(request, function(signedIn) {
            if (signedIn) {
              r.action(response, request, params, postData);
            } else {
              helper.redirectTo("/login", request, response);
            }
          });
        } else {
          r.action(response, request, params, postData);
        }
      } else {
        helper.renderError(403, response);
      }
    } else {
      helper.renderError(405, response);
    }
  } else {
    helper.renderError(404, response);
  }
}

exports.route = route;