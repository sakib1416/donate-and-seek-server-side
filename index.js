const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const fileUpload = require('express-fileupload');


app.use(cors());
app.use(bodyParser.urlencoded({limit: '50mb', extended: false }));
app.use(bodyParser.json({limit: '50mb'}));

//file upload images for admins
app.use(express.static('donations'));
app.use(fileUpload());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yfcjm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const donorCollection = client.db(`${process.env.DB_NAME}`).collection("donor");
  const donationsCollection = client.db(`${process.env.DB_NAME}`).collection("donations");
  const usersCollection = client.db(`${process.env.DB_NAME}`).collection("users");
  const seekingCollection = client.db(`${process.env.DB_NAME}`).collection("seeks");
  //showing all the donations
  app.get("/donations", (req,res) => {
    donationsCollection.find()
    .toArray((err, documents) => {
      res.send(documents);
    })
  });

  //showing a single donation
  app.get("/donation/:id", (req,res) => {
    const id = ObjectID(req.params.id);
    donationsCollection.findOne({_id: id})
    .then(result => res.send(result));
  });
  
  //adding a donation
  app.post("/addDonation", (req,res) => {
    const file = req.files.file;
    const name = req.body.name;
    const description = req.body.description;
    const location = req.body.location;
    const categories = req.body.categories;
    const delivery = req.body.delivery; 
    const donorName = req.body.donorName; 
    const donorEmail = req.body.donorEmail; 
    const img = file.name;
    
    const donation = {name, description, location, categories, delivery, img, donorName, donorEmail};
    console.log(donation)
    file.mv(`${__dirname}/donations/${img}`, (err) =>{
      if(err) {
        console.log(err);
        return res.status(500).send({msg: "failed to upload the image"})
      }
      return res.send({name: img, path: `/${img}`})
    })
    donationsCollection.insertOne(donation)
    .then(result => {
      console.log(result);
      res.send(result.insertedCount > 0)
    })
  });

  app.post("/addUser", (req,res) => {
    const user = {name: req.body.name, email: req.body.email};
    usersCollection.insertOne(user)
    .then(result => {
      console.log(result);
      res.send(result.insertedCount > 0);
    })
  });

  //updating a donation
  app.patch("/update/donation/:id", (req,res) => {
    console.log(req.body);
    const id = ObjectID(req.params.id);
    //be careful with the $set
    donationsCollection.updateOne({_id: id}, {
        $set: {name: req.body.name, description: req.body.description, location: req.body.location, categories: req.body.categories, delivery: req.body.delivery}
    })
    .then(result => res.send(result))
  });

  app.delete("/delete/donation/:id", (req,res) => {
    const id = ObjectID(req.params.id);
    donationsCollection.deleteOne({_id: id})
    .then(documents => res.send(!!documents.value))
  })

  //adding a seeking post
  app.post("/addSeek", (req,res) => {
    const file = req.files.file;
    const name = req.body.name;
    const description = req.body.description;
    const location = req.body.location;
    const categories = req.body.categories;
    const delivery = req.body.delivery; 
    const seekerName = req.body.seekerName; 
    const seekerEmail = req.body.seekerEmail; 
    const img = file.name;
    
    const seek = {name, description, location, categories, delivery, img, seekerName, seekerEmail};
    console.log(seek);
    file.mv(`${__dirname}/seeks/${img}`, (err) =>{
      if(err) {
        console.log(err);
        return res.status(500).send({msg: "failed to upload the image"})
      }
      return res.send({name: img, path: `/${img}`})
    })
    seekingCollection.insertOne(seek)
    .then(result => {
      console.log(result);
      res.send(result.insertedCount > 0)
    })
  });

  //showing all the seeking post
  app.get("/seekings", (req,res) => {
    seekingCollection.find()
    .toArray((err, documents) => {
      res.send(documents);
    })
  });

  //showing a single seeking post
  app.get("/seeking/:id", (req,res) => {
    const id = ObjectID(req.params.id);
    seekingCollection.findOne({_id: id})
    .then(result => res.send(result));
  });

  console.log("Database connected!");
});

app.get("/", (req,res) => {
    res.send("Hello from the server side");
});


app.listen(process.env.PORT || 5000, ()=>{
    console.log("Server has started");
});