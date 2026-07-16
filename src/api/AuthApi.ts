import axiosClient from "./AxiosClient.ts";
import type {User} from "../context/AuthContext.tsx";


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
    user: User;
}

export const registerUser = async (data: RegisterRequest): Promise<void> => {
    await axiosClient.post('/auth/register', data);
};

export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', data);
    return response.data;
};