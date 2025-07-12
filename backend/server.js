// server.js - COPY THIS TO: backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection - Using MongoDB Atlas (Cloud)
mongoose.connect('mongodb+srv://stackit:stackit123@cluster0.mongodb.net/stackoverflow-clone?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  reputation: { type: Number, default: 0 },
  avatar: { type: String, default: 'https://via.placeholder.com/40' },
  createdAt: { type: Date, default: Date.now }
});

// Question Schema
const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  tags: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  votes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
  createdAt: { type: Date, default: Date.now }
});

// Answer Schema
const answerSchema = new mongoose.Schema({
  body: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  votes: { type: Number, default: 0 },
  isAccepted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Question = mongoose.model('Question', questionSchema);
const Answer = mongoose.model('Answer', answerSchema);

// Auth Middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Routes
// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, 'your-secret-key');
    res.status(201).json({ token, user: { id: user._id, username, email } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, 'your-secret-key');
    res.json({ token, user: { id: user._id, username: user.username, email } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get Questions
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('author', 'username avatar reputation')
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Question by ID
app.get('/api/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username avatar reputation')
      .populate({
        path: 'answers',
        populate: { path: 'author', select: 'username avatar reputation' }
      });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    // Increment views
    question.views += 1;
    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Question
app.post('/api/questions', auth, async (req, res) => {
  try {
    const { title, body, tags } = req.body;
    const question = new Question({
      title,
      body,
      tags: tags.split(',').map(tag => tag.trim()),
      author: req.user.userId
    });
    await question.save();
    await question.populate('author', 'username avatar reputation');
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create Answer
app.post('/api/questions/:id/answers', auth, async (req, res) => {
  try {
    const { body } = req.body;
    const answer = new Answer({
      body,
      author: req.user.userId,
      question: req.params.id
    });
    await answer.save();
    await answer.populate('author', 'username avatar reputation');
    
    // Add answer to question
    await Question.findByIdAndUpdate(req.params.id, {
      $push: { answers: answer._id }
    });
    
    res.status(201).json(answer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Vote on Question
app.post('/api/questions/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const question = await Question.findById(req.params.id);
    question.votes += voteType === 'up' ? 1 : -1;
    await question.save();
    res.json({ votes: question.votes });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});