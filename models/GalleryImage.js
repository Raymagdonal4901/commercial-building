const mongoose = require('mongoose');

const GalleryImageSchema = new mongoose.Schema({
    image: String, // Base64 data
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GalleryImage', GalleryImageSchema);
