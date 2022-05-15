require('dotenv').config()
const axios = require("axios");
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const Favorite = require('./models/favorite');
const quranApiRootUrl = `https://api.quran.com/api/v4`;

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use("/favorites", express.static("favorites"));

// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Pass to next layer of middleware
    next();
});

//GEt all the chapters from the quran
app.get("/api/get-chapters", async (req, res) => {
    //Get the language from the query string of the request.
    const { language } = req.query;
    //Get the response for getting chapters.
    const quranChapters = await axios.get(quranApiRootUrl + `/chapters?language=${language}`);
    //End the response by returning a status code of 200 and returning a quranChapters.
    res.status(200).json({quranChapters: quranChapters.data.chapters });
});

//Get all verses based on chapter 
app.get("/api/get-verses/:chapter_id", async (req, res) => {
    //Get the chapter id from the request param
    const { chapter_id } = req.params;
    //Get the response from getting verses 
    const quranVerses = await axios.get(quranApiRootUrl + `/verses/by_chapter/${chapter_id}?language=en&words=true&page=1&per_page=10`);
    res.status(200).json({quranVerses: quranVerses.data.verses});
});

//Get favorite verses via the mongodb database.
app.get("/api/get-favorite", async (req, res) => {
    //Get all the favorite verses.
    const favorites = await Favorite.find();
    res.status(200).json({ favorites })
});

//Add verses to favorites to your nosql database, instatiate a new instance of the Favorite model.
app.post('/api/add-favorite', async (req, res) => {
    //Get the ip address to record who favorited and the verse itself. 
    const { ip_address, verse } = req.body;
    console.log('TRYING TO STORE FAVORITE');
  
    if (!ip_address || ip_address.trim().length === 0) {
      console.log('INVALID INPUT - NO TEXT');
      return res.status(422).json({ message: 'Invalid favorite text.' });
    }
  
    const favorite = new Favorite({
      ip_address,
      page_number: verse["page_number"],
      verse_number: verse["verse_number"],
      verse_in_english: verse["verse_in_english"],
      pronunciation_in_english: verse["pronunciation_in_english"],
    });
  
    try {
      await favorite.save();
      res
        .status(201)
        .json({ message: 'Favorite Verse saved', verse: { id: verse.id, verseInfo: JSON.stringify(verse)  } });
      console.log('STORED NEW FAVORITE VERSE');
    } catch (err) {
      console.error('ERROR FETCHING FAVORITES');
      console.error(err.message);
      res.status(500).json({ message: 'Failed to save favorite.' });
    }
});

//Delete your favorite verse by passing in verse_Id or the mongodb id.
app.delete("/api/delete-favorite/:verse_id", async (req, res) => {
    const { verse_id } = req.params;
    console.log('TRYING TO DELETE FAVORITES');
    try {
      await Favorite.deleteOne({ _id: verse_id });
      res.status(200).json({ message: 'Deleted Favorite!' });
      console.log('DELETED FAVORITE');
    } catch (err) {
      console.error('ERROR FETCHING FAVORITES');
      console.error(err.message);
      res.status(500).json({ message: 'Failed to delete favorite.' });
    }
});

//COnnect to the mongodb nosql database.
mongoose.connect(
    `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@host.docker.internal:27017/favorite-verses?authSource=admin`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (err) => {
      if (err) {
        console.error('Failed to connect to nosql database.');
        console.error(err);
      } else {
        console.log("Connected to nosql database.");
        app.listen(process.env.PORT);
      }
    }
);
