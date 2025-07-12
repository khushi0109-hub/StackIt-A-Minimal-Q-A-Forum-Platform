const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

console.log('Using in-memory database - ready to go!');

// In-Memory Database (No MongoDB installation needed)
const users = [];
const questions = [];
const answers = [];

// Helper functions for in-memory database
const findUser = (query) => users.find(u => u.email === query.email || u._id === query._id);
const findQuestion = (id) => questions.find(q => q._id === id);
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    if (findUser({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = {
      _id: generateId(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    users.push(user);
    
    // Create token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { _id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = findUser({ email });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { _id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Questions
app.get('/api/questions', async (req, res) => {
  try {
    const questionsWithAuthors = questions.map(q => ({
      ...q,
      author: users.find(u => u._id === q.author)
    }));
    res.json(questionsWithAuthors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create Question
app.post('/api/questions', authenticateToken, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    const question = {
      _id: generateId(),
      title,
      content,
      tags: tags || [],
      author: req.user.userId,
      votes: 0,
      answers: [],
      createdAt: new Date()
    };
    
    questions.push(question);
    
    res.status(201).json({
      message: 'Question created successfully',
      question: {
        ...question,
        author: users.find(u => u._id === question.author)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Single Question
app.get('/api/questions/:id', async (req, res) => {
  try {
    const question = findQuestion(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    const questionWithAuthor = {
      ...question,
      author: users.find(u => u._id === question.author)
    };
    
    res.json(questionWithAuthor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Vote on Question
app.post('/api/questions/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { vote } = req.body; // 1 for upvote, -1 for downvote
    const question = findQuestion(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    question.votes += vote;
    
    res.json({ message: 'Vote recorded', votes: question.votes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add Answer
app.post('/api/questions/:id/answers', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const question = findQuestion(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    const answer = {
      _id: generateId(),
      content,
      author: req.user.userId,
      votes: 0,
      createdAt: new Date()
    };
    
    question.answers.push(answer);
    answers.push(answer);
    
    res.status(201).json({
      message: 'Answer added successfully',
      answer: {
        ...answer,
        author: users.find(u => u._id === answer.author)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User Profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = findUser({ _id: req.user.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search Questions
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    
    const searchResults = questions.filter(question => 
      question.title.toLowerCase().includes(q.toLowerCase()) ||
      question.content.toLowerCase().includes(q.toLowerCase()) ||
      question.tags.some(tag => tag.toLowerCase().includes(q.toLowerCase()))
    );
    
    const resultsWithAuthors = searchResults.map(q => ({
      ...q,
      author: users.find(u => u._id === q.author)
    }));
    
    res.json(resultsWithAuthors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'StackIt Forum API is running!',
    database: 'In-Memory',
    users: users.length,
    questions: questions.length,
    answers: answers.length
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'StackIt Forum API',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/questions',
      'POST /api/questions',
      'GET /api/questions/:id',
      'POST /api/questions/:id/vote',
      'POST /api/questions/:id/answers',
      'GET /api/users/profile',
      'GET /api/search?q=query',
      'GET /api/health'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;