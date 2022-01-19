require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const {Schema} = mongoose;
const app = express();
const urlparser = require('url');
const dns = require('dns');

const urlSchema = new Schema({
  url: 'string'
});

const Url = mongoose.model('Url', urlSchema);
app.use(bodyParser.urlencoded({extended: false}));
//connect mongoose
mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true });

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const bodyurl =req.body.url;

  const doSomething = dns.lookup(urlparser.parse(bodyurl).hostname,(err,address)=>{
    if(!address){
        res.json({error: "Invalid-URL"})
    }

    const url = new Url({url :bodyurl});
    url.save((err,data)=>{
      if(err) return console.log(err);

      res.json({
        original_url  : data.url,
        short_url: data.id
      });
    });
  });

});

app.get("/api/shorturl/:id", (req,res)=>{
  const id = req.params.id;
  Url.findById(id, (err,data)=>{
    if(err) res.json({error: "Invalid URL"});

res.redirect(data.url);
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
