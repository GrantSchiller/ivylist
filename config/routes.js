var posts_controller = require("../app/controllers/posts_controller");

module.exports = {
  '': {
    action: posts_controller.index,
    accept: ["GET"]
  },

  'new': {
    action: posts_controller.add,
    accept: ["GET"]
  },
  'posts': {
    action: posts_controller.index,
    accept: ["GET"],

    'create': {
      action: posts_controller.create,
      accept: ["POST"]
    },
    ':id': {
      action: posts_controller.show,
      accept: ["GET"],

      'contact': {
        action: posts_controller.contact,
        accept: ["GET"]
      },
      'send_email': {
        action: posts_controller.sendEmail,
        accept: ["POST"]
      }
    }
  },

  'confirm': {
    ':confirmation_code': {
      action: posts_controller.confirm,
      accept: ["GET"]
    }
  }
}