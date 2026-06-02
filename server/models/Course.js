const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseName:  { type: String, required: true },
  siteUrl:     { type: String, default: '' },
  completed:   { type: Boolean, default: false },
  certificate: { type: Boolean, default: false },
  modules:     { type: Number, default: 0 },
  modulesdone: { type: Number, default: 0 },
  price:       { type: Number, default: 0 },
});

module.exports = mongoose.model('Course', courseSchema);
