var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('posts', {
    id: {
      type: 'serial',
      primaryKey: true
    },
    title: 'varchar(256)',
    text_markdown: 'text',
    text_formatted: 'text',
    email: 'varchar(64)',
    confirmation_code: 'char(40)',
    confirmed: 'boolean'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('posts', callback);
};

