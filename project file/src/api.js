import axios from 'axios';

// Your .env file correctly sets this URL
const API_URL = process.env.REACT_APP_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Handles user registration.
 * @param {object} userData - The user's registration data (username, email, password, usertype).
 * @returns {Promise} - The axios promise.
 */
export const register = (userData) => {
  return apiClient.post('/api/auth/register', userData);
};

/**
 * Handles user login.
 * @param {object} credentials - The user's login credentials (email, password).
 * @returns {Promise} - The axios promise.
 */
export const login = (credentials) => {
  return apiClient.post('/api/auth/login', credentials);
};