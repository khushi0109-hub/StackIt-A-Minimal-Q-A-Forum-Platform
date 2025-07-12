// QuestionDetail.js - Location: frontend/src/components/questions/QuestionDetail.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './QuestionDetail.css';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState(null);

  // Mock data - replace with API calls
  useEffect(() => {
    const mockQuestion = {
      id: parseInt(id),
      title: "How to implement JWT authentication in React and Node.js?",
      content: "I'm building a full-stack application with React frontend and Node.js backend. I want to implement JWT authentication but I'm confused about the best practices.\n\nWhat I've tried:\n- Basic session-based authentication\n- Reading JWT documentation\n\nWhat I need:\n- Step-by-step implementation guide\n- Security best practices\n- Token refresh mechanism\n\nCan someone provide a complete example with both frontend and backend code?",
      tags: ['javascript', 'react', 'node.js', 'jwt', 'authentication'],
      author: {
        id: 1,
        name: 'John Developer',
        reputation: 2450,
        avatar: '/api/placeholder/40/40',
        joinDate: '2023-01-15'
      },
      votes: 23,
      answers: 5,
      views: 1250,
      createdAt: '2024-01-20T10:30:00Z',
      updatedAt: '2024-01-20T10:30:00Z',
      isBookmarked: false
    };

    const mockAnswers = [
      {
        id: 1,
        content: "Here's a comprehensive guide to implement JWT authentication:\n\n**Backend (Node.js):**\n\n```javascript\nconst jwt = require('jsonwebtoken');\nconst bcrypt = require('bcryptjs');\n\n// Generate JWT token\nconst generateToken = (userId) => {\n  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });\n};\n\n// Verify JWT middleware\nconst verifyToken = (req, res, next) => {\n  const token = req.header('Authorization')?.replace('Bearer ', '');\n  if (!token) {\n    return res.status(401).json({ error: 'No token provided' });\n  }\n  \n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    req.user = decoded;\n    next();\n  } catch (error) {\n    res.status(401).json({ error: 'Invalid token' });\n  }\n};\n```\n\n**Frontend (React):**\n\n```javascript\n// Auth context\nconst AuthContext = createContext();\n\nconst AuthProvider = ({ children }) => {\n  const [user, setUser] = useState(null);\n  const [token, setToken] = useState(localStorage.getItem('token'));\n\n  const login = async (credentials) => {\n    const response = await fetch('/api/auth/login', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(credentials)\n    });\n    \n    const data = await response.json();\n    if (data.token) {\n      setToken(data.token);\n      localStorage.setItem('token', data.token);\n      setUser(data.user);\n    }\n  };\n\n  return (\n    <AuthContext.Provider value={{ user, login, token }}>\n      {children}\n    </AuthContext.Provider>\n  );\n};\n```\n\n**Key Security Practices:**\n1. Use environment variables for JWT secret\n2. Set appropriate expiration times\n3. Implement token refresh mechanism\n4. Use HTTPS in production\n5. Store tokens securely (consider httpOnly cookies)\n\nThis implementation provides a solid foundation for JWT authentication!",
        author: {
          id: 2,
          name: 'Sarah Security',
          reputation: 5420,
          avatar: '/api/placeholder/40/40',
          badge: 'Expert'
        },
        votes: 45,
        isAccepted: true,
        createdAt: '2024-01-20T11:45:00Z',
        updatedAt: '2024-01-20T11:45:00Z'
      },
      {
        id: 2,
        content: "Great answer by Sarah! I'd like to add some additional security considerations:\n\n**Token Refresh Strategy:**\n\n```javascript\n// Refresh token implementation\nconst refreshToken = async () => {\n  try {\n    const response = await fetch('/api/auth/refresh', {\n      method: 'POST',\n      headers: {\n        'Authorization': `Bearer ${localStorage.getItem('refreshToken')}`\n      }\n    });\n    \n    const data = await response.json();\n    if (data.accessToken) {\n      localStorage.setItem('token', data.accessToken);\n      return data.accessToken;\n    }\n  } catch (error) {\n    // Redirect to login\n    window.location.href = '/login';\n  }\n};\n```\n\n**Additional Security Tips:**\n- Use short-lived access tokens (15-30 minutes)\n- Implement refresh tokens with longer expiration\n- Add rate limiting to prevent brute force attacks\n- Use CORS properly\n- Validate and sanitize all inputs\n\n**Testing Authentication:**\n```javascript\n// Jest test example\nit('should authenticate user with valid credentials', async () => {\n  const mockUser = { email: 'test@example.com', password: 'password123' };\n  const response = await request(app)\n    .post('/api/auth/login')\n    .send(mockUser);\n    \n  expect(response.status).toBe(200);\n  expect(response.body.token).toBeDefined();\n});\n```\n\nHope this helps with your implementation!",
        author: {
          id: 3,
          name: 'Mike Backend',
          reputation: 3200,
          avatar: '/api/placeholder/40/40',
          badge: 'Contributor'
        },
        votes: 12,
        isAccepted: false,
        createdAt: '2024-01-20T14:20:00Z',
        updatedAt: '2024-01-20T14:20:00Z'
      }
    ];

    // Simulate API call delay
    setTimeout(() => {
      setQuestion(mockQuestion);
      setAnswers(mockAnswers);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleVote = (type) => {
    if (userVote === type) {
      setUserVote(null);
      setQuestion(prev => ({
        ...prev,
        votes: prev.votes + (type === 'up' ? -1 : 1)
      }));
    } else {
      const voteChange = type === 'up' 
        ? (userVote === 'down' ? 2 : 1)
        : (userVote === 'up' ? -2 : -1);
      
      setUserVote(type);
      setQuestion(prev => ({
        ...prev,
        votes: prev.votes + voteChange
      }));
    }
  };

  const handleAnswerVote = (answerId, type) => {
    setAnswers(prev => prev.map(answer => {
      if (answer.id === answerId) {
        const currentVote = answer.userVote;
        let voteChange = 0;
        
        if (currentVote === type) {
          voteChange = type === 'up' ? -1 : 1;
          answer.userVote = null;
        } else {
          voteChange = type === 'up' 
            ? (currentVote === 'down' ? 2 : 1)
            : (currentVote === 'up' ? -2 : -1);
          answer.userVote = type;
        }
        
        return { ...answer, votes: answer.votes + voteChange };
      }
      return answer;
    }));
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newAnswerObj = {
        id: answers.length + 1,
        content: newAnswer,
        author: {
          id: 999,
          name: 'Current User',
          reputation: 150,
          avatar: '/api/placeholder/40/40',
          badge: 'Newbie'
        },
        votes: 0,
        isAccepted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setAnswers(prev => [...prev, newAnswerObj]);
      setNewAnswer('');
      setIsSubmitting(false);
    }, 1000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="question-detail-container">
        <div className="loading-spinner">Loading question...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="question-detail-container">
        <div className="error-message">Question not found</div>
      </div>
    );
  }

  return (
    <div className="question-detail-container">
      <div className="question-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back to Questions
        </button>
        <div className="question-meta">
          <span>{question.views} views</span>
          <span>Asked {formatDate(question.createdAt)}</span>
        </div>
      </div>

      <div className="question-content">
        <div className="voting-section">
          <button 
            className={`vote-button ${userVote === 'up' ? 'active' : ''}`}
            onClick={() => handleVote('up')}
          >
            ▲
          </button>
          <span className="vote-count">{question.votes}</span>
          <button 
            className={`vote-button ${userVote === 'down' ? 'active' : ''}`}
            onClick={() => handleVote('down')}
          >
            ▼
          </button>
          <button className="bookmark-button">
            {question.isBookmarked ? '★' : '☆'}
          </button>
        </div>

        <div className="question-main">
          <h1 className="question-title">{question.title}</h1>
          <div className="question-body">
            <p>{question.content}</p>
          </div>
          <div className="question-tags">
            {question.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
          <div className="question-author">
            <img src={question.author.avatar} alt={question.author.name} />
            <div className="author-info">
              <span className="author-name">{question.author.name}</span>
              <span className="author-reputation">{question.author.reputation.toLocaleString()}</span>
            </div>
            <span className="question-date">asked {formatDate(question.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="answers-section">
        <h2 className="answers-title">
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>

        {answers.map((answer) => (
          <div key={answer.id} className={`answer ${answer.isAccepted ? 'accepted' : ''}`}>
            <div className="voting-section">
              <button 
                className={`vote-button ${answer.userVote === 'up' ? 'active' : ''}`}
                onClick={() => handleAnswerVote(answer.id, 'up')}
              >
                ▲
              </button>
              <span className="vote-count">{answer.votes}</span>
              <button 
                className={`vote-button ${answer.userVote === 'down' ? 'active' : ''}`}
                onClick={() => handleAnswerVote(answer.id, 'down')}
              >
                ▼
              </button>
              {answer.isAccepted && (
                <div className="accepted-badge">✓</div>
              )}
            </div>

            <div className="answer-content">
              <div className="answer-body">
                <div dangerouslySetInnerHTML={{ 
                  __html: answer.content
                    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
                    .replace(/`([^`]+)`/g, '<code>$1</code>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br/>')
                }} />
              </div>
              <div className="answer-footer">
                <div className="answer-author">
                  <img src={answer.author.avatar} alt={answer.author.name} />
                  <div className="author-info">
                    <span className="author-name">{answer.author.name}</span>
                    <span className="author-reputation">{answer.author.reputation.toLocaleString()}</span>
                    {answer.author.badge && (
                      <span className={`author-badge ${answer.author.badge.toLowerCase()}`}>
                        {answer.author.badge}
                      </span>
                    )}
                  </div>
                </div>
                <span className="answer-date">answered {formatDate(answer.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="answer-form-section">
        <h3>Your Answer</h3>
        <form onSubmit={handleSubmitAnswer} className="answer-form">
          <textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Write your answer here... You can use markdown for formatting."
            rows={10}
            className="answer-textarea"
            required
          />
          <div className="answer-form-actions">
            <button 
              type="submit" 
              className={`submit-answer-button ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting || !newAnswer.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Post Answer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionDetail;