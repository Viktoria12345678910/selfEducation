require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Підключення до MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB підключено ✅'))
  .catch(err => console.error('Помилка підключення:', err));

// Роути
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/reading', require('./routes/reading'));

app.listen(process.env.PORT || 5000, () => 
  console.log(`Сервер запущено на порті ${process.env.PORT}`)
);
