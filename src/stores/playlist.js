import { defineStore } from 'pinia';
import * as PlaylistAPI from '../api/playlist.js';

export const usePlaylistStore = defineStore('playlist', {
  state: () => ({
    // List of user's playlists: { playlist: string, name: string }[]
    playlists: [],

    // Currently selected/active playlist details
    currentPlaylist: null,

    // Loading states
    loading: false,
    loadingPlaylist: false,

    // Error handling
    error: null,
  }),

  getters: {
    /**
     * Get playlist by ID
     */
    getPlaylistById: (state) => (id) => {
      return state.playlists.find(p => p.playlist === id);
    },

    /**
     * Check if current playlist has songs
     */
    hasCurrentPlaylistSongs: (state) => {
      return state.currentPlaylist?.songs?.length > 0;
    },
  },

  actions: {
    /**
     * Fetch all playlists for a user
     */
    async fetchPlaylists(userId) {
      this.loading = true;
      this.error = null;

      try {
        const playlists = await PlaylistAPI.getPlaylistsForUser(userId);
        this.playlists = playlists;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch playlists';
        console.error('Error fetching playlists:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch details for a specific playlist
     */
    async fetchPlaylistDetails(playlistId) {
      this.loadingPlaylist = true;
      this.error = null;

      try {
        const playlist = await PlaylistAPI.getPlaylist(playlistId);
        this.currentPlaylist = playlist;
        return playlist;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch playlist details';
        console.error('Error fetching playlist details:', error);
        throw error;
      } finally {
        this.loadingPlaylist = false;
      }
    },

    /**
     * Create a new playlist
     */
    async createPlaylist(name) {
      this.loading = true;
      this.error = null;

      try {
        const result = await PlaylistAPI.createPlaylist(name);

        // Add to local list
        this.playlists.push({
          playlist: result.playlist,
          name: name
        });

        return result;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to create playlist';
        console.error('Error creating playlist:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Delete a playlist
     */
    async deletePlaylist(playlistId) {
      this.loading = true;
      this.error = null;

      try {
        await PlaylistAPI.deletePlaylist(playlistId);

        // Remove from local list
        this.playlists = this.playlists.filter(p => p.playlist !== playlistId);

        // Clear current playlist if it was deleted
        if (this.currentPlaylist?._id === playlistId) {
          this.currentPlaylist = null;
        }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to delete playlist';
        console.error('Error deleting playlist:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Rename a playlist
     */
    async renamePlaylist(playlistId, newName) {
      this.loading = true;
      this.error = null;

      try {
        await PlaylistAPI.renamePlaylist(playlistId, newName);

        // Update local list
        const playlist = this.playlists.find(p => p.playlist === playlistId);
        if (playlist) {
          playlist.name = newName;
        }

        // Update current playlist if it's the one being renamed
        if (this.currentPlaylist?._id === playlistId) {
          this.currentPlaylist.name = newName;
        }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to rename playlist';
        console.error('Error renaming playlist:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Add a song to a playlist
     */
    async addSong(playlistId, songId) {
      this.error = null;

      try {
        await PlaylistAPI.addSong(playlistId, songId);

        // Update current playlist if it's loaded
        if (this.currentPlaylist?._id === playlistId) {
          this.currentPlaylist.songs.push(songId);
        }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to add song';
        console.error('Error adding song:', error);
        throw error;
      }
    },

    /**
     * Remove a song from a playlist
     */
    async removeSong(playlistId, songId) {
      this.error = null;

      try {
        await PlaylistAPI.removeSong(playlistId, songId);

        // Update current playlist if it's loaded
        if (this.currentPlaylist?._id === playlistId) {
          this.currentPlaylist.songs = this.currentPlaylist.songs.filter(s => s !== songId);
        }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to remove song';
        console.error('Error removing song:', error);
        throw error;
      }
    },

    /**
     * Reorder songs in a playlist
     */
    async reorderSongs(playlistId, newSongOrder) {
      this.error = null;

      try {
        await PlaylistAPI.reorderSongs(playlistId, newSongOrder);

        // Update current playlist if it's loaded
        if (this.currentPlaylist?._id === playlistId) {
          this.currentPlaylist.songs = newSongOrder;
        }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to reorder songs';
        console.error('Error reordering songs:', error);
        throw error;
      }
    },

    /**
     * Clear current playlist
     */
    clearCurrentPlaylist() {
      this.currentPlaylist = null;
    },

    /**
     * Clear all errors
     */
    clearError() {
      this.error = null;
    },
  },
});
