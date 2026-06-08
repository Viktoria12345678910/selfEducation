const router = require('express').Router();
const Course = require('../models/Course');
const User = require('../models/User');
const  authMiddleware  = require('../middleware/authMiddleware');

// GET всі курси з пагінацією
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 6 } = req.query;
    const total = await Course.countDocuments();
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const courses = await Course.find()
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    res.json({ data: courses, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET один курс
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
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

router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const alreadyCompleted = user.completedCourses.some( id => id.toString() === req.params.id);

    if (alreadyCompleted) {
      user.completedCourses = user.completedCourses.filter(
        id => id.toString() !== req.params.id
      );
    } else {
      user.completedCourses.push(req.params.id);
    }

    await user.save();

    res.json({
      completed: !alreadyCompleted
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/progress', authMiddleware, async (req, res) => {
  try {
    const { completedModules } = req.body;

    const user = await User.findById(req.user.id);

    const course = await Course.findById(req.params.id);
    const isFinished = completedModules === course.modules;
    const alreadyCompleted = user.completedCourses.some( id => id.toString() === req.params.id);

   if(isFinished) {
	const alreadyCompeted = user.completedCourses.some(
		id => id.toString() === req.params.id
	);
    }
    if(!alreadyCompleted){
	user.completeddCourses.filter(
		id => id.toString() != reg.params.id
	);
}

    if(!course){
    	return res.status(404).json({
		message: 'Course not found'
	});
    }

    if (completedModules > course.modules){
    	return res.status(400).json({
		message: 'exceeded amount of modules'})}
    const existing = user.courseProgress.find(
      p => p.course.toString() === req.params.id
    );

    if (existing) {
      existing.completedModules = completedModules;
    } else {
      user.courseProgress.push({
        course: req.params.id,
        completedModules
      });
    }

    await user.save();

    res.json({
      success: true
    });

  } catch (err) {
    res.status(500).json({
      message: 'Server error'
    });
  }
});

module.exports = router;
