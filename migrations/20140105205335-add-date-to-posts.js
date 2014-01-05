var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.addColumn('posts', 'date', {
    type: 'timestamptz'
  }, callback);
};

exports.down = function(db, callback) {
  db.removeColumn('posts', 'date', callback);
};

