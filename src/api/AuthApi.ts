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
    user: UserProfile; // Aligned with the rest of your frontend code
}

export const registerUser = async (data: RegisterRequest): Promise<void> => {
    try {
        await axiosClient.post('/auth/register', data);
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error("Dogodila se pogreška prilikom registracije.");
    }
};

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