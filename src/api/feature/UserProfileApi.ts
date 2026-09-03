import type {UserProfile} from "../../data/types/UserProfile.ts";
import axiosClient from "../AxiosClient.ts";

export const fetchUserProfiles = async (emails: string[]): Promise<Record<string, UserProfile>> => {
    if (emails.length === 0) return {};

    try {
        const uniqueEmails = Array.from(new Set(emails));
        const response = await axiosClient.get<UserProfile[]>('/users/profiles', {
            params: {emails: uniqueEmails.join(',')}
        });

        // Convert the array into a dictionary for O(1) lookup during mapping
        const profileMap: Record<string, UserProfile> = {};
        response.data.forEach(profile => {
            profileMap[profile.email] = profile;
        });

        return profileMap;
    } catch (error) {
        console.error("Error fetching user profiles:", error);
        // Throw the error so the UI can catch it and show a toast/alert if necessary
        throw error;
    }
};

export const fetchSingleUserProfile = async (email: string): Promise<UserProfile | null> => {
    try {
        const profiles = await fetchUserProfiles([email]);
        return profiles[email] || null;
    } catch (error) {
        console.error(`Error fetching single user profile for ${email}:`, error);
        // Return null instead of throwing, preventing UI crashes if a single profile fails to load
        return null;
    }
};

export const searchUsersByQuery = async (query: string, isProfessor?: boolean): Promise<UserProfile[]> => {
    if (!query || query.trim().length < 2) return [];

    try {
        const params: any = {query: query.trim()};
        if (isProfessor !== undefined) {
            params.isProfessor = isProfessor;
        }

        const response = await axiosClient.get<UserProfile[]>('/users/search', {params});
        return response.data;
    } catch (error) {
        console.error("Error searching users by query:", error);
        return [];
    }
};