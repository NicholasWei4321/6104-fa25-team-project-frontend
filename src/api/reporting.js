import apiClient from "./client.js";

/**
 * Reporting API service
 */

/**
 * Initialize a report object for a given objectId
 * @param {string} objectId
 * @returns {Promise<{objectId: string} | {error: string}>}
 */
export async function initializeReportObject(objectId) {
  const response = await apiClient.post("/Reporting/InitializeObject", {
    objectId,
  });
  return response.data;
}

/**
 * Report an object by a user
 * @param {string} objectId
 * @param {string} userId
 * @returns {Promise<{} | {error: string}>}
 */
export async function reportObject(objectId, userId) {
  const response = await apiClient.post("/Reporting/Report", {
    objectId,
    userId,
  });
  return response.data;
}

/**
 * Unreport an object by a user
 * @param {string} objectId
 * @param {string} userId
 * @returns {Promise<{} | {error: string}>}
 */
export async function unreportObject(objectId, userId) {
  const response = await apiClient.post("/Reporting/Unreport", {
    objectId,
    userId,
  });
  return response.data;
}

/**
 * Get the report count for an object
 * @param {string} objectId
 * @returns {Promise<Array<{count: number}>>}
 */
export async function getReportCount(objectId) {
  const response = await apiClient.post("/Reporting/_getReportCount", {
    objectId,
  });
  return response.data;
}

/**
 * Get the reporters for an object
 * @param {string} objectId
 * @returns {Promise<Array<{reporters: string[]}>>}
 */
export async function getReporters(objectId) {
  const response = await apiClient.post("/Reporting/_getReporters", {
    objectId,
  });
  return response.data;
}

/**
 * Check if a user has reported an object
 * @param {string} objectId
 * @param {string} userId
 * @returns {Promise<{hasReported: boolean}>}
 */
export async function hasUserReported(objectId, userId) {
  try {
    const reporters = await getReporters(objectId);
    const reportersList = reporters[0]?.reporters || [];
    return { hasReported: reportersList.includes(userId) };
  } catch (error) {
    console.error("Error checking report status:", error);
    return { hasReported: false };
  }
}
