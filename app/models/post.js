var db = require ("../../lib/db.js"),
    marked = require('marked'),
    crypto = require('crypto'),
    dateformat = require('dateformat');

var Post = function(data) {
  if (data) {
    this.id = data.id;
    this.date = data.date;
    this.title = data.title;
    this.text_markdown = data.text_markdown;
    this.text_formatted = data.text_formatted;
    this.email = data.email;
    this.confirmation_code = data.confirmation_code;
    this.confirmed = data.confirmed;
  }

  this.generate_confirmation_code = function() {
    var text = (new Date()) + "--" + this.email + "--" + this.title + "--" + this.text_markdown;

    var shasum = crypto.createHash('sha1');
    shasum.update(text);
    this.confirmation_code = shasum.digest('hex');
  }

  this.format_text = function(callback) {
    marked(this.text_markdown, function(err, result) {
      if (err) throw err;
      this.text_formatted = result;
      
      callback();
    }.bind(this));
  }

  this.save = function(handler) {
    this.format_text(function() {
      if (this.id) {
        // Update
      } else {
        this.generate_confirmation_code();

        db.insert('posts', {
          title: this.title,
          text_markdown: this.text_markdown,
          text_formatted: this.text_formatted,
          email: this.email,
          confirmation_code: this.confirmation_code,
          confirmed: false,
          date: new Date()
        }, 'RETURNING id, date', function(data) {
          this.id = data.id;
          this.date = data.date;
          this.confirmed = false;

          handler();
        }.bind(this));
      }
    }.bind(this));
  };

  this.confirm = function(handler) {
    this.confirmed = true;
    db.perform_query('UPDATE posts SET confirmed = true WHERE id = $1', [this.id], function(data) {
      handler();
    });
  };

  this.prettyDate = function() {
    return dateformat(this.date, "mmm d");
  };
}

Post.getAllConfirmed = function(offset, limit, handler) {
  db.perform_query('SELECT * FROM posts WHERE confirmed = true ORDER BY date DESC LIMIT ' + limit + ' OFFSET ' + offset, function(data) {
    var posts = [];

    for (var n=0; n<data.rows.length; n++) {
      posts.push(new Post(data.rows[n]));
    };

    handler(posts);
  });
}

Post.numPages = function(perPage, handler) {
  db.perform_query('SELECT COUNT(id) AS count FROM posts WHERE confirmed = true',  function(data) {
    var count = data.rows[0].count;
    handler(Math.ceil(count/perPage));
  });
}

Post.findById = function(id, handler) {
  db.perform_query('SELECT * FROM posts WHERE (confirmed = true AND id = $1) LIMIT 1', [id], function(data) {
    var post;

    if(data.rows.length == 0) {
      post = null;
    } else {
      post = new Post(data.rows[0]);
    }

    handler(post);
  });
};


Post.findByConfirmationCode = function(code, handler) {
  db.perform_query('SELECT * FROM posts WHERE confirmation_code = $1 LIMIT 1', [code], function(data) {
    var post;

    if(data.rows.length == 0) {
      post = null;
    } else {
      post = new Post(data.rows[0]);
    }

    handler(post);
  });
};

module.exports = Post;