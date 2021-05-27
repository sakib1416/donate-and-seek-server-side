const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const fileUpload = require('express-fileupload');


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//file upload images for admins
app.use(express.static('donations'));
app.use(fileUpload());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yfcjm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const donorCollection = client.db(`${process.env.DB_NAME}`).collection("donor");
  const donationsCollection = client.db(`${process.env.DB_NAME}`).collection("donations");
  
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
    const img = file.name;
    const donation = {name, description, location, categories, delivery, img};
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



  console.log("Database connected!");
});

app.get("/", (req,res) => {
    res.send("Hello from the server side");
});


app.listen(process.env.PORT || 5000, ()=>{
    console.log("Server has started");
});