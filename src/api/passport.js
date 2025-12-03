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

/**
 * Get all song history for a user across all countries
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of unique songs from user's history
 */
export const getAllSongHistory = async (userId) => {
  if (!userId) return [];
  try {
    // Get all explored countries first
    const countries = await getExploredCountries(userId);

    // Fetch history for each country
    const allHistoryPromises = countries.map(c =>
      getHistoryForCountry(userId, c.country)
    );
    const allHistory = await Promise.all(allHistoryPromises);

    // Flatten and deduplicate songs
    const allSongs = allHistory.flat();
    const uniqueSongs = [];
    const seenSongIds = new Set();

    for (const item of allSongs) {
      const song = item.entry?.song || item.song;
      if (song && song._id && !seenSongIds.has(song._id)) {
        seenSongIds.add(song._id);
        uniqueSongs.push(song);
      }
    }

    return uniqueSongs;
  } catch (error) {
    console.error('Failed to fetch all song history:', error);
    return [];
  }
};