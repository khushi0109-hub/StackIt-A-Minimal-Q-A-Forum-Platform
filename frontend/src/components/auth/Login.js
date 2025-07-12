// Login.js - Authentication Component
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { email, password, name, confirmPassword } = formData;

    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (!isLogin) {
      if (!name || name.trim().length < 2) {
        toast.error('Please enter a valid name');
        return false;
      }

      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Login successful!');
        navigate(from, { replace: true });
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        toast.success('Registration successful! Please check your email for verification.');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await login('demo@stackit.com', 'demo123');
      toast.success('Demo login successful!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="bg-pattern"></div>
      </div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <Link to="/" className="logo">
              <h1>StackIt</h1>
            </Link>
            <p className="subtitle">
              {isLogin ? 'Welcome back!' : 'Join the community'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                  <svg className="input-icon" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
                <svg className="input-icon" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
                <svg className="input-icon" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <circle cx="12" cy="16" r="1" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    required={!isLogin}
                  />
                  <svg className="input-icon" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <circle cx="12" cy="16" r="1" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="form-options">
                <label className="checkbox-wrapper">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>
            )}

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                <div className="button-spinner">
                  <div className="spinner"></div>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>

            {isLogin && (
              <button 
                type="button" 
                onClick={handleDemoLogin}
                className="demo-button"
                disabled={loading}
              >
                Try Demo Account
              </button>
            )}

            <div className="divider">
              <span>or</span>
            </div>

            <div className="social-login">
              <button type="button" className="social-button google">
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              
              <button type="button" className="social-button github">
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </button>
            </div>
          </form>

          <div className="login-footer">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button onClick={toggleMode} className="toggle-button">
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        <div className="login-info">
          <div className="info-content">
            <h2>Join the Developer Community</h2>
            <div className="features">
              <div className="feature">
                <div className="feature-icon">❓</div>
                <div>
                  <h3>Ask Questions</h3>
                  <p>Get help from experienced developers</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">💡</div>
                <div>
                  <h3>Share Knowledge</h3>
                  <p>Help others and build your reputation</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">🏆</div>
                <div>
                  <h3>Earn Badges</h3>
                  <p>Get recognized for your contributions</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">🌟</div>
                <div>
                  <h3>Build Network</h3>
                  <p>Connect with developers worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;