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
    timeout: UPLOAD_TIMEOUT_MS
};

/** Fields the upload endpoints echo back. Used to notice a 200 that did not actually store the file. */
type StoredFiles = {
    files?: {
        coverPath?: string | null;
        pdfPath?: string | null;
        additionalPdfs?: { path?: string | null }[];
        projectPhotos?: { path?: string | null }[];
        models3d?: { path?: string | null }[];
        video?: { path?: string | null } | null;
    };
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
    const response = await axiosClient.get<Document>(`/documents/${id}`, {
        headers: {'Cache-Control': 'no-cache', Pragma: 'no-cache'}
    });
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

// FormData is sent without a manual Content-Type so the browser adds the multipart boundary.
export const uploadCover = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("cover", file);

    const response = await axiosClient.post<StoredFiles>(`/documents/${id}/cover`, formData, uploadConfig);
    if (!response.data.files?.coverPath) {
        throw new Error("Naslovna fotografija nije spremljena.");
    }
    return response.data;
};

export const deleteCover = async (id: string) => {
    await axiosClient.delete(`/documents/${id}/cover`);
};

export const uploadPdf = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("pdf", file);

    const response = await axiosClient.post<StoredFiles>(`/documents/${id}/pdf`, formData, uploadConfig);
    if (!response.data.files?.pdfPath) {
        throw new Error("PDF dokument nije spremljen.");
    }
    return response.data;
};

export const deletePdf = async (id: string) => {
    await axiosClient.delete(`/documents/${id}/pdf`);
};

const assertNewPath = (paths: { path?: string | null }[] | undefined, known: Set<string>, failure: string) => {
    const added = (paths ?? []).map(item => item.path).find(path => path && !known.has(path));
    if (!added) throw new Error(failure);
    known.add(added);
};

export const uploadAdditionalPdfs = async (id: string, files: File[], names: string[], existingPaths: string[]) => {
    // One request per file, so a batch is not limited by the total request size.
    const known = new Set(existingPaths);
    for (let index = 0; index < files.length; index++) {
        const formData = new FormData();
        formData.append("pdfs", files[index]);
        formData.append("pdfNames", names[index]);
        const response = await axiosClient.post<StoredFiles>(`/documents/${id}/additional-pdfs`, formData, uploadConfig);
        assertNewPath(response.data.files?.additionalPdfs, known, "Dodatni PDF nije spremljen.");
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

    const response = await axiosClient.post<StoredFiles>(`/documents/${id}/video`, formData, uploadConfig);
    if (!response.data.files?.video?.path) {
        throw new Error("Video nije spremljen.");
    }
    return response.data;
};

export const syncVideo = async (id: string, existingVideo: any | null) => {
    const response = await axiosClient.put(`/documents/${id}/video`, { existingVideo });
    return response.data;
};

export const uploadProjectPhotos = async (id: string, files: File[], names: string[], existingPaths: string[]) => {
    const known = new Set(existingPaths);
    for (let index = 0; index < files.length; index++) {
        const formData = new FormData();
        formData.append("projectPhotos", files[index]);
        formData.append("projectPhotoNames", names[index]);
        const response = await axiosClient.post<StoredFiles>(`/documents/${id}/photos`, formData, uploadConfig);
        assertNewPath(response.data.files?.projectPhotos, known, "Fotografija nije spremljena.");
    }
};

export const syncProjectPhotos = async (id: string, existingFiles: any[]) => {
    const response = await axiosClient.put(`/documents/${id}/photos`, { existingFiles });
    return response.data;
};

export const uploadModels3d = async (id: string, files: File[], names: string[], existingPaths: string[]) => {
    const known = new Set(existingPaths);
    for (let index = 0; index < files.length; index++) {
        const formData = new FormData();
        formData.append("models3d", files[index]);
        formData.append("models3dNames", names[index]);
        const response = await axiosClient.post<StoredFiles>(`/documents/${id}/models`, formData, uploadConfig);
        assertNewPath(response.data.files?.models3d, known, "3D model nije spremljen.");
    }
};

export const syncModels3d = async (id: string, existingFiles: any[]) => {
    const response = await axiosClient.put(`/documents/${id}/models`, { existingFiles });
    return response.data;
};
