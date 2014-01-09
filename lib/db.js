var mongoose = require('mongoose');

function connect(callback) {
  mongoose.connect(process.env.MONGOLAB_URI);

  var db = mongoose.connection;

  db.on('error', function() {
    console.log('connection error');
    process.exit(1);
  });

  db.once('open', function() {
    callback();
  });
}

exports.connect = connect;