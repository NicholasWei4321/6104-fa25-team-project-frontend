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
 * @param {string} owner - User ID of the playlist owner
 * @param {string} name - Playlist name
 * @returns {Promise<{playlist: string}>}
 */
export async function createPlaylist(owner, name) {
  const response = await apiClient.post('/Playlist/createPlaylist', {
    owner,
    name
  });
  return response.data;
}

/**
 * Delete a playlist
 * @param {string} playlist - Playlist ID
 * @param {string} user - User ID of the owner
 * @returns {Promise<void>}
 */
export async function deletePlaylist(playlist, user) {
  const response = await apiClient.post('/Playlist/deletePlaylist', {
    playlist,
    user
  });
  return response.data;
}

/**
 * Rename a playlist
 * @param {string} playlist - Playlist ID
 * @param {string} newName - New playlist name
 * @param {string} user - User ID of the owner
 * @returns {Promise<void>}
 */
export async function renamePlaylist(playlist, newName, user) {
  const response = await apiClient.post('/Playlist/renamePlaylist', {
    playlist,
    newName,
    user
  });
  return response.data;
}

/**
 * Add a song to a playlist
 * @param {string} playlist - Playlist ID
 * @param {string} song - Song ID
 * @param {string} user - User ID of the owner
 * @returns {Promise<void>}
 */
export async function addSong(playlist, song, user) {
  const response = await apiClient.post('/Playlist/addSong', {
    playlist,
    song,
    user
  });
  return response.data;
}

/**
 * Remove a song from a playlist
 * @param {string} playlist - Playlist ID
 * @param {string} song - Song ID
 * @param {string} user - User ID of the owner
 * @returns {Promise<void>}
 */
export async function removeSong(playlist, song, user) {
  const response = await apiClient.post('/Playlist/removeSong', {
    playlist,
    song,
    user
  });
  return response.data;
}

/**
 * Reorder songs in a playlist
 * @param {string} playlist - Playlist ID
 * @param {string[]} songs - New ordered array of song IDs
 * @param {string} user - User ID of the owner
 * @returns {Promise<void>}
 */
export async function reorderSongs(playlist, songs, user) {
  const response = await apiClient.post('/Playlist/reorderSongs', {
    playlist,
    songs,
    user
  });
  return response.data;
}
