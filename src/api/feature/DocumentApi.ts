import type {Document, PaginatedResponse} from '../../data/types/Document.ts';
import axiosClient from "../AxiosClient.ts";

export const fetchDocuments = async (
    page: number,
    category: string | null,
    search: string | null
): Promise<PaginatedResponse<Document>> => {
    const params: Record<string, string | number> = { page, size: 30 };

    if (search) {
        params['search'] = search;
    }

    if (category && category !== 'UNSPECIFIED') {
        params['category'] = category;
    }

    const response = await axiosClient.get<PaginatedResponse<Document>>('/documents', {
        params
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
    const response = await axiosClient.post('/documents', data);
    return response.data;
};

export const updateDocumentMetadata = async (id: string, data: any) => {
    const response = await axiosClient.put(`/documents/${id}`, data);
    return response.data;
};

/**
 * This is only for professors to change the creator of a document
 */
export const updateDocumentCreator = async (id: string, newCreatorEmail: string) => {
    const response = await axiosClient.put(`/documents/${id}/creator`, { email: newCreatorEmail });
    return response.data;
};

// Axios automatically sets the correct multipart/form-data boundary when passing FormData
export const uploadCover = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("cover", file);

    const response = await axiosClient.post(`/documents/${id}/cover`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const deleteCover = async (id: string) => {
    await axiosClient.delete(`/documents/${id}/cover`);
};

export const uploadPdf = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("pdf", file);

    const response = await axiosClient.post(`/documents/${id}/pdf`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const deletePdf = async (id: string) => {
    await axiosClient.delete(`/documents/${id}/pdf`);
};

export const uploadAdditionalPdfs = async (id: string, files: File[], names: string[]) => {
    const formData = new FormData();

    files.forEach(file => formData.append("pdfs", file));
    names.forEach(name => formData.append("pdfNames", name));

    const response = await axiosClient.post(`/documents/${id}/additional-pdfs`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const syncAdditionalPdfs = async (id: string, existingFiles: any[]) => {
    const response = await axiosClient.put(`/documents/${id}/additional-pdfs`, { existingFiles });
    return response.data;
};

export const uploadVideo = async (id: string, file: File, name: string) => {
    const formData = new FormData();
    formData.append("video", file);
    formData.append("videoName", name);

    const response = await axiosClient.post(`/documents/${id}/video`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const syncVideo = async (id: string, existingVideo: any | null) => {
    const response = await axiosClient.put(`/documents/${id}/video`, { existingVideo });
    return response.data;
};

export const uploadProjectPhotos = async (id: string, files: File[], names: string[]) => {
    const formData = new FormData();

    files.forEach(file => formData.append("projectPhotos", file));
    names.forEach(name => formData.append("projectPhotoNames", name));

    const response = await axiosClient.post(`/documents/${id}/photos`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const syncProjectPhotos = async (id: string, existingFiles: any[]) => {
    const response = await axiosClient.put(`/documents/${id}/photos`, { existingFiles });
    return response.data;
};

export const uploadModels3d = async (id: string, files: File[], names: string[]) => {
    const formData = new FormData();

    files.forEach(file => formData.append("models3d", file));
    names.forEach(name => formData.append("models3dNames", name));

    const response = await axiosClient.post(`/documents/${id}/models`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const syncModels3d = async (id: string, existingFiles: any[]) => {
    const response = await axiosClient.put(`/documents/${id}/models`, { existingFiles });
    return response.data;
};
