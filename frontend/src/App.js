import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Question Components
import QuestionDetail from './components/questions/QuestionDetail';
import AskQuestion from './components/questions/AskQuestion';

// Styles
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Header />
            
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/questions/:id" element={<QuestionDetail />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/ask" 
                  element={
                    <ProtectedRoute>
                      <AskQuestion />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <Admin />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            
            <Footer />
            
            {/* Toast Notifications */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;