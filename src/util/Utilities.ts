/**
 * Utility methods used throughout the project
 */

/**
 * Fetch files from backend
  */
export const getDownloadUrl = (path: string) => `/api/files?path=${encodeURIComponent(path)}`;


