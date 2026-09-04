/**
 * Utility methods used throughout the project
 */

/**
 * Fetch files from backend
  */
export const getDownloadUrl = (path: string) => `/api/files?path=${encodeURIComponent(path)}`;

export const getToken = () => localStorage.getItem('jwt_token');

export const getInitials = (name: string, surname: string) => `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();

export const formatDateObj = (dateRaw: any) => {
    if (!dateRaw) return '';
    try {
        if (typeof dateRaw === 'string') {
            return new Date(dateRaw).toLocaleDateString('hr-HR');
        }
        if (dateRaw.epochSeconds) {
            const secs = typeof dateRaw.epochSeconds === 'object'
                ? parseInt(dateRaw.epochSeconds.$numberLong, 10)
                : parseInt(dateRaw.epochSeconds, 10);
            return new Date(secs * 1000).toLocaleDateString('hr-HR');
        }
    } catch (e) {
        console.error("Failed to parse date", dateRaw);
    }
    return '';
};