import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAIL: 'LOGIN_FAIL',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAIL: 'REGISTER_FAIL',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_FAIL:
    case AUTH_ACTIONS.REGISTER_FAIL:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      };
    
    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getProfile();
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: userData.user,
              token: token
            }
          });
        } catch (error) {
          console.error('Error loading user:', error);
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await authService.login(email, password);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          token: response.token
        }
      });
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAIL,
        payload: errorMessage
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await authService.register(userData);
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: {
          user: response.user,
          token: response.token
        }
      });
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAIL,
        payload: errorMessage
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.info('Logged out successfully');
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Update user function
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData
    });
  };

  // Check if user is admin
  const isAdmin = () => {
    return state.user && state.user.role === 'admin';
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return state.token && state.user;
  };

  // Context value
  const contextValue = {
    // State
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    clearError,
    updateUser,
    
    // Helpers
    isAdmin,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};