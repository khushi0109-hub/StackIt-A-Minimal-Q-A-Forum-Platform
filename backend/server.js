
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log('Using in-memory database - updated with correct voting logic.');

const users = [];
const questions = [];
const answers = [];
const voteHistory = {};

const findUser = (query) => users.find(u => u.email === query.email || u._id === query._id);
const findQuestion = (id) => questions.find(q => q._id === id);
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (findUser({ email })) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { _id: generateId(), username, email, password: hashedPassword, createdAt: new Date() };
    users.push(user);

    const token = jwt.sign({ userId: user._id, email: user.email }, 'your-secret-key', { expiresIn: '24h' });
    res.status(201).json({ message: 'User registered successfully', token, user: { _id: user._id, username, email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = findUser({ email });
    if (!user || !await bcrypt.compare(password, user.password))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, email: user.email }, 'your-secret-key', { expiresIn: '24h' });
    res.json({ message: 'Login successful', token, user: { _id: user._id, username, email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Question Routes
app.get('/api/questions', (req, res) => {
  const questionsWithAuthors = questions.map(q => ({
    ...q,
    author: users.find(u => u._id === q.author)
  }));
  res.json(questionsWithAuthors);
});

app.post('/api/questions', authenticateToken, (req, res) => {
  const { title, content, tags } = req.body;
  const question = {
    _id: generateId(),
    title,
    content,
    tags: tags || [],
    author: req.user.userId,
    votes: { upvotes: 0, downvotes: 0 },
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
});

app.get('/api/questions/:id', (req, res) => {
  const question = findQuestion(req.params.id);
  if (!question) return res.status(404).json({ message: 'Question not found' });
  res.json({ ...question, author: users.find(u => u._id === question.author) });
});

app.post('/api/questions/:id/vote', authenticateToken, (req, res) => {
  const { voteType } = req.body; // 'upvote' or 'downvote'
  const question = findQuestion(req.params.id);
  const key = `${req.user.userId}:${req.params.id}`;

  if (!question) return res.status(404).json({ message: 'Question not found' });
  if (!question.votes) question.votes = { upvotes: 0, downvotes: 0 };

  const previousVote = voteHistory[key];

  // Case 1: Repeating same vote -> undo
  if (previousVote === voteType) {
    if (voteType === 'upvote') question.votes.upvotes--;
    if (voteType === 'downvote') question.votes.downvotes--;
    delete voteHistory[key];
    return res.json({ message: 'Vote removed', votes: question.votes });
  }

  // Case 2: Switching vote (down -> up or up -> down)
  if (previousVote === 'upvote') question.votes.upvotes--;
  if (previousVote === 'downvote') question.votes.downvotes--;

  // Apply new vote
  if (voteType === 'upvote') question.votes.upvotes++;
  if (voteType === 'downvote') question.votes.downvotes++;

  voteHistory[key] = voteType;

  res.json({ message: 'Vote updated', votes: question.votes });
});

app.post('/api/questions/:id/answers', authenticateToken, (req, res) => {
  const { content } = req.body;
  const question = findQuestion(req.params.id);
  if (!question) return res.status(404).json({ message: 'Question not found' });

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
    message: 'Answer added',
    answer: {
      ...answer,
      author: users.find(u => u._id === answer.author)
    }
  });
});

// User Profile
app.get('/api/users/profile', authenticateToken, (req, res) => {
  const user = findUser({ _id: req.user.userId });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ _id: user._id, username: user.username, email: user.email, createdAt: user.createdAt });
});

// Search
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const results = questions.filter(qst =>
    qst.title.toLowerCase().includes(q.toLowerCase()) ||
    qst.content.toLowerCase().includes(q.toLowerCase()) ||
    qst.tags.some(tag => tag.toLowerCase().includes(q.toLowerCase()))
  );
  res.json(results.map(q => ({
    ...q,
    author: users.find(u => u._id === q.author)
  })));
});

// Utilities
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: 'In-Memory',
    users: users.length,
    questions: questions.length,
    answers: answers.length
  });
});

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
