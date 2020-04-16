const mongoose = require('mongoose'); // since we are using mongoose we have to require it

const userSchema = new mongoose.Schema({
  _id : mongoose.Schema.Types.ObjectId,
  username : String,
  firstName : String,
  lastName : String,
  email : String,
  password : String,
  watchlist : Array,
  balance : Number,
  location : String
});

module.exports = mongoose.model('User', userSchema);
