import {useState, useEffect} from 'preact/hooks';
import {Category, type RestorationData, Visibility} from "../../types/Document.ts";
import {
    createDocumentMetadata, deleteCover, deletePdf,
    fetchDocumentById, syncModels3d, syncProjectPhotos, syncVideo,
    updateDocumentMetadata, uploadCover, uploadModels3d, uploadPdf, uploadProjectPhotos, uploadVideo
} from "../../api/feature/DocumentApi.ts";
import type {UserProfile} from "../../types/UserProfile.ts";

export interface NamedFile {
    file: File;
    name: string;
    previewUrl: string;
}

export interface ServerNamedFile {
    path: string;
    name: string;
}

export const REQUIRED_RESTORATION_DATA_FIELDS: Array<keyof RestorationData> = [
    'category', 'inventoryNumber', 'name', 'author', 'date',
];

export const INITIAL_DATA: RestorationData = {
    category: Category.UNSPECIFIED, inventoryNumber: '', name: '', author: '', date: '',
    material: '', technique: '', keywords: '', location: '', storage: '', typeOfAnalysis: [], works: [],
    pigment: '', binder: '', finishingLayer: ''
};

export function useDocumentForm() {
    // 1. RESTORATION DATA (The actual content)
    const [restorationData, setRestorationData] = useState<RestorationData>(INITIAL_DATA);
    const [snapshot, setSnapshot] = useState<RestorationData>(INITIAL_DATA);

    // 2. METADATA (The project settings)
    const [isPublished, setIsPublished] = useState(false);
    const [visibility, setVisibility] = useState<Visibility>(Visibility.OKIRU);
    const [initialVisibility, setInitialVisibility] = useState<Visibility>(Visibility.OKIRU);
    const [coAuthors, setCoAuthors] = useState<UserProfile[]>([]);
    const [initialCoAuthors, setInitialCoAuthors] = useState<UserProfile[]>([]);

    const initializeForm = (document: any) => {
        setRestorationData(document.content);
        setSnapshot(document.content);

        setIsPublished(document.isPublished);
        setVisibility(document.visibility || Visibility.OKIRU);
        setInitialVisibility(document.visibility || Visibility.OKIRU);

        const fetchedAuthors = document.coCreatorProfiles || [];
        setCoAuthors(fetchedAuthors);
        setInitialCoAuthors(fetchedAuthors);
    };

    const handleRestorationDataChange = (e: Event) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        setRestorationData((prev: any) => ({...prev, [target.name]: target.value}));
    };

    const handleAddCoAuthor = (author: UserProfile) => setCoAuthors(prev => [...prev, author]);
    const handleRemoveCoAuthor = (email: string) => setCoAuthors(prev => prev.filter(a => a.email !== email));

    const hasRestorationDataChanges = JSON.stringify(restorationData) !== JSON.stringify(snapshot);
    const hasVisibilityChange = visibility !== initialVisibility;
    const hasCoAuthorsChanges = JSON.stringify(coAuthors) !== JSON.stringify(initialCoAuthors);
    const hasChanges = hasRestorationDataChanges || hasVisibilityChange || hasCoAuthorsChanges;

    return {
        // Domain 1: Restoration Data
        restorationData,
        handleRestorationDataChange,

        // Domain 2: Metadata
        metadata: {
            isPublished,
            visibility,
            coAuthors,
            setVisibility,
            setIsPublished,
            handleAddCoAuthor,
            handleRemoveCoAuthor
        },

        // Orchestration
        initializeForm,
        hasChanges
    };
}

export function useDocumentFiles() {
    const [files, setFiles] = useState<{
        cover: File | null;
        pdf: File | null;
        video: NamedFile | null;
        projectPhotos: NamedFile[];
        models3d: NamedFile[];
    }>({cover: null, pdf: null, video: null, projectPhotos: [], models3d: []});
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
    const [serverPaths, setServerPaths] = useState<{
        cover: string;
        pdf: string;
        video: ServerNamedFile | null;
        projectPhotos: ServerNamedFile[];
        models3d: ServerNamedFile[];
    }>({cover: '', pdf: '', video: null, projectPhotos: [], models3d: []});
    const [initialServerState, setInitialServerState] = useState<{
        cover: string;
        pdf: string;
        photos: ServerNamedFile[];
        models: ServerNamedFile[];
        video: ServerNamedFile | null;
    }>({cover: '', pdf: '', photos: [], models: [], video: null});

    const initializeFiles = (document: any) => {
        const fetchedPhotos = document.projectPhotos || [];
        const fetchedModels = document.models3d || [];
        const fetchedVideo = document.video || null;
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
    };

    const resetLocalFiles = () => {
        setFiles({cover: null, pdf: null, video: null, projectPhotos: [], models3d: []});
        setCoverPreviewUrl(null);
    };

    const handleSingleFileChange = (type: 'cover' | 'pdf' | 'video') => (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            const selectedFile = target.files[0];
            if (type === 'cover') {
                setFiles(prev => ({...prev, cover: selectedFile}));
                setCoverPreviewUrl(URL.createObjectURL(selectedFile));
            } else if (type === 'pdf') {
                setFiles(prev => ({...prev, pdf: selectedFile}));
            } else if (type === 'video') {
                setFiles(prev => ({
                    ...prev,
                    video: {
                        file: selectedFile,
                        name: selectedFile.name.split('.')[0],
                        previewUrl: URL.createObjectURL(selectedFile)
                    }
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
            setFiles(prev => ({...prev, [type]: [...prev[type], ...newFiles]}));
        }
        target.value = '';
    };

    const handleUpdateFileName = (type: 'projectPhotos' | 'models3d', index: number, newName: string) => setFiles(prev => {
        const updated = [...prev[type]];
        updated[index].name = newName;
        return {...prev, [type]: updated};
    });
    const handleUpdateServerPhotoName = (index: number, newName: string) => setServerPaths(prev => {
        const updated = [...prev.projectPhotos];
        updated[index].name = newName;
        return {...prev, projectPhotos: updated};
    });
    const handleUpdateServerModelName = (index: number, newName: string) => setServerPaths(prev => {
        const updated = [...prev.models3d];
        updated[index].name = newName;
        return {...prev, models3d: updated};
    });
    const handleUpdateVideoName = (newName: string, isServer: boolean) => {
        if (isServer && serverPaths.video) setServerPaths(prev => ({
            ...prev,
            video: {...prev.video!, name: newName}
        })); else if (!isServer && files.video) setFiles(prev => ({...prev, video: {...prev.video!, name: newName}}));
    };

    const handleRemoveCover = () => {
        setFiles(prev => ({...prev, cover: null}));
        setCoverPreviewUrl(null);
        setServerPaths(prev => ({...prev, cover: ''}));
    };
    const handleRemovePdf = () => {
        setFiles(prev => ({...prev, pdf: null}));
        setServerPaths(prev => ({...prev, pdf: ''}));
    };
    const handleRemoveFile = (type: 'projectPhotos' | 'models3d', index: number) => setFiles(prev => {
        const updated = [...prev[type]];
        if (updated[index].previewUrl) URL.revokeObjectURL(updated[index].previewUrl);
        updated.splice(index, 1);
        return {...prev, [type]: updated};
    });
    const handleRemoveServerPhoto = (index: number) => setServerPaths(prev => {
        const updated = [...prev.projectPhotos];
        updated.splice(index, 1);
        return {...prev, projectPhotos: updated};
    });
    const handleRemoveServerModel = (index: number) => setServerPaths(prev => {
        const updated = [...prev.models3d];
        updated.splice(index, 1);
        return {...prev, models3d: updated};
    });
    const handleRemoveVideo = (isServer: boolean) => {
        if (isServer) {
            setServerPaths(prev => ({...prev, video: null}));
        } else {
            if (files.video?.previewUrl) URL.revokeObjectURL(files.video.previewUrl);
            setFiles(prev => ({...prev, video: null}));
        }
    };

    const hasServerPhotoChanges = JSON.stringify(serverPaths.projectPhotos) !== JSON.stringify(initialServerState.photos);
    const hasServerModelChanges = JSON.stringify(serverPaths.models3d) !== JSON.stringify(initialServerState.models);
    const hasServerVideoChanges = JSON.stringify(serverPaths.video) !== JSON.stringify(initialServerState.video);
    const hasServerCoverChanges = serverPaths.cover !== initialServerState.cover;
    const hasServerPdfChanges = serverPaths.pdf !== initialServerState.pdf;
    const hasLocalFileChanges = files.cover !== null || files.pdf !== null || files.video !== null || files.projectPhotos.length > 0 || files.models3d.length > 0;
    const hasAnyFileChanges = hasServerPhotoChanges || hasServerModelChanges || hasServerVideoChanges || hasServerCoverChanges || hasServerPdfChanges || hasLocalFileChanges;

    return {
        files, serverPaths, initialServerState, coverPreviewUrl,
        handleSingleFileChange, handleMultipleFilesChange, handleUpdateFileName, handleUpdateServerPhotoName,
        handleUpdateServerModelName, handleUpdateVideoName, handleRemoveFile, handleRemoveServerModel,
        handleRemoveVideo, handleRemoveCover, handleRemovePdf, handleRemoveServerPhoto,
        initializeFiles, resetLocalFiles, hasAnyFileChanges,
        hasServerPhotoChanges, hasServerModelChanges, hasServerVideoChanges, hasServerCoverChanges, hasServerPdfChanges
    };
}

export function useDocumentEditor(id?: string) {
    const [documentId, setDocumentId] = useState<string | null>(id || null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(!!id);

    // Mount sub-hooks
    const formManager = useDocumentForm();
    const fileManager = useDocumentFiles();

    useEffect(() => {
        if (id) loadExistingDocument(id);
    }, [id]);

    const loadExistingDocument = async (docId: string) => {
        setIsLoading(true);
        try {
            const document = await fetchDocumentById(docId);
            formManager.initializeForm(document);
            fileManager.initializeFiles(document);
        } catch (error) {
            console.error("Failed to load document", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Validation
    const isFormFilled = REQUIRED_RESTORATION_DATA_FIELDS.every(field => {
        const val = formManager.restorationData[field];
        return typeof val === 'string' ? val.trim() !== '' : val !== Category.UNSPECIFIED;
    });

    const isPublishable = isFormFilled && (fileManager.files.pdf !== null || fileManager.serverPaths.pdf !== '');
    const hasChanges = formManager.hasChanges || fileManager.hasAnyFileChanges;

    const handleSave = async (publish: boolean) => {
        setIsSaving(true);
        const failedTasks: string[] = [];
        let currentDocId = documentId;

        const safeTask = (promise: Promise<any>, taskName: string) => {
            return promise.catch((err) => {
                console.error(`Task failed: ${taskName}`, err);
                failedTasks.push(taskName);
            });
        };

        try {
            // Unpack the cleanly separated states into the payload
            const metadataPayload = {
                content: formManager.restorationData,
                isPublished: publish,
                visibility: formManager.metadata.visibility,
                coCreatorEmails: formManager.metadata.coAuthors.map(a => a.email)
            };

            if (!currentDocId) {
                const newDoc = await createDocumentMetadata(metadataPayload);
                currentDocId = newDoc.id;
                setDocumentId(currentDocId);
                window.history.replaceState(null, '', `/uredi/${currentDocId}`);
            } else {
                await updateDocumentMetadata(currentDocId, metadataPayload);
            }

            if (!currentDocId) throw new Error("Neuspješno dohvaćanje ID-a dokumenta.");

            // CONCURRENT FILES
            const fileTasks: Promise<void>[] = [];

            if (fileManager.files.cover) {
                fileTasks.push(safeTask(uploadCover(currentDocId, fileManager.files.cover), "Spremanje naslovne fotografije"));
            } else if (fileManager.hasServerCoverChanges && !fileManager.serverPaths.cover) {
                fileTasks.push(safeTask(deleteCover(currentDocId), "Brisanje naslovne fotografije"));
            }

            if (fileManager.files.pdf) {
                fileTasks.push(safeTask(uploadPdf(currentDocId, fileManager.files.pdf), "Spremanje PDF dokumenta"));
            } else if (fileManager.hasServerPdfChanges && !fileManager.serverPaths.pdf) {
                fileTasks.push(safeTask(deletePdf(currentDocId), "Brisanje PDF dokumenta"));
            }

            if (fileManager.files.video) {
                fileTasks.push(safeTask(uploadVideo(currentDocId, fileManager.files.video.file, fileManager.files.video.name), "Spremanje videa"));
            } else if (!fileManager.serverPaths.video && fileManager.initialServerState.video) {
                fileTasks.push(safeTask(syncVideo(currentDocId, null), "Brisanje videa"));
            } else if (fileManager.serverPaths.video && fileManager.hasServerVideoChanges) {
                fileTasks.push(safeTask(syncVideo(currentDocId, fileManager.serverPaths.video), "Preimenovanje videa"));
            }

            if (fileManager.hasServerPhotoChanges) {
                fileTasks.push(safeTask(syncProjectPhotos(currentDocId, fileManager.serverPaths.projectPhotos), "Ažuriranje postojećih fotografija"));
            }
            if (fileManager.files.projectPhotos.length > 0) {
                fileTasks.push(safeTask(uploadProjectPhotos(currentDocId, fileManager.files.projectPhotos.map(p => p.file), fileManager.files.projectPhotos.map(p => p.name)), "Prijenos novih fotografija"));
            }

            if (fileManager.hasServerModelChanges) {
                fileTasks.push(safeTask(syncModels3d(currentDocId, fileManager.serverPaths.models3d), "Ažuriranje postojećih 3D modela"));
            }
            if (fileManager.files.models3d.length > 0) {
                fileTasks.push(safeTask(uploadModels3d(currentDocId, fileManager.files.models3d.map(m => m.file), fileManager.files.models3d.map(m => m.name)), "Prijenos novih 3D modela"));
            }

            if (fileTasks.length > 0) await Promise.all(fileTasks);

            if (failedTasks.length > 0) {
                alert(`Spremljeno s greškama. Sljedeće operacije nisu uspjele:\n\n- ${failedTasks.join('\n- ')}\n\nMolimo pokušajte ponovno dodati ove datoteke.`);
                formManager.metadata.setIsPublished(publish);
            } else {
                formManager.metadata.setIsPublished(publish);
                if (publish) {
                    window.location.href = '/racun';
                    return;
                }
            }
        } catch (error) {
            console.error("Critical metadata save failure:", error);
            alert("Dogodila se greška prilikom spremanja projekta. Provjerite internetsku vezu i pokušajte ponovno.");
            setIsSaving(false);
            return;
        }

        try {
            if (currentDocId) {
                await loadExistingDocument(currentDocId);
                fileManager.resetLocalFiles();
            }
        } catch (resyncError) {
            console.error("Failed to resync state after save", resyncError);
        } finally {
            setIsSaving(false);
        }
    };

    return {
        documentId,
        isSaving,
        isLoading,
        isPublishable,
        hasChanges,
        handleSave,

        // Expose the perfectly separated namespaces to the UI
        restorationData: formManager.restorationData,
        handleRestorationDataChange: formManager.handleRestorationDataChange,
        metadata: formManager.metadata,
        fileManager
    };
}