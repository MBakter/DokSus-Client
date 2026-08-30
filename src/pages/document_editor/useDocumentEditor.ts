import { useEffect, useState } from 'preact/hooks';
import type {DocumentContent} from "../../types/Document.ts";
import {createDocument, fetchDocumentById, updateDocument} from "../../api/feature/DocumentApi.ts";

export interface NamedFile {
    file: File;
    name: string;
    previewUrl: string;
}

export interface ServerNamedFile {
    path: string;
    name: string;
}

export const CATEGORIES = [
    "",
    "DRVENI PREDMETI", "SLIKE NA PLATNU", "ZIDNE SLIKE",
    "KAMENA I ARHITEKTONSKA PLASTIKA", "OSTALI MATERIJALI",
    "ISTRAŽIVAČKI RADOVI I REFERENTNI MATERIJALI", "DIPLOMSKI I SEMINARSKI RADOVI"
];

export const REQUIRED_METADATA_FIELDS: Array<keyof DocumentContent> = [
    'category', 'invNumber', 'name', 'author', 'date', 'student', 'professor'
];

const INITIAL_DATA: DocumentContent = {
    category: '', invNumber: '', name: '', author: '', date: '', student: '', professor: '',
    material: '', technique: '', pigment: '', binder: '', finishingLayer: '', materialsUsed: '',
    typeOfAnalysis: '', goalOfAnalysis: '', works: '', keywords: '', location: '', storage: ''
};

export function useDocumentEditor(id?: string) {
    // --- Basic State ---
    const [documentId, setDocumentId] = useState<string | null>(id || null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(!!id);

    // --- Form & Snapshot State ---
    const [formData, setFormData] = useState<DocumentContent>(INITIAL_DATA);
    const [snapshot, setSnapshot] = useState<DocumentContent>(INITIAL_DATA);

    // --- Local Files State ---
    const [files, setFiles] = useState<{
        cover: File | null;
        pdf: File | null;
        video: NamedFile | null;
        projectPhotos: NamedFile[];
        models3d: NamedFile[];
    }>({
        cover: null, pdf: null, video: null, projectPhotos: [], models3d: []
    });

    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

    // --- Server Files State ---
    const [serverPaths, setServerPaths] = useState<{
        cover: string;
        pdf: string;
        video: ServerNamedFile | null;
        projectPhotos: ServerNamedFile[];
        models3d: ServerNamedFile[];
    }>({
        cover: '', pdf: '', video: null, projectPhotos: [], models3d: []
    });

    // Tracks initial state so we know if something was deleted
    const [initialServerState, setInitialServerState] = useState<{
        cover: string;
        pdf: string;
        photos: ServerNamedFile[];
        models: ServerNamedFile[];
        video: ServerNamedFile | null;
    }>({
        cover: '', pdf: '', photos: [], models: [], video: null
    });

    // --- Data Fetching ---
    useEffect(() => {
        if (id) {
            loadExistingDocument(id);
        }
    }, [id]);

    const loadExistingDocument = async (docId: string) => {
        setIsLoading(true);
        try {
            const document = await fetchDocumentById(docId);
            setFormData(document.content);
            setSnapshot(document.content);

            const fetchedPhotos = (document as any).projectPhotos || [];
            const fetchedModels = (document as any).models3d || [];
            const fetchedVideo = (document as any).video || null;

            setServerPaths({
                cover: document.coverPath || '',
                pdf: document.pdfPath || '',
                video: fetchedVideo,
                projectPhotos: fetchedPhotos,
                models3d: fetchedModels
            });

            setInitialServerState({
                cover: document.coverPath || '',
                pdf: document.pdfPath || '',
                photos: JSON.parse(JSON.stringify(fetchedPhotos)),
                models: JSON.parse(JSON.stringify(fetchedModels)),
                video: fetchedVideo ? JSON.parse(JSON.stringify(fetchedVideo)) : null
            });
        } catch (error) {
            console.error("Failed to load document", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Input Handlers ---
    const handleInputChange = (e: Event) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        setFormData((prev: any) => ({ ...prev, [target.name]: target.value }));
    };

    const handleSingleFileChange = (type: 'cover' | 'pdf' | 'video') => (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            const selectedFile = target.files[0];

            if (type === 'cover') {
                setFiles(prev => ({ ...prev, cover: selectedFile }));
                setCoverPreviewUrl(URL.createObjectURL(selectedFile));
            } else if (type === 'pdf') {
                setFiles(prev => ({ ...prev, pdf: selectedFile }));
            } else if (type === 'video') {
                setFiles(prev => ({
                    ...prev,
                    video: { file: selectedFile, name: selectedFile.name.split('.')[0], previewUrl: URL.createObjectURL(selectedFile) }
                }));
            }
        }
    };

    const handleMultipleFilesChange = (type: 'projectPhotos' | 'models3d') => (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            const newFiles: NamedFile[] = Array.from(target.files).map(file => ({
                file,
                name: file.name.split('.')[0],
                previewUrl: URL.createObjectURL(file)
            }));
            setFiles(prev => ({ ...prev, [type]: [...prev[type], ...newFiles] }));
        }
        target.value = '';
    };

    // --- Rename Handlers ---
    const handleUpdateFileName = (type: 'projectPhotos' | 'models3d', index: number, newName: string) => {
        setFiles(prev => {
            const updated = [...prev[type]];
            updated[index].name = newName;
            return { ...prev, [type]: updated };
        });
    };

    const handleUpdateServerPhotoName = (index: number, newName: string) => {
        setServerPaths(prev => {
            const updated = [...prev.projectPhotos];
            updated[index].name = newName;
            return { ...prev, projectPhotos: updated };
        });
    };

    const handleUpdateServerModelName = (index: number, newName: string) => {
        setServerPaths(prev => {
            const updated = [...prev.models3d];
            updated[index].name = newName;
            return { ...prev, models3d: updated };
        });
    };

    const handleUpdateVideoName = (newName: string, isServer: boolean) => {
        if (isServer && serverPaths.video) {
            setServerPaths(prev => ({ ...prev, video: { ...prev.video!, name: newName } }));
        } else if (!isServer && files.video) {
            setFiles(prev => ({ ...prev, video: { ...prev.video!, name: newName } }));
        }
    };

    // --- Remove handlers ---
    const handleRemoveCover = () => {
        setFiles(prev => ({ ...prev, cover: null }));
        setCoverPreviewUrl(null);
        setServerPaths(prev => ({ ...prev, cover: '' }));
    };
    const handleRemovePdf = () => {
        setFiles(prev => ({ ...prev, pdf: null }));
        setServerPaths(prev => ({ ...prev, pdf: '' }));
    };
    const handleRemoveFile = (type: 'projectPhotos' | 'models3d', index: number) => {
        setFiles(prev => {
            const updated = [...prev[type]];
            if (updated[index].previewUrl) URL.revokeObjectURL(updated[index].previewUrl);
            updated.splice(index, 1);
            return { ...prev, [type]: updated };
        });
    };
    const handleRemoveServerPhoto = (index: number) => {
        setServerPaths(prev => {
            const updated = [...prev.projectPhotos];
            updated.splice(index, 1);
            return { ...prev, projectPhotos: updated };
        });
    };
    const handleRemoveServerModel = (index: number) => {
        setServerPaths(prev => {
            const updated = [...prev.models3d];
            updated.splice(index, 1);
            return { ...prev, models3d: updated };
        });
    };

    const handleRemoveVideo = (isServer: boolean) => {
        if (isServer) {
            setServerPaths(prev => ({ ...prev, video: null }));
        } else {
            if (files.video?.previewUrl) URL.revokeObjectURL(files.video.previewUrl);
            setFiles(prev => ({ ...prev, video: null }));
        }
    };

    // --- Validation & Change Detection ---
    const isFormFilled = REQUIRED_METADATA_FIELDS.every(field => formData[field].trim() !== '');
    const isPublishable = isFormFilled && (files.pdf !== null || serverPaths.pdf !== '');

    const hasTextChanges = JSON.stringify(formData) !== JSON.stringify(snapshot);
    const hasServerPhotoChanges = JSON.stringify(serverPaths.projectPhotos) !== JSON.stringify(initialServerState.photos);
    const hasServerModelChanges = JSON.stringify(serverPaths.models3d) !== JSON.stringify(initialServerState.models);
    const hasServerVideoChanges = JSON.stringify(serverPaths.video) !== JSON.stringify(initialServerState.video);
    const hasServerCoverChanges = serverPaths.cover !== initialServerState.cover;
    const hasServerPdfChanges = serverPaths.pdf !== initialServerState.pdf;

    const hasFileChanges = files.cover !== null || files.pdf !== null || files.video !== null || files.projectPhotos.length > 0 || files.models3d.length > 0;
    const hasChanges = hasTextChanges || hasFileChanges || hasServerPhotoChanges || hasServerModelChanges || hasServerVideoChanges || hasServerCoverChanges || hasServerPdfChanges;

    const handleSave = async (publish: boolean) => {
        setIsSaving(true);
        try {
            const payload = new FormData();
            payload.append("document", new Blob([JSON.stringify(formData)], { type: "application/json" }), "document.json");
            payload.append("isPublished", String(publish));

            // Existing server files that were renamed
            if (hasServerPhotoChanges) {
                payload.append("existingProjectPhotos", new Blob([JSON.stringify(serverPaths.projectPhotos)], { type: "application/json" }), "existingPhotos.json");
            }
            if (hasServerModelChanges) {
                payload.append("existingModels3d", new Blob([JSON.stringify(serverPaths.models3d)], { type: "application/json" }), "existingModels3d.json");
            }

            // Flags for deleting single files
            if (!serverPaths.cover && initialServerState.cover) payload.append("removeServerCover", "true");
            if (!serverPaths.pdf && initialServerState.pdf) payload.append("removeServerPdf", "true");
            if (!serverPaths.video && initialServerState.video) payload.append("removeServerVideo", "true");
            else if (serverPaths.video && hasServerVideoChanges) {
                payload.append("existingVideo", new Blob([JSON.stringify(serverPaths.video)], { type: "application/json" }), "existingVideo.json");
            }

            // Append new physical files
            if (files.cover) payload.append("cover", files.cover);
            if (files.pdf) payload.append("pdf", files.pdf);
            if (files.video) {
                payload.append("video", files.video.file);
                payload.append("videoName", files.video.name);
            }

            files.projectPhotos.forEach(item => {
                payload.append("projectPhotos", item.file);
                payload.append("projectPhotoNames", item.name);
            });

            files.models3d.forEach(item => {
                payload.append("models3d", item.file);
                payload.append("models3dNames", item.name);
            });

            // Execute API Call
            if (documentId) {
                await updateDocument(documentId, payload);
            } else {
                const newDoc = await createDocument(payload);
                setDocumentId(newDoc.id);
            }

            if (publish) window.location.href = '/racun';
            else {
                if (documentId) loadExistingDocument(documentId);
                // Reset local staging
                setFiles({ cover: null, pdf: null, video: null, projectPhotos: [], models3d: [] });
                setCoverPreviewUrl(null);
            }
        } catch (error) {
            console.error("Failed to save document:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return {
        documentId, isSaving, isLoading, formData, files, serverPaths, coverPreviewUrl,
        isPublishable, hasChanges,
        handleInputChange, handleSingleFileChange, handleMultipleFilesChange,
        handleUpdateFileName, handleUpdateServerPhotoName, handleUpdateServerModelName, handleUpdateVideoName,
        handleRemoveFile, handleRemoveServerModel, handleRemoveVideo, handleRemoveCover, handleRemovePdf, handleRemoveServerPhoto,
        handleSave,
    };
}