import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auth states
  const [isLogin, setIsLogin] = useState(true);
  const [authData, setAuthData] = useState({
    username: '',
    email: '',
    password: ''
  });

  // Question form states
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionData, setQuestionData] = useState({
    title: '',
    content: '',
    tags: ''
  });

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setQuestions([]);
    setSuccess('Logged out successfully!');
  }, []);

  // Fetch questions from API
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/questions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Questions received:', data);
        console.log('Type of data:', typeof data);
        console.log('Is array?', Array.isArray(data));
        
        // More robust data handling
        let questionsArray = [];
        
        if (Array.isArray(data)) {
          questionsArray = data;
        } else if (data && typeof data === 'object') {
          // Check various possible property names
          if (Array.isArray(data.questions)) {
            questionsArray = data.questions;
          } else if (Array.isArray(data.data)) {
            questionsArray = data.data;
          } else if (Array.isArray(data.results)) {
            questionsArray = data.results;
          } else {
            console.warn('Data structure not recognized:', data);
            questionsArray = [];
          }
        }
        
        // Validate that each question is an object
        questionsArray = questionsArray.filter(q => q && typeof q === 'object');
        
        console.log('Final questions array:', questionsArray);
        setQuestions(questionsArray);
      } else {
        console.error('Failed to fetch questions:', response.status);
        if (response.status === 401) {
          handleLogout();
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchQuestions();
      } catch (error) {
        console.error('Error parsing user data:', error);
        handleLogout();
      }
    }
  }, [fetchQuestions, handleLogout]);

  // Handle authentication (login/register)
  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: authData.email, password: authData.password }
        : { username: authData.username, email: authData.email, password: authData.password };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setSuccess(isLogin ? 'Login successful!' : 'Registration successful!');
        setAuthData({ username: '', email: '', password: '' });
        
        // Fetch questions after successful auth
        setTimeout(() => {
          fetchQuestions();
        }, 500);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Connection error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Handle question submission
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: questionData.title,
          content: questionData.content,
          tags: questionData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });

      if (response.ok) {
        setSuccess('Question posted successfully!');
        setQuestionData({ title: '', content: '', tags: '' });
        setShowQuestionForm(false);
        fetchQuestions();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to post question');
      }
    } catch (error) {
      console.error('Error posting question:', error);
      setError('Failed to post question');
    } finally {
      setLoading(false);
    }
  };

  // Handle voting
  const handleVote = async (questionId, voteType) => {
    if (!questionId) {
      console.error('Question ID is undefined');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/questions/${questionId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType })
      });

      if (response.ok) {
        fetchQuestions();
      } else {
        console.error('Vote failed:', response.status);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // Safe render helpers
  const renderUserName = (user) => {
    if (!user) return 'Unknown';
    return String(user.username || user.email || 'Unknown');
  };

  const renderQuestionAuthor = (question) => {
    if (!question) return 'Unknown';
    return String(question.username || question.author || 'Unknown');
  };

  const renderTag = (tag) => {
    if (tag === null || tag === undefined) return '';
    if (typeof tag === 'string') return tag;
    if (typeof tag === 'object') return JSON.stringify(tag);
    return String(tag);
  };

  // If user is not authenticated, show login/register form
  if (!user) {
    return (
      <div className="app">
        <div className="auth-container">
          <div className="auth-card">
            <h1>🚀 StackIt Forum</h1>
            <div className="auth-tabs">
              <button 
                className={isLogin ? 'tab active' : 'tab'} 
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button 
                className={!isLogin ? 'tab active' : 'tab'} 
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            <form onSubmit={handleAuth} className="auth-form">
              {!isLogin && (
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={authData.username}
                    onChange={(e) => setAuthData({...authData, username: e.target.value})}
                    required
                    placeholder="Enter your username"
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={authData.email}
                  onChange={(e) => setAuthData({...authData, email: e.target.value})}
                  required
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={authData.password}
                  onChange={(e) => setAuthData({...authData, password: e.target.value})}
                  required
                  placeholder="Enter your password"
                  minLength="4"
                />
              </div>
              
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  className="link-btn" 
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Register here' : 'Login here'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main forum interface (when user is authenticated)
  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🚀 StackIt Forum</h1>
          <div className="user-info">
            <span>Welcome, {renderUserName(user)}!</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <div className="actions">
          <button 
            onClick={() => setShowQuestionForm(!showQuestionForm)}
            className="primary-btn"
          >
            {showQuestionForm ? 'Cancel' : '+ Ask Question'}
          </button>
        </div>

        {showQuestionForm && (
          <div className="question-form-container">
            <h2>Ask a Question</h2>
            <form onSubmit={handleQuestionSubmit} className="question-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={questionData.title}
                  onChange={(e) => setQuestionData({...questionData, title: e.target.value})}
                  required
                  placeholder="What's your question?"
                />
              </div>
              
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={questionData.content}
                  onChange={(e) => setQuestionData({...questionData, content: e.target.value})}
                  required
                  placeholder="Provide more details about your question..."
                  rows="5"
                />
              </div>
              
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={questionData.tags}
                  onChange={(e) => setQuestionData({...questionData, tags: e.target.value})}
                  placeholder="javascript, react, css..."
                />
              </div>
              
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Posting...' : 'Post Question'}
              </button>
            </form>
          </div>
        )}

        <div className="questions-section">
          <h2>Recent Questions</h2>
          
          {loading && <div className="loading">Loading questions...</div>}
          
          {!loading && questions.length === 0 && (
            <div className="no-questions">
              <p>No questions yet!</p>
              <p>Be the first to ask a question.</p>
            </div>
          )}
          
          {!loading && questions.length > 0 && (
            <div className="questions-list">
              {questions.map((question, index) => {
                // Ensure question is an object
                if (!question || typeof question !== 'object') {
                  console.warn('Invalid question object at index', index, question);
                  return null;
                }
                
                const questionId = question.id || question._id;
                const upvotes = Number(question.upvotes) || 0;
                const downvotes = Number(question.downvotes) || 0;
                const voteCount = upvotes - downvotes;
                
                return (
                  <div key={questionId || `question-${index}`} className="question-card">
                    <div className="question-votes">
                      <button 
                        onClick={() => handleVote(questionId, 'upvote')}
                        className="vote-btn upvote"
                      >
                        ▲
                      </button>
                      <span className="vote-count">{voteCount}</span>
                      <button 
                        onClick={() => handleVote(questionId, 'downvote')}
                        className="vote-btn downvote"
                      >
                        ▼
                      </button>
                    </div>
                    
                    <div className="question-content">
                      <h3>{String(question.title || 'Untitled Question')}</h3>
                      <p>{String(question.content || 'No content provided')}</p>
                      
                      {question.tags && Array.isArray(question.tags) && question.tags.length > 0 && (
                        <div className="tags">
                          {question.tags.map((tag, tagIndex) => (
                            <span key={`${questionId}-tag-${tagIndex}`} className="tag">
                              {renderTag(tag)}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="question-meta">
                        <span>Asked by {renderQuestionAuthor(question)}</span>
                        <span>{question.createdAt ? new Date(question.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;