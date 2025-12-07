import { defineStore } from "pinia";
import * as PlaylistAPI from "../api/playlist.js";
import { useAuthStore } from "./auth.js";

// Normalize song input to a song ID string before sending to the API
const normalizeSongId = (song) => {
  if (!song) return "";
  if (typeof song === "string") return song;
  if (typeof song === "object") {
    return song._id || song.song || song.songId || "";
  }
  return "";
};

const requireUserId = () => {
  const authStore = useAuthStore();
  return authStore.user;
};

export const usePlaylistStore = defineStore("playlist", {
  state: () => ({
    // List of user's playlists: { playlist: string, name: string }[]
    playlists: [],

    // Currently selected/active playlist details
    currentPlaylist: null,

    // Cache of song details by ID
    songCache: {},

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
      return state.playlists.find((p) => p.playlist === id);
    },

    /**
     * Check if current playlist has songs
     */
    hasCurrentPlaylistSongs: (state) => {
      return state.currentPlaylist?.songs?.length > 0;
    },

    /**
     * Get song details from cache or return ID
     */
    getSongDetails: (state) => (songId) => {
      return state.songCache[songId] || songId;
    },

    /**
     * Get enriched current playlist with song details
     */
    enrichedCurrentPlaylist: (state) => {
      if (!state.currentPlaylist) return null;

      return {
        ...state.currentPlaylist,
        songs: state.currentPlaylist.songs.map(songId =>
          state.songCache[songId] || songId
        )
      };
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
        this.error = error.response?.data?.error || "Failed to fetch playlists";
        console.error("Error fetching playlists:", error);
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
        this.error =
          error.response?.data?.error || "Failed to fetch playlist details";
        console.error("Error fetching playlist details:", error);
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
        const userId = requireUserId();
        if (!userId) {
          this.error = "Not authenticated";
          throw new Error(this.error);
        }

        const result = await PlaylistAPI.createPlaylist(userId, name);

        // Add to local list
        this.playlists.push({
          playlist: result.playlist,
          name: name,
        });

        return result;
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to create playlist";
        console.error("Error creating playlist:", error);
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
        const userId = requireUserId();
        if (!userId) {
          this.error = "Not authenticated";
          throw new Error(this.error);
        }

        await PlaylistAPI.deletePlaylist(playlistId, userId);

        // Remove from local list
        this.playlists = this.playlists.filter(
          (p) => p.playlist !== playlistId
        );

        // Clear current playlist if it was deleted
        if (this.currentPlaylist?._id === playlistId) {
          this.currentPlaylist = null;
        }
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to delete playlist";
        console.error("Error deleting playlist:", error);
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
        const userId = requireUserId();
        if (!userId) {
          this.error = "Not authenticated";
          throw new Error(this.error);
        }

        await PlaylistAPI.renamePlaylist(playlistId, newName, userId);

        // Update local list
        const playlist = this.playlists.find((p) => p.playlist === playlistId);
        if (playlist) {
          playlist.name = newName;
        }

        // Update current playlist if it's the one being renamed
        if (this.currentPlaylist?._id === playlistId) {
          this.currentPlaylist.name = newName;
        }
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to rename playlist";
        console.error("Error renaming playlist:", error);
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
        const userId = requireUserId();
        if (!userId) {
          this.error = "Not authenticated";
          throw new Error(this.error);
        }

        const normalizedSongId = normalizeSongId(songId);
        if (!normalizedSongId) {
          this.error = "Invalid song id";
          throw new Error(this.error);
        }

        const result = await PlaylistAPI.addSong(
          playlistId,
          normalizedSongId,
          userId
        );

        // Check if backend returned an error (even as a 200 response)
        if (result && result.error) {
          this.error = result.error;
          throw new Error(result.error);
        }

        // Update current playlist if it's loaded
        if (this.currentPlaylist?._id === playlistId) {
          this.currentPlaylist.songs.push(normalizedSongId);
        }
      } catch (error) {
        this.error =
          this.error ||
          error.response?.data?.error ||
          error.message ||
          "Failed to add song";
        console.error("Error adding song:", error);
        throw error;
      }
    },

    /**
     * Remove a song from a playlist
     */
    async removeSong(playlistId, songId) {
      this.error = null;

      try {
        const userId = requireUserId();
        if (!userId) {
          this.error = "Not authenticated";
          throw new Error(this.error);
        }

        const normalizedSongId = normalizeSongId(songId);
        if (!normalizedSongId) {
          this.error = "Invalid song id";
          throw new Error(this.error);
        }

        await PlaylistAPI.removeSong(playlistId, normalizedSongId, userId);

        // Update current playlist if it's loaded
        if (this.currentPlaylist?._id === playlistId) {
          this.currentPlaylist.songs = this.currentPlaylist.songs.filter(
            (s) => s !== normalizedSongId
          );
        }
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to remove song";
        console.error("Error removing song:", error);
        throw error;
      }
    },

    /**
     * Reorder songs in a playlist
     */
    async reorderSongs(playlistId, newSongOrder) {
      this.error = null;

      try {
        const userId = requireUserId();
        if (!userId) {
          this.error = "Not authenticated";
          throw new Error(this.error);
        }

        const normalizedSongOrder = newSongOrder.map(normalizeSongId);
        if (normalizedSongOrder.some((id) => !id)) {
          this.error = "Invalid song ids in reorder";
          throw new Error(this.error);
        }
        await PlaylistAPI.reorderSongs(playlistId, normalizedSongOrder, userId);

        // Update current playlist if it's loaded
        if (this.currentPlaylist?._id === playlistId) {
          this.currentPlaylist.songs = normalizedSongOrder;
        }
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to reorder songs";
        console.error("Error reordering songs:", error);
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
