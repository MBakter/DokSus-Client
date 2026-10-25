/**
 * All backend calls related to documents (`/api/documents/...`).
 * Saving a document is split in two: the form data is sent as JSON, then each file type
 * is uploaded (POST, multipart) or synced (PUT, list of files to keep) separately.
 */
import type {Document, PaginatedResponse} from '../../data/types/Document.ts';
import axiosClient from "../AxiosClient.ts";

/** Large files (video, 3D models) need longer than the default request timeout. */
const UPLOAD_TIMEOUT_MS = 5 * 60 * 1000;

const uploadConfig = {
    timeout: UPLOAD_TIMEOUT_MS,
    headers: {'Content-Type': 'multipart/form-data'}
};

/** Paginated, filterable list of published documents for the home and group pages. */
export const fetchDocuments = async (
    page: number,
    category: string | null,
    search: string | null,
    group: string | null = null,
    size: number = 12
): Promise<PaginatedResponse<Document>> => {
    const params: Record<string, string | number> = { page, size };

    if (search) params['search'] = search;
    if (category && category !== 'UNSPECIFIED') params['category'] = category;
    if (group) params['group'] = group;

    const response = await axiosClient.get<PaginatedResponse<Document>>('/documents', {
        params
    });

    return response.data;
};

/** Published documents where the given user is creator, co-creator or mentor (public profile page). */
export const fetchUserPublishedDocuments = async (email: string): Promise<Document[]> => {
    const response = await axiosClient.get<Document[]>('/documents/user', {
        params: { email }
    });
    return response.data;
};

/** All documents (drafts and published) owned by the logged-in user. */
export const fetchMyDocuments = async (): Promise<Document[]> => {
    const response = await axiosClient.get<Document[]>('/documents/me');
    return response.data;
};

export const fetchDocumentById = async (id: string): Promise<Document> => {
    const response = await axiosClient.get<Document>(`/documents/${id}`);
    return response.data;
};

//// EDIT DOCUMENTS

/** Creates a new document from the form data (no files) and returns it with its new id. */
export const createDocumentMetadata = async (data: any) => {
    const response = await axiosClient.post('/documents', data);
    return response.data;
};

export const updateDocumentMetadata = async (id: string, data: any) => {
    const response = await axiosClient.put(`/documents/${id}`, data);
    return response.data;
};

export const deleteDocument = async (id: string) => {
    await axiosClient.delete(`/documents/${id}`);
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

    const response = await axiosClient.post(`/documents/${id}/cover`, formData, uploadConfig);
    return response.data;
};

export const deleteCover = async (id: string) => {
    await axiosClient.delete(`/documents/${id}/cover`);
};

export const uploadPdf = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("pdf", file);

    const response = await axiosClient.post(`/documents/${id}/pdf`, formData, uploadConfig);
    return response.data;
};

export const deletePdf = async (id: string) => {
    await axiosClient.delete(`/documents/${id}/pdf`);
};

export const uploadAdditionalPdfs = async (id: string, files: File[], names: string[]) => {
    // One request per file, so a batch is not limited by the total request size.
    for (let index = 0; index < files.length; index++) {
        const formData = new FormData();
        formData.append("pdfs", files[index]);
        formData.append("pdfNames", names[index]);
        await axiosClient.post(`/documents/${id}/additional-pdfs`, formData, uploadConfig);
    }
};

export const syncAdditionalPdfs = async (id: string, existingFiles: any[]) => {
    const response = await axiosClient.put(`/documents/${id}/additional-pdfs`, { existingFiles });
    return response.data;
};

export const uploadVideo = async (id: string, file: File, name: string) => {
    const formData = new FormData();
    formData.append("video", file);
    formData.append("videoName", name);

    const response = await axiosClient.post(`/documents/${id}/video`, formData, uploadConfig);
    return response.data;
};

export const syncVideo = async (id: string, existingVideo: any | null) => {
    const response = await axiosClient.put(`/documents/${id}/video`, { existingVideo });
    return response.data;
};

export const uploadProjectPhotos = async (id: string, files: File[], names: string[]) => {
    for (let index = 0; index < files.length; index++) {
        const formData = new FormData();
        formData.append("projectPhotos", files[index]);
        formData.append("projectPhotoNames", names[index]);
        await axiosClient.post(`/documents/${id}/photos`, formData, uploadConfig);
    }
};

export const syncProjectPhotos = async (id: string, existingFiles: any[]) => {
    const response = await axiosClient.put(`/documents/${id}/photos`, { existingFiles });
    return response.data;
};

export const uploadModels3d = async (id: string, files: File[], names: string[]) => {
    for (let index = 0; index < files.length; index++) {
        const formData = new FormData();
        formData.append("models3d", files[index]);
        formData.append("models3dNames", names[index]);
        await axiosClient.post(`/documents/${id}/models`, formData, uploadConfig);
    }
};

export const syncModels3d = async (id: string, existingFiles: any[]) => {
    const response = await axiosClient.put(`/documents/${id}/models`, { existingFiles });
    return response.data;
};
