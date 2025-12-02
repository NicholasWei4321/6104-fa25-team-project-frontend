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
