import type {UserProfile} from "../../types/UserProfile.ts";
import axiosClient from "../AxiosClient.ts";
import {getToken} from "../../util/Utilities.ts";

const fetchUserProfiles = async (emails: string[]): Promise<Record<string, UserProfile>> => {
    if (emails.length === 0) return {};

    const uniqueEmails = Array.from(new Set(emails));
    const response = await axiosClient.get<UserProfile[]>('/users/profiles', {
        params: { emails: uniqueEmails.join(',') }
    });

    // Convert the array into a dictionary for O(1) lookup during mapping
    const profileMap: Record<string, UserProfile> = {};
    response.data.forEach(profile => {
        profileMap[profile.email] = profile;
    });

    return profileMap;
};

export const fetchSingleUserProfile = async (email: string): Promise<UserProfile | null> => {
    const profiles = await fetchUserProfiles([email]);
    return profiles[email] || null;
};

export const searchUsersByQuery = async (query: string): Promise<UserProfile[]> => {
    if (!query || query.length < 2) return [];

    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers
    });

    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }

    return await response.json();
};