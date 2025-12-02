import apiClient from './client.js';

/**
 * Passport API service
 */

/**
 * Log a user's musical exploration of a song from a specific country
 * @param {string} user - User ID
 * @param {object} song - Song object with _id, songTitle, artist, language, youtubeURL, recType, genre
 * @param {string} country - Country name
 * @returns {Promise<{entry: string}>}
 */
export async function logExploration(user, song, country) {
  const response = await apiClient.post('/Passport/logExploration', {
    user,
    song,
    country,
  });
  return response.data;
}
