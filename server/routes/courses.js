const router = require('express').Router();
const Course = require('../models/Course');
const { authMiddleware } = require('./auth');

// GET всі курси з пагінацією
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 6 } = req.query;
    const total = await Course.countDocuments();
    const courses = await Course.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ data: courses, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET один курс
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findOne(req.params.id);
    if (!course) return res.status(404).json({ message: 'Не знайдено' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST новий курс
router.post('/', authMiddleware, async (req, res) => {
  try {
    const course = await Course.create({ ...req.body, authorId: req.user.id });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT оновити курс
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, authorId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE видалити курс
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Course.findOneAndDelete({ _id: req.params.id, authorId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
