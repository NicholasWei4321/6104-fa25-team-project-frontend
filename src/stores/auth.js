import { defineStore } from 'pinia';
import * as AuthAPI from '../api/auth.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Current user information
    user: null, // User ID
    username: null,
    session: null, // Session token

    // Loading state
    loading: false,
    error: null,
  }),

  getters: {
    /**
     * Check if user is authenticated
     */
    isAuthenticated: (state) => !!state.session && !!state.user,
  },

  actions: {
    /**
     * Initialize auth state from localStorage
     * Call this when the app starts
     */
    init() {
      const user = localStorage.getItem('userId');
      const username = localStorage.getItem('username');
      const session = localStorage.getItem('sessionToken');

      if (user && session) {
        this.user = user;
        this.username = username;
        this.session = session;
      }
    },

    /**
     * Register a new user
     */
    async register(username, password) {
      this.loading = true;
      this.error = null;

      try {
        const result = await AuthAPI.register(username, password);

        if (result.error) {
          this.error = result.error;
          return { error: result.error };
        }

        // After registration, automatically log in
        return await this.login(username, password);
      } catch (error) {
        this.error = error.response?.data?.error || 'Registration failed';
        console.error('Registration error:', error);
        return { error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Login with username and password
     */
    async login(username, password) {
      this.loading = true;
      this.error = null;

      try {
        const result = await AuthAPI.login(username, password);

        if (result.error) {
          this.error = result.error;
          return { error: result.error };
        }

        // Store authentication state
        this.user = result.user;
        this.username = username;
        this.session = result.session;

        // Persist to localStorage
        localStorage.setItem('userId', result.user);
        localStorage.setItem('username', username);
        localStorage.setItem('sessionToken', result.session);

        return { success: true, user: result.user, session: result.session };
      } catch (error) {
        this.error = error.response?.data?.error || 'Login failed';
        console.error('Login error:', error);
        return { error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Logout the current user
     */
    async logout() {
      this.loading = true;
      this.error = null;

      try {
        if (this.session) {
          await AuthAPI.logout(this.session);
        }
      } catch (error) {
        console.error('Logout error:', error);
        // Continue with local logout even if server call fails
      } finally {
        // Clear state
        this.user = null;
        this.username = null;
        this.session = null;

        // Clear localStorage
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('sessionToken');

        this.loading = false;
      }
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null;
    },
  },
});
