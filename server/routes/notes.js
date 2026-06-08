const router = require('express').Router();
const Note = require('../models/Notes');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({
      authorId: req.user.id
    }).sort({ createdAt: -1 });

    res.json(notes);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});
// GET нотатки до курсу
router.get('/:courseId', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({
      courseId: req.params.courseId,
      authorId: req.user.id
    }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// POST нова нотатка
router.post('/', authMiddleware, async (req, res) => {
  try {
    const note = await Note.create({ ...req.body, authorId: req.user.id });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE нотатка
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, authorId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
