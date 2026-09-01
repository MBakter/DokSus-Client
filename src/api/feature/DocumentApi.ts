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

//// EDIT DOCUMENTS

export const createDocumentMetadata = async (data: any) => {
    const token = getToken();
    const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Failed to create document metadata");
    return response.json();
};

export const updateDocumentMetadata = async (id: string, data: any) => {
    const token = getToken();
    const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Failed to update document metadata");
    return response.json();
};

export const uploadCover = async (id: string, file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("cover", file);

    const response = await fetch(`/api/documents/${id}/cover`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
            // Do NOT set 'Content-Type' manually when sending FormData.
            // The browser must automatically set it to 'multipart/form-data' with the correct boundary.
        },
        body: formData
    });

    if (!response.ok) throw new Error("Failed to upload cover photo");
    return response.json();
};

export const deleteCover = async (id: string) => {
    const token = getToken();
    const response = await fetch(`/api/documents/${id}/cover`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error("Failed to delete cover photo");
    // No json() return expected for a successful DELETE (usually returns 204 No Content)
};

export const uploadPdf = async (id: string, file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("pdf", file);

    const response = await fetch(`/api/documents/${id}/pdf`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) throw new Error("Failed to upload PDF");
    return response.json();
};

export const deletePdf = async (id: string) => {
    const token = getToken();
    const response = await fetch(`/api/documents/${id}/pdf`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error("Failed to delete PDF");
};

export const uploadVideo = async (id: string, file: File, name: string) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("video", file);
    formData.append("videoName", name);

    const response = await fetch(`/api/documents/${id}/video`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
            // Again, no Content-Type here for FormData
        },
        body: formData
    });

    if (!response.ok) throw new Error("Failed to upload video");
    return response.json();
};

export const syncVideo = async (id: string, existingVideo: any | null) => {
    const token = getToken();
    const response = await fetch(`/api/documents/${id}/video`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        // Wrapping it to match data class SyncVideoRequest(val existingVideo: NamedFile?)
        body: JSON.stringify({ existingVideo })
    });

    if (!response.ok) throw new Error("Failed to sync video state");
    return response.json();
};

export const uploadProjectPhotos = async (id: string, files: File[], names: string[]) => {
    const token = getToken();
    const formData = new FormData();

    // Append multiple files and names under the exact same keys expected by the backend
    files.forEach(file => formData.append("projectPhotos", file));
    names.forEach(name => formData.append("projectPhotoNames", name));

    const response = await fetch(`/api/documents/${id}/photos`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) throw new Error("Failed to upload project photos");
    return response.json();
};

export const syncProjectPhotos = async (id: string, existingFiles: any[]) => {
    const token = getToken();
    const response = await fetch(`/api/documents/${id}/photos`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        // Wrapping it to match data class SyncFilesRequest(val existingFiles: List<NamedFile>)
        body: JSON.stringify({ existingFiles })
    });

    if (!response.ok) throw new Error("Failed to sync project photos");
    return response.json();
};

export const uploadModels3d = async (id: string, files: File[], names: string[]) => {
    const token = getToken();
    const formData = new FormData();

    files.forEach(file => formData.append("models3d", file));
    names.forEach(name => formData.append("models3dNames", name));

    const response = await fetch(`/api/documents/${id}/models`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) throw new Error("Failed to upload 3D models");
    return response.json();
};

export const syncModels3d = async (id: string, existingFiles: any[]) => {
    const token = getToken();
    const response = await fetch(`/api/documents/${id}/models`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        // Wrapping it to match data class SyncFilesRequest(val existingFiles: List<NamedFile>)
        body: JSON.stringify({ existingFiles })
    });

    if (!response.ok) throw new Error("Failed to sync 3D models");
    return response.json();
};
