/**
 * Utility methods used throughout the project
 */

/**
 * Fetch files from backend
  */
export const getDownloadUrl = (path: string) => `/api/files?path=${encodeURIComponent(path)}`;

export const getToken = () => localStorage.getItem('jwt_token');

export const getInitials = (name: string, surname: string) => `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();

