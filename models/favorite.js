const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//Conditionally set the collection name
const collectionName = process.env.NODE_ENV === 'development' ? 'favorite-verses-dev' : 'favorite-verses';

const favoriteSchema = new Schema({
    ip_address: String,
    page_number: Number,
    verse_number: Number,
    verse_in_english: String,
    pronunciation_in_english: String,
});

const FavoriteModel = mongoose.model(collectionName, favoriteSchema);

module.exports = FavoriteModel;