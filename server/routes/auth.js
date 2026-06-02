const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware для перевірки токену (використовується в інших роутах)
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Немає токену' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Невалідний токен' });
  }
};

// РЕЄСТРАЦІЯ
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: 'Email або username вже зайнятий' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, displayName });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username, email, displayName } });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ЛОГІН
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Користувача не знайдено' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Невірний пароль' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email, displayName: user.displayName } });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ПРОФІЛЬ (поточний користувач)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Додай після роуту /me

// PUT редагування профілю
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { displayName, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { displayName, bio },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE видалення акаунту
router.delete('/profile', authMiddleware, async (req, res) => {
  try {
    const Note = require('../models/Note');
    const Reading = require('../models/Reading');
    await Note.deleteMany({ authorId: req.user.id });
    await Reading.deleteMany({ authorId: req.user.id });
    await User.findByIdAndDelete(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
module.exports.authMiddleware = authMiddleware;
