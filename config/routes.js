var posts_controller = require("../app/controllers/posts_controller");

// TODO: Get rid of adminOnly option in router.js

module.exports = {
  "/": {
    action: posts_controller.index,
    accept: ["GET"]
  }
}