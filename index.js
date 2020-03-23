const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcryptjs = require('bcryptjs');//to hash and compare password in an encrypted method
const config = require('./config.json');
const User = require('./models/users.js')
const Product = require('./models/products.js');

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

// beginning of Project

app.get('/', (req, res) => res.send('Hello World!'))

//get all products
app.get('/products', (req,res)=>{
  Product.find().then(result =>{
    res.send(result);
  })
}); // get all products 

// leave right at bottom
app.listen(port, () => console.log(`App listening on port ${port}!`))
