// Home.js - Main Landing Page
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [filterTag, setFilterTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API calls
  const mockQuestions = [
    {
      id: 1,
      title: "How to implement authentication in Node.js?",
      content: "I'm building a web application and need to implement user authentication. What's the best approach using Node.js and Express?",
      tags: ['nodejs', 'authentication', 'express', 'security'],
      author: {
        name: "John Doe",
        avatar: "/api/placeholder/32/32",
        reputation: 1250
      },
      votes: 15,
      answers: 8,
      views: 342,
      createdAt: "2024-01-15T10:30:00Z",
      isAnswered: true,
      isAccepted: true
    },
    {
      id: 2,
      title: "React hooks vs class components - which to use?",
      content: "I'm starting a new React project and wondering whether to use hooks or class components. What are the pros and cons of each?",
      tags: ['react', 'hooks', 'components', 'javascript'],
      author: {
        name: "Jane Smith",
        avatar: "/api/placeholder/32/32",
        reputation: 890
      },
      votes: 23,
      answers: 12,
      views: 567,
      createdAt: "2024-01-14T14:20:00Z",
      isAnswered: true,
      isAccepted: false
    },
    {
      id: 3,
      title: "MongoDB vs PostgreSQL for web applications",
      content: "I'm designing a new web application and need to choose between MongoDB and PostgreSQL. What factors should I consider?",
      tags: ['mongodb', 'postgresql', 'database', 'web-development'],
      author: {
        name: "Mike Johnson",
        avatar: "/api/placeholder/32/32",
        reputation: 2100
      },
      votes: 31,
      answers: 15,
      views: 891,
      createdAt: "2024-01-13T09:15:00Z",
      isAnswered: true,
      isAccepted: true
    },
    {
      id: 4,
      title: "Best practices for API design",
      content: "I'm building a REST API and want to follow best practices. What are the key principles I should follow?",
      tags: ['api', 'rest', 'best-practices', 'backend'],
      author: {
        name: "Sarah Wilson",
        avatar: "/api/placeholder/32/32",
        reputation: 1450
      },
      votes: 18,
      answers: 6,
      views: 234,
      createdAt: "2024-01-12T16:45:00Z",
      isAnswered: false,
      isAccepted: false
    },
    {
      id: 5,
      title: "How to optimize React app performance?",
      content: "My React application is becoming slow as it grows. What are the best techniques to optimize performance?",
      tags: ['react', 'performance', 'optimization', 'javascript'],
      author: {
        name: "David Brown",
        avatar: "/api/placeholder/32/32",
        reputation: 1780
      },
      votes: 26,
      answers: 9,
      views: 445,
      createdAt: "2024-01-11T11:30:00Z",
      isAnswered: true,
      isAccepted: true
    }
  ];

  const popularTags = [
    { name: 'javascript', count: 1234 },
    { name: 'react', count: 987 },
    { name: 'nodejs', count: 765 },
    { name: 'python', count: 654 },
    { name: 'mongodb', count: 543 },
    { name: 'express', count: 432 },
    { name: 'api', count: 321 },
    { name: 'authentication', count: 298 }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setQuestions(mockQuestions);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    // In real app, this would trigger new API call
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = filterTag === '' || question.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'votes':
        return b.votes - a.votes;
      case 'answers':
        return b.answers - a.answers;
      case 'views':
        return b.views - a.views;
      default:
        return 0;
    }
  });

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getReputationColor = (reputation) => {
    if (reputation < 500) return 'reputation-bronze';
    if (reputation < 1000) return 'reputation-silver';
    if (reputation < 2000) return 'reputation-gold';
    return 'reputation-platinum';
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to StackIt</h1>
          <p>Where developers come to learn, share knowledge, and build their careers</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">50,000+</span>
              <span className="stat-label">Questions</span>
            </div>
            <div className="stat">
              <span className="stat-number">25,000+</span>
              <span className="stat-label">Developers</span>
            </div>
            <div className="stat">
              <span className="stat-number">95%</span>
              <span className="stat-label">Questions Answered</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>Popular Tags</h3>
            <div className="tags-list">
              {popularTags.map(tag => (
                <button
                  key={tag.name}
                  className={`tag-button ${filterTag === tag.name ? 'active' : ''}`}
                  onClick={() => setFilterTag(filterTag === tag.name ? '' : tag.name)}
                >
                  {tag.name}
                  <span className="tag-count">{tag.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <Link to="/ask" className="action-button primary">
                Ask Question
              </Link>
              <Link to="/questions" className="action-button">
                Browse All Questions
              </Link>
              <Link to="/tags" className="action-button">
                Explore Tags
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-section">
          {/* Search and Filter Bar */}
          <div className="search-filter-bar">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <svg className="search-icon" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="sort-buttons">
              <button
                className={`sort-button ${sortBy === 'newest' ? 'active' : ''}`}
                onClick={() => handleSortChange('newest')}
              >
                Newest
              </button>
              <button
                className={`sort-button ${sortBy === 'votes' ? 'active' : ''}`}
                onClick={() => handleSortChange('votes')}
              >
                Most Votes
              </button>
              <button
                className={`sort-button ${sortBy === 'answers' ? 'active' : ''}`}
                onClick={() => handleSortChange('answers')}
              >
                Most Answers
              </button>
              <button
                className={`sort-button ${sortBy === 'views' ? 'active' : ''}`}
                onClick={() => handleSortChange('views')}
              >
                Most Views
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="questions-list">
            {sortedQuestions.length === 0 ? (
              <div className="no-questions">
                <h3>No questions found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : (
              sortedQuestions.map(question => (
                <div key={question.id} className="question-card">
                  <div className="question-stats">
                    <div className="stat-item">
                      <span className="stat-number">{question.votes}</span>
                      <span className="stat-label">votes</span>
                    </div>
                    <div className={`stat-item ${question.isAnswered ? 'answered' : ''}`}>
                      <span className="stat-number">{question.answers}</span>
                      <span className="stat-label">answers</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{question.views}</span>
                      <span className="stat-label">views</span>
                    </div>
                  </div>

                  <div className="question-content">
                    <div className="question-header">
                      <Link to={`/questions/${question.id}`} className="question-title">
                        {question.title}
                      </Link>
                      {question.isAccepted && (
                        <span className="accepted-badge">✓ Accepted</span>
                      )}
                    </div>

                    <p className="question-excerpt">
                      {question.content.substring(0, 150)}...
                    </p>

                    <div className="question-tags">
                      {question.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>

                    <div className="question-meta">
                      <div className="author-info">
                        <img 
                          src={question.author.avatar} 
                          alt={question.author.name}
                          className="author-avatar"
                        />
                        <span className="author-name">{question.author.name}</span>
                        <span className={`author-reputation ${getReputationColor(question.author.reputation)}`}>
                          {question.author.reputation}
                        </span>
                      </div>
                      <div className="question-time">
                        asked {formatTimeAgo(question.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More Button */}
          {sortedQuestions.length >= 5 && (
            <div className="load-more-container">
              <button className="load-more-button">
                Load More Questions
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;