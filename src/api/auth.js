import apiClient from './client.js';

/**
 * Authentication API service
 */

/**
 * Register a new user
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<{user: string} | {error: string}>}
 */
export async function register(username, password) {
  const response = await apiClient.post('/UserAuthentication/register', {
    username,
    password,
  });
  return response.data;
}

/**
 * Login with username and password
 * Backend automatically creates a session on successful login
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<{user: string, session: string} | {error: string}>}
 */
export async function login(username, password) {
  const response = await apiClient.post('/UserAuthentication/login', {
    username,
    password,
  });
  return response.data;
}

/**
 * Logout and delete session
 * @param {string} session - Session token
 * @returns {Promise<{status: string} | {error: string}>}
 */
export async function logout(session) {
  const response = await apiClient.post('/UserAuthentication/logout', {
    session,
  });
  return response.data;
}

/**
 * Get user by username (query)
 * @param {string} username - Username
 * @returns {Promise<{user: string}[]>}
 */
export async function getUserByUsername(username) {
  const response = await apiClient.post('/UserAuthentication/_getUserByUsername', {
    username,
  });
  return response.data;
}

/**
 * Get username from user ID (query)
 * @param {string} user - User ID
 * @returns {Promise<{username: string}[]>}
 */
export async function getUsername(user) {
  const response = await apiClient.post('/UserAuthentication/_getUsername', {
    user,
  });
  return response.data;
}
