const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const config = require('./config.json');
const User = require('./models/users.js')
const Product = require('./models/products.js');
const Comment = require('./models/comments.js');

const port = 3000;

//connect to db
const mongodbURI = `mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASS}@${config.MONGO_CLUSTER}.mongodb.net/${config.MONGO_DB_NAME}?retryWrites=true&w=majority`;
mongoose.connect(mongodbURI, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log("Database connected"))
.catch((err) => console.log(`Database connection error: ${err.message}`));

// check connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error:'));
db.once('open', function(){console.log("We are connected to MongoDB")});

app.use((req,res,next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
});

//including body-parser, cors
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(cors());

app.get('/', (req, res) => res.send('Hello World!'))

// product functions STARTS
//get all products
app.get('/products', (req,res)=>{
  Product.find().then(result =>{
    res.send(result);
  })
}); // get all products

//get Products by ID
app.get('/products/p=:id', (req,res)=>{
  const idParam = req.params.id;
  Product.findOne({_id:idParam}, (err, result)=>{
    if(result){
      res.send(result)
    }
    else{
      res.send("Can't find Product with this ID")
    }
  }).catch(err => res.send(err));
}); // get Products by ID

//Add Products.
app.post('/addProduct/', (req,res)=>{
  const dbProduct = new Product({
   _id : new mongoose.Types.ObjectId,
   title : req.body.title,
   description : req.body.description,
   price : req.body.price,
   image : req.body.image,
   status : req.body.status,
   keywords : req.body.keywords,
   sellerId : req.body.sellerId,
   buyerId : req.body.buyerId,
   category : req.body.category,
   shipping : req.body.shipping
 });
  //save to database and notify the user accordingly
  dbProduct.save().then(result =>{
    res.send(result);
  }).catch(err => res.send(err));
}); // add Products

// delete a product
app.delete('/deleteProduct/p=:id', (req,res)=>{
  const idParam = req.params.id;
  Product.findOne({_id:idParam}, (err, result)=>{
    if(result){
      Product.deleteOne({_id:idParam}, err =>{
        res.send("Product deleted")
      });
    }
    else{
      res.send("Can't delete Product. ID Not found")
    }
  }).catch(err => res.send(err));
}); // delete Product

// update Product
app.patch('/updateProduct/p=:id', (req,res)=>{
  const idParam = req.params.id;
  Product.findById(idParam, (err,result)=>{
    const updatedProduct = {
      title : req.body.title,
      description : req.body.description,
      price : req.body.price,
      image : req.body.image,
      keywords : req.body.keywords,
      category : req.body.category,
      shipping : req.body.shipping
    };
    Product.updateOne({_id:idParam}, updatedProduct).then(result=>{
      res.send(result);
    }).catch(err=> res.send(err));
  }).catch(err=>res.send("Not found"))
}) // update Product

// sold item combo
// update status
app.patch('/productSold/p=:id', (req,res)=>{
  const idParam = req.params.id;
  Product.findById(idParam, (err,result)=>{
    const updatedStatus = {
      status : req.body.status,
      buyerId : req.body.buyerId
    };
    Product.updateOne({_id:idParam}, updatedStatus).then(result=>{
      res.send(result);
    }).catch(err=> res.send(err));
  }).catch(err=>res.send("Not found"))
}) // update status

// update balance of seller and buyer
app.patch('/updateBalance/u=:id', (req,res)=>{
  const idParam = req.params.id;
  User.findById(idParam, (err,result)=>{
    const updatedBalance = {
      balance : req.body.balance
    };
    User.updateOne({_id:idParam}, updatedBalance).then(result=>{
      res.send(result);
    }).catch(err=> res.send(err));
  }).catch(err=>res.send("Not found"))
}); // update balance
// sold item combo
// product functions END

// comments functions STARTS
//get all comments
app.get('/comments', (req,res)=>{
  Comment.find().then(result =>{
    res.send(result);
  })
}); // get all comments

//get comments of a product
app.get('/comments/p=:id', (req,res)=>{
  const idParam = req.params.id; // id is product id
  Comment.find({productId:idParam}, (err, result)=>{
    if(result){
      res.send(result)
    }
    else{
      res.send("Can't find Product with this ID")
    }
  }).catch(err => res.send(err));
}); // get Products by ID

//Add comment
app.post('/addComment/', (req,res)=>{
  const dbComment = new Comment({
   _id : new mongoose.Types.ObjectId,
   text : req.body.text,
   time : req.body.time,
   userId : req.body.userId,
   productId : req.body.productId,
   replies : req.body.replies
 });
  //save to database and notify the user accordingly
  dbComment.save().then(result =>{
    res.send(result);
  }).catch(err => res.send(err));
}); // add comment

// update comment
app.patch('/editComment/c=:id', (req,res)=>{
  const idParam = req.params.id;
  Comment.findById(idParam, (err,result)=>{
    const updatedComment = {
      text : req.body.text
    };
    Comment.updateOne({_id:idParam}, updatedComment).then(result=>{
      res.send(result);
    }).catch(err=> res.send(err));
  }).catch(err=>res.send("Not found"))
}) // update comment

// reply to comment. Must create a new object of a comment with all data except replies
app.patch('/editComment/c=:id', (req,res)=>{
  const idParam = req.params.id;
  Comment.findById(idParam, (err,result)=>{
    const updatedComment = {
      replies : req.body.replies
    };
    Comment.updateOne({_id:idParam}, updatedComment).then(result=>{
      res.send(result);
    }).catch(err=> res.send(err));
  }).catch(err=>res.send("Not found"))
}) // reply to comment

// delete a comment
app.delete('/deleteComment/c=:id', (req,res)=>{
  const idParam = req.params.id;
  Comment.findOne({_id:idParam}, (err, result)=>{
    if(result){
      Comment.deleteOne({_id:idParam}, err =>{
        res.send("Comment deleted")
      });
    }
    else{
      res.send("Can't delete Comment. ID Not found")
    }
  }).catch(err => res.send(err));
}); // delete comment
// comment functions ENDS

// user functions STARTS
//show users
app.get('/users',(req,res)=>{
  User.find().then(result =>{
    res.send(result)
  })
}) // show users

//show this user
app.get('/users/u=:id', (req,res)=>{
  const idParam = req.params.id; // id is product id
  User.findOne({_id:idParam}, (err, result)=>{
    if(result){
      res.send(result)
    }
    else{
      res.send("Can't find user with this ID")
    }
  }).catch(err => res.send(err));
}); // show this user

//register user
app.post('/register', (req,res)=>{
  User.findOne({username:req.body.username},(err,result) =>{
    if(result){
      res.send("This username is already taken. Please try another one")
    }
    else{
      const hash = bcryptjs.hashSync(req.body.password);
      const user = new User({
        _id : new mongoose.Types.ObjectId,
        username : req.body.username,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email,
        password : hash,
        watchlist : req.body.watchlist,
        balance : req.body.balance,
        location : req.body.location
      });
      user.save().then(result =>{
        res.send(result);
      }).catch(err => res.send(err));
    }
  });
}); // register user

//login user
app.post('/login', (req,res)=>{
  User.findOne({username:req.body.username}, (err, result)=>{
    if(result){
      if(bcryptjs.compareSync(req.body.password, result.password)){
        res.send(result)
      }
      else{
        res.send("Not authorised. Incorrect password")
      }
    }
    else{
      res.send("User not found")
    }
  })
}); // login user

// update user
app.patch('/updateUser/u=:id', (req,res)=>{
  const idParam = req.params.id;
  User.findById(idParam, (err,result)=>{
    const updatedUser = {
      firstName : req.body.firstName,
      lastName : req.body.lastName,
      email : req.body.email,
      location : req.body.location
    };
    User.updateOne({_id:idParam}, updatedUser).then(result=>{
      res.send(result);
    }).catch(err=> res.send(err));
  }).catch(err=>res.send("Not found"))
}); // update user

// update password
app.patch('/updatePassword/u=:id', (req,res)=>{
  const idParam = req.params.id;
  User.findById(idParam, (err,result)=>{
    const hash = bcryptjs.hashSync(req.body.password);
    const updatedUser = {
      password : hash
    };
    User.updateOne({_id:idParam}, updatedUser).then(result=>{
      res.send(result);
    }).catch(err=> res.send(err));
  }).catch(err=>res.send("Not found"))
}); // update password

// update watchlist
app.patch('/updateWatchlist/u=:id', (req,res)=>{
  const idParam = req.params.id;
  User.findById(idParam, (err,result)=>{
    const updatedWatchlist = {
      watchlist : req.body.watchlist
    };
    User.updateOne({_id:idParam}, updatedWatchlist).then(result=>{
      res.send(result);
    }).catch(err=> res.send(err));
  }).catch(err=>res.send("Not found"))
}); // update user

// delete a user
app.delete('/deleteUser/u=:id', (req,res)=>{
  const idParam = req.params.id;
  User.findOne({_id:idParam}, (err, result)=>{
    if(result){
      User.deleteOne({_id:idParam}, err =>{
        res.send("User deleted")
      });
    }
    else{
      res.send("Can't delete user. Not found")
    }
  }).catch(err => res.send(err));
}); // delete a user

// leave right at bottom
app.listen(port, () => console.log(`App listening on port ${port}!`))
