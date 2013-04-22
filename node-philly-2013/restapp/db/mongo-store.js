/**
 * A module to connect to a MongoDB store
 */
module.exports = function(options) {
  options = options || {};
  var mongoose = options.mongoose || require('mongoose')
  , config = require('./config');

  module.exports.mongoose = mongoose;
  mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
  mongoose.connection.once('open', function() {
    console.log('MongoDB connection opened');
  });

  var generate_mongo_url = function(obj) {
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'restapp_development');
    if (obj.username && obj.password) {
      return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    } else {
      return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
  }

  // bootstrap mongoose connection
  var mongo = config.mongodb.development;
  var mongourl = generate_mongo_url(mongo);

  if (mongoose.connection.readyState == 0) {
    module.exports.db = mongoose.connect(mongourl);
  }
}
