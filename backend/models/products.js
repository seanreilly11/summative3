const mongoose = require('mongoose'); // since we are using mongoose we have to require it

const productSchema = new mongoose.Schema({
  _id : mongoose.Schema.Types.ObjectId,
  title : String,
  description : String,
  price : Number,
  image : String,
  status : String,
  keywords : Array,
  sellerId :{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User'
  },
  buyerId :{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User'
  },
  category : String,
  shipping : {                  
      pickup : Boolean,
      deliver : Boolean
    } 
});

module.exports = mongoose.model('Product', productSchema);
