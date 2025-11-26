import apiClient from './client.js';

/**
 * Playlist API service
 * All operations require session authentication via apiClient interceptor
 */

/**
 * Get all playlists for the logged-in user
 * @param {string} user - User ID
 * @returns {Promise<Array<{playlist: string, name: string}>>}
 */
export async function getPlaylistsForUser(user) {
  const response = await apiClient.post('/Playlist/_getPlaylistsForUser', { user });
  return response.data;
}

/**
 * Get details of a specific playlist
 * @param {string} playlist - Playlist ID
 * @returns {Promise<{_id: string, name: string, owner: string, songs: string[]}>}
 */
export async function getPlaylist(playlist) {
  const response = await apiClient.post('/Playlist/_getPlaylist', { playlist });
  return response.data[0]; // Query returns array, we want the first (and only) result
}

/**
 * Create a new playlist
 * @param {string} name - Playlist name
 * @returns {Promise<{playlist: string}>}
 */
export async function createPlaylist(name) {
  const session = localStorage.getItem('sessionToken');
  const response = await apiClient.post('/Playlist/createPlaylist', {
    session,
    name
  });
  return response.data;
}

/**
 * Delete a playlist
 * @param {string} playlist - Playlist ID
 * @returns {Promise<void>}
 */
export async function deletePlaylist(playlist) {
  const session = localStorage.getItem('sessionToken');
  const response = await apiClient.post('/Playlist/deletePlaylist', {
    session,
    playlist
  });
  return response.data;
}

/**
 * Rename a playlist
 * @param {string} playlist - Playlist ID
 * @param {string} newName - New playlist name
 * @returns {Promise<void>}
 */
export async function renamePlaylist(playlist, newName) {
  const session = localStorage.getItem('sessionToken');
  const response = await apiClient.post('/Playlist/renamePlaylist', {
    session,
    playlist,
    newName
  });
  return response.data;
}

/**
 * Add a song to a playlist
 * @param {string} playlist - Playlist ID
 * @param {string} song - Song ID
 * @returns {Promise<void>}
 */
export async function addSong(playlist, song) {
  const session = localStorage.getItem('sessionToken');
  const response = await apiClient.post('/Playlist/addSong', {
    session,
    playlist,
    song
  });
  return response.data;
}

/**
 * Remove a song from a playlist
 * @param {string} playlist - Playlist ID
 * @param {string} song - Song ID
 * @returns {Promise<void>}
 */
export async function removeSong(playlist, song) {
  const session = localStorage.getItem('sessionToken');
  const response = await apiClient.post('/Playlist/removeSong', {
    session,
    playlist,
    song
  });
  return response.data;
}

/**
 * Reorder songs in a playlist
 * @param {string} playlist - Playlist ID
 * @param {string[]} songs - New ordered array of song IDs
 * @returns {Promise<void>}
 */
export async function reorderSongs(playlist, songs) {
  const session = localStorage.getItem('sessionToken');
  const response = await apiClient.post('/Playlist/reorderSongs', {
    session,
    playlist,
    songs
  });
  return response.data;
}
