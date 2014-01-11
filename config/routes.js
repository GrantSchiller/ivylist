var posts_controller = require('../app/controllers/posts_controller'),
    users_controller = require('../app/controllers/users_controller'),
    sessions_controller = require('../app/controllers/sessions_controller');

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

  'users': {
    'create': {
      action: users_controller.create,
      accept: ["POST"],
      secure: true
    }
  },

  'login': {
    action: sessions_controller.login,
    accept: ["GET"]
  },
  
  'sessions': {
    'create': {
      action: sessions_controller.createSession,
      accept: ["POST"],
      secure: true
    }
  },

  'logout': {
    action: sessions_controller.logout,
    accept: ["GET"],
    loggedInOnly: true
  },

  'confirm': {
    ':confirmation_code': {
      action: posts_controller.confirm,
      accept: ["GET"]
    }
  }
}