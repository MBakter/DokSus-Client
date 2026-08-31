import type {Document, PaginatedResponse} from '../../types/Document.ts';
import axiosClient from "../AxiosClient.ts";
import {getToken} from "../../util/Utilities.ts";

export const fetchDocuments = async (
    page: number,
    category: string | null,
    search: string | null
): Promise<PaginatedResponse<Document>> => {
    const headers: Record<string, string> = {};
    if (category) headers['Category'] = category;

    const params: Record<string, string | number> = { page, size: 30 };
    if (search) params['search'] = search;

    const response = await axiosClient.get<PaginatedResponse<Document>>('/documents', {
        params,
        headers
    });

    return response.data;
};

export const fetchUserPublishedDocuments = async (email: string): Promise<Document[]> => {
    const response = await axiosClient.get<Document[]>('/documents/user', {
        params: { email }
    });
    return response.data;
};

export const fetchMyDocuments = async (): Promise<Document[]> => {
    const response = await axiosClient.get<Document[]>('/documents/me');
    return response.data;
};

export const fetchDocumentById = async (id: string): Promise<Document> => {
    const response = await axiosClient.get<Document>(`/documents/${id}`);
    return response.data;
};

export const createDocument = async (payload: FormData) => {
    const token = getToken();
    const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: payload
    });
    if (!response.ok) throw new Error("Failed to create document");
    return response.json();
};

export const updateDocument = async (id: string, payload: FormData): Promise<Document> => {
    const token = getToken();
    const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: payload
    });
    if (!response.ok) throw new Error("Failed to update document");
    return response.json();
};