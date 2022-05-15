const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    ip_address: String,
    page_number: Number,
    verse_number: Number,
    verse_in_english: String,
    pronunciation_in_english: String,
});

const FavoriteModel = mongoose.model('Favorite', favoriteSchema);

module.exports = FavoriteModel;