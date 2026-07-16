import type {Document, PaginatedResponse} from '../types/Document.ts';
import axiosClient from "./AxiosClient.ts";

export const fetchDocuments = async (
    page: number,
    category: string | null,
    search: string | null
): Promise<PaginatedResponse<Document>> => {
    console.log("fetch documents")

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

export const fetchMyDocuments = async (): Promise<Document[]> => {
    // The JWT token is automatically appended by the axiosClient interceptor.
    const response = await axiosClient.get<Document[]>('/documents/me');
    return response.data;
};