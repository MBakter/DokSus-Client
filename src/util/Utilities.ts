/**
 * Utility methods used throughout the project
 */

/**
 * Builds the URL of a stored file (image, PDF, model, video) from its server path,
 * usable directly in `src` / `href` attributes.
 */
export const getDownloadUrl = (path: string) => `/api/files?path=${encodeURIComponent(path)}`;

export const getToken = () => localStorage.getItem('jwt_token');

/**
 * The login token is also stored in a cookie so that images, PDFs and 3D models
 * (loaded by the browser itself, not by Axios) are sent with the user's identity.
 */
export const setSessionCookie = (token: string) => {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `jwt_token=${token}; Path=/; Max-Age=86400; SameSite=Lax${secure}`;
};

export const clearSessionCookie = () => {
    document.cookie = 'jwt_token=; Path=/; Max-Age=0; SameSite=Lax';
};

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