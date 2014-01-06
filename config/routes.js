var posts_controller = require("../app/controllers/posts_controller");

// TODO: Get rid of adminOnly option in router.js

module.exports = {
  '': {
    action: posts_controller.index,
    accept: ["GET"]
  },
  'posts': {
    action: posts_controller.index,
    accept: ["GET"],

    'new': {
      // action: posts_controller.new,
      accept: ["GET"]
    },
    ':id': {
      // action: posts_controller.show,
      accept: ["GET"],
    }
  }
}