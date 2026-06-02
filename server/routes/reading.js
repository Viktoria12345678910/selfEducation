const router = require('express').Router();
const Reading = require('../models/Reading');
const { authMiddleware } = require('./auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 6, type } = req.query;
    const filter = { authorId: req.user.id };
    if (type) filter.type = type;

    const total = await Reading.countDocuments(filter);
    const items = await Reading.find(filter)
      .sort({ addedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ data: items, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const item = await Reading.create({ ...req.body, authorId: req.user.id });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Reading.findOneAndUpdate(
      { _id: req.params.id, authorId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Reading.findOneAndDelete({ _id: req.params.id, authorId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
