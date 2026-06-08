const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, maxlength: 50 },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, maxlength: 100 },
  ava:      { type: String, default: '' },
  bio:      { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  regDate:  { type: Date, default: Date.now },
  completedCourses: {
		type: mongoose.Schema.Types.ObjectId,
  		ref: 'Course'
  },
  courseProgress: [
	  {
		  course: {
			  type: mongoose.Schema.Types.ObjectId,
		  	  ref: 'Course'
		  },
		  completedModules: {
		  	type: Number,
		  	default: 0
		  }
  	}
  ]
});

module.exports = mongoose.model('User', userSchema);
