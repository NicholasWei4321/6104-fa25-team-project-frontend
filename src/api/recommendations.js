import apiClient from './client.js';

/**
 * Recommendations API service
 */

/**
 * Get system recommendations for a given country
 * @param {string} country
 * @returns {Promise<Array<{title:string, artist:string, genre?:string, language:string, youtubeUrl:string}>>}
 */
export async function getSystemRecs(country) {
  const response = await apiClient.post('/Recommendations/GetSystemRecs', { country });
  return response.data;
}
