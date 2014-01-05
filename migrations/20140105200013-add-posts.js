var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('posts', {
    id: {
      type: 'serial',
      primaryKey: true
    },
    title: 'string',
    text_md: 'string'
    text_formatted: 'string'
    email: 'string'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('posts', callback);
};

