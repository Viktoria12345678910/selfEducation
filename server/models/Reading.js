const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, required: true },
  type:     { type: String, enum: ['book', 'article', 'paper', 'other'], default: 'article' },
  url:      { type: String, default: '' },
  finished: { type: Boolean, default: false },
  addedAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reading', readingSchema);
