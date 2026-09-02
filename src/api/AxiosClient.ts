import axios from 'axios';
import {getToken} from "../util/Utilities.ts";

// Access the environment variable in Vite
const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Optional: define a timeout (e.g., 10 seconds) so requests don't hang indefinitely
    timeout: 10000,
});

// Request Interceptor: Automatically attach the JWT token to every request if it exists
axiosClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle global errors (e.g., 401 Unauthorized)
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.error("Session expired or access denied. Redirecting to login.");

            // Completely wipe the dead session data
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_data');

            // Force redirect to the login page
            window.location.href = '/prijava';
        }

        return Promise.reject(error);
    }
);

export default axiosClient;