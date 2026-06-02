const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  title:    { type: String, required: true },
  text:     { type: String, required: true },
  tags:     { type: [String], default: [] }, // для Zettelkasten
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);
