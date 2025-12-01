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

export const getExploredCountries = async (userId) => {
  if (!userId) return [];
  try {
    const response = await apiClient.post('/Passport/_getExploredCountries', {
      user: userId,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch explored countries:', error);
    return [];
  }
};

export const getHistoryForCountry = async (userId, country) => {
  if (!userId || !country) return [];
  try {
    const response = await apiClient.post('/Passport/_getHistoryForCountry', {
      user: userId,
      country,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch history for ${country}:`, error);
    return [];
  }
};