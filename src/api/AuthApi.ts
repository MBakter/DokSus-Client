import axiosClient from "./AxiosClient.ts";
import type {UserProfile} from "../data/types/UserProfile.ts";

export interface RegisterRequest {
    name: string;
    surname: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: UserProfile;
}

/** Registers a new account (`POST /api/auth/register`). Fails if the email is not whitelisted. */
export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
        const response = await axiosClient.post<AuthResponse>('/auth/register', data);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

/** Logs in (`POST /api/auth/login`) and returns the JWT token together with the user's profile. */
export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
    try {
        const response = await axiosClient.post<AuthResponse>('/auth/login', data);
        return response.data;
    } catch (error: any) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            throw new Error("Pogrešna e-mail adresa ili lozinka.");
        }
        throw new Error("Dogodila se pogreška prilikom prijave.");
    }
};