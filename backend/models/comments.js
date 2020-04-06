const mongoose = require('mongoose'); // since we are using mongoose we have to require it

const commentSchema = new mongoose.Schema({
  _id : mongoose.Schema.Types.ObjectId,
  text : String,
  time : Date,
  userId :{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User'
  },
  productId :{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Product'
  },
  replies : [ 
    {                  
      text : String,
      time : Date,
      userId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
      }
    } 
  ]
});

module.exports = mongoose.model('Comment', commentSchema);
