/**
 * Add a community recommendation for a given country
 * @param {Object} params
 * @param {string} params.countryName
 * @param {string} params.songTitle
 * @param {string} params.artist
 * @param {string} params.language
 * @param {string} params.youtubeURL
 * @param {string} params.genre
 * @returns {Promise<{recId: string} | {error: string}>}
 */
export async function addCommunityRec({ countryName, songTitle, artist, language, youtubeURL, genre }) {
  const payload = { countryName, songTitle, artist, language, youtubeURL };
  if (genre) payload.genre = genre;
  const response = await apiClient.post('/CountryRecommendation/addCommunityRec', payload);
  return response.data;
}
import apiClient from './client.js';

/**
 * Recommendations API service
 */

/**
 * Get system recommendations for a given country
 * @param {string} countryName
 * @returns {Promise<Array<{_id:string, title:string, artist:string, genre:string, language:string, youtubeUrl:string, recType:string}>>}
 */
export async function getSystemRecs(countryName) {
  const response = await apiClient.post('/CountryRecommendation/getSystemRecs', { countryName });
  const recommendations = response.data.recommendations || [];

  // Map backend field names to frontend field names
  return recommendations.map(rec => ({
    _id: rec._id,
    title: rec.songTitle,
    artist: rec.artist,
    genre: rec.genre,
    language: rec.language,
    youtubeUrl: rec.youtubeURL,
    recType: rec.recType,
    countryName: rec.countryName
  }));
}

/**
 * Get community recommendations for a given country
 * @param {string} countryName
 * @returns {Promise<Array<{_id:string, title:string, artist:string, genre:string, language:string, youtubeUrl:string, recType:string}>>}
 */
export async function getCommunityRecs(countryName) {
  const response = await apiClient.post('/CountryRecommendation/getCommunityRecs', { countryName });
  const recommendations = response.data.recommendations || [];

  // Map backend field names to frontend field names
  return recommendations.map(rec => ({
    _id: rec._id,
    title: rec.songTitle,
    artist: rec.artist,
    genre: rec.genre,
    language: rec.language,
    youtubeUrl: rec.youtubeURL,
    recType: rec.recType,
    countryName: rec.countryName
  }));
}
