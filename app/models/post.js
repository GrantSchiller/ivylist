var db = require ("../../lib/db.js");

var Post = function(data) {
  if(data) {
    this.id = data.id;
    this.date = data.date;
    this.title = data.title;
    this.text_markdown = data.text_markdown;
    this.text_formatted = data.text_formatted;
    this.email = data.email;
    this.confirmation_code = data.confirmation_code;
    this.confirmed = data.confirmed;
  }
}

Post.getAllConfirmed = function(handler) {
  db.perform_query('SELECT * FROM posts WHERE confirmed = true ORDER BY date', function(data) {
    var posts = [];

    for (var n=0; n<data.rows.length; n++) {
      posts.push(new Post(data.rows[n]));
    };

    handler(posts);
  });
}

Idea.findById = function(id, handler) {
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


Idea.findByConfirmationCode = function(code, handler) {
  db.perform_query('SELECT * FROM posts WHERE (confirmed = false AND confirmation_code = $1) LIMIT 1', [code], function(data) {
    var post;

    if(data.rows.length == 0) {
      post = null;
    } else {
      post = new Post(data.rows[0]);
    }

    handler(post);
  });
};