import type {UserProfile} from "../../types/UserProfile.ts";
import axiosClient from "../AxiosClient.ts";
import type {Document} from "../../types/Document.ts";

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

export const populateOwnerProfiles = async (documents: Document[]): Promise<Document[]> => {
    const emails = documents.map(doc => doc.ownerEmail);
    const profiles = await fetchUserProfiles(emails);

    return documents.map(doc => ({
        ...doc,
        ownerProfile: profiles[doc.ownerEmail]
    }));
};