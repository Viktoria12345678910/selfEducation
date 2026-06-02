require('dotenv').config();

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const Course = require('./models/Course');
const Notes = require('./models/Notes');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('Mongo connected');

    // очистити старі дані
    await Course.deleteMany({});
    await Notes.deleteMany({});

    console.log('Old data removed');

    // fake user id
    const authorId = new mongoose.Types.ObjectId();

    const courses = [];

    // створюємо курси
    for (let i = 0; i < 12; i++) {
      courses.push({
        courseName: faker.company.catchPhrase(),
        authorId
      });
    }

    const createdCourses = await Course.insertMany(courses);

    console.log('Courses created');

    const notes = [];

    // створюємо нотатки
    for (let i = 0; i < 30; i++) {
      const randomCourse =
        createdCourses[
          Math.floor(Math.random() * createdCourses.length)
        ];

      notes.push({
        title: faker.lorem.words(3),
        text: faker.lorem.paragraphs(2),
        courseId: randomCourse._id,
        authorId
      });
    }

    await Notes.insertMany(notes);

    console.log('Notes created');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
