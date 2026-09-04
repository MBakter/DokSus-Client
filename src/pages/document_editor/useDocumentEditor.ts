import {useEffect, useState} from 'preact/hooks';
import {type NamedFile, type RestorationData, type ServerNamedFile, Visibility} from "../../data/types/Document.ts";
import {
    createDocumentMetadata,
    deleteCover,
    deletePdf,
    fetchDocumentById,
    syncAdditionalPdfs,
    syncModels3d,
    syncProjectPhotos,
    syncVideo,
    updateDocumentMetadata,
    uploadAdditionalPdfs,
    uploadCover,
    uploadModels3d,
    uploadPdf,
    uploadProjectPhotos,
    uploadVideo
} from "../../api/feature/DocumentApi.ts";
import type {UserProfile} from "../../data/types/UserProfile.ts";

export const INITIAL_DATA: RestorationData = {
    category: 'UNSPECIFIED',
    inventoryNumber: '',
    name: '',
    group: '',
    author: '',
    date: '',
    material: '',
    technique: '',
    keywords: '',
    location: '',
    storage: '',
    typeOfAnalysis: [],
    works: [],
    pigment: '',
    binder: '',
    finishingLayer: ''
};

// @ts-ignore
export enum SingleFileType {
    COVER = 'cover',
    PDF = 'pdf',
    VIDEO = 'video'
}

// @ts-ignore
export enum MultiFileType {
    PROJECT_PHOTOS = 'projectPhotos',
    MODELS_3D = 'models3d',
    ADDITIONAL_PDFS = 'additionalPdfs'
}

export function useDocumentForm() {
    const [restorationData, setRestorationData] = useState<RestorationData>(INITIAL_DATA);
    const [snapshot, setSnapshot] = useState<RestorationData>(INITIAL_DATA);

    const updateField = <K extends keyof RestorationData>(
        field: K,
        value: RestorationData[K] | ((prev: RestorationData[K]) => RestorationData[K])
    ) => {
        setRestorationData(prev => {
            const nextValue = typeof value === 'function' ? (value as Function)(prev[field]) : value;
            return {...prev, [field]: nextValue};
        });
    };

    const [isPublished, setIsPublished] = useState(false);
    const [visibility, setVisibility] = useState<Visibility>(Visibility.OKIRU);
    const [initialVisibility, setInitialVisibility] = useState<Visibility>(Visibility.OKIRU);

    // Co-creators (Students)
    const [coCreators, setCoCreators] = useState<UserProfile[]>([]);
    const [initialCoCreators, setInitialCoCreators] = useState<UserProfile[]>([]);

    // Mentors (Professors)
    const [mentors, setMentors] = useState<UserProfile[]>([]);
    const [initialMentors, setInitialMentors] = useState<UserProfile[]>([]);

    const initializeForm = (document: any) => {
        setRestorationData(document.restorationData);
        setSnapshot(document.restorationData);

        setIsPublished(document.isPublished);
        setVisibility(document.visibility || Visibility.OKIRU);
        setInitialVisibility(document.visibility || Visibility.OKIRU);

        const fetchedCoCreators = document.profiles?.coCreatorProfiles || [];
        setCoCreators(fetchedCoCreators);
        setInitialCoCreators(fetchedCoCreators);

        const fetchedMentors = document.profiles?.mentorProfiles || [];
        setMentors(fetchedMentors);
        setInitialMentors(fetchedMentors);
    };

    const handleAddCoCreator = (user: UserProfile) => setCoCreators(prev => [...prev, user]);
    const handleRemoveCoCreator = (email: string) => setCoCreators(prev => prev.filter(a => a.email !== email));

    const handleAddMentor = (user: UserProfile) => setMentors(prev => [...prev, user]);
    const handleRemoveMentor = (email: string) => setMentors(prev => prev.filter(a => a.email !== email));

    const hasRestorationDataChanges = JSON.stringify(restorationData) !== JSON.stringify(snapshot);
    const hasVisibilityChange = visibility !== initialVisibility;
    const hasCoCreatorsChanges = JSON.stringify(coCreators) !== JSON.stringify(initialCoCreators);
    const hasMentorsChanges = JSON.stringify(mentors) !== JSON.stringify(initialMentors);

    const hasChanges = hasRestorationDataChanges || hasVisibilityChange || hasCoCreatorsChanges || hasMentorsChanges;

    return {
        restorationData,
        updateField,
        metadata: {
            isPublished,
            visibility,
            coCreators,
            mentors,
            setVisibility,
            setIsPublished,
            handleAddCoCreator,
            handleRemoveCoCreator,
            handleAddMentor,
            handleRemoveMentor
        },
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
        additionalPdfs: NamedFile[];
    }>({cover: null, pdf: null, video: null, projectPhotos: [], models3d: [], additionalPdfs: []});

    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

    const [serverPaths, setServerPaths] = useState<{
        cover: string;
        pdf: string;
        video: ServerNamedFile | null;
        projectPhotos: ServerNamedFile[];
        models3d: ServerNamedFile[];
        additionalPdfs: ServerNamedFile[];
    }>({cover: '', pdf: '', video: null, projectPhotos: [], models3d: [], additionalPdfs: []});

    const [initialServerState, setInitialServerState] = useState<{
        cover: string;
        pdf: string;
        photos: ServerNamedFile[];
        models: ServerNamedFile[];
        video: ServerNamedFile | null;
        additionalPdfs: ServerNamedFile[];
    }>({cover: '', pdf: '', photos: [], models: [], video: null, additionalPdfs: []});

    const initializeFiles = (document: any) => {
        // Fallback to empty object if document.files is missing (e.g., old data)
        const filesData = document.files || {};

        const fetchedPhotos = filesData.projectPhotos || [];
        const fetchedModels = filesData.models3d || [];
        const fetchedAdditionalPdfs = filesData.additionalPdfs || [];
        const fetchedVideo = filesData.video || null;

        setServerPaths({
            cover: filesData.coverPath || '',
            pdf: filesData.pdfPath || '',
            video: fetchedVideo,
            projectPhotos: fetchedPhotos,
            models3d: fetchedModels,
            additionalPdfs: fetchedAdditionalPdfs
        });

        setInitialServerState({
            cover: filesData.coverPath || '',
            pdf: filesData.pdfPath || '',
            photos: JSON.parse(JSON.stringify(fetchedPhotos)),
            models: JSON.parse(JSON.stringify(fetchedModels)),
            video: fetchedVideo ? JSON.parse(JSON.stringify(fetchedVideo)) : null,
            additionalPdfs: JSON.parse(JSON.stringify(fetchedAdditionalPdfs))
        });
    };

    const resetLocalFiles = () => {
        setFiles({cover: null, pdf: null, video: null, projectPhotos: [], models3d: [], additionalPdfs: []});
        setCoverPreviewUrl(null);
    };

    const handleSingleFileChange = (type: SingleFileType) => (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            const selectedFile = target.files[0];
            if (type === SingleFileType.COVER) {
                setFiles(prev => ({...prev, cover: selectedFile}));
                setCoverPreviewUrl(URL.createObjectURL(selectedFile));
            } else if (type === SingleFileType.PDF) {
                setFiles(prev => ({...prev, pdf: selectedFile}));
            } else if (type === SingleFileType.VIDEO) {
                setFiles(prev => ({
                    ...prev,
                    video: {
                        file: selectedFile,
                        name: selectedFile.name.split('.')[0],
                        previewUrl: URL.createObjectURL(selectedFile)
                    } as NamedFile
                }));
            }
        }
    };

    const handleMultipleFilesChange = (type: MultiFileType) => (e: Event) => {
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

    const handleUpdateFileName = (type: MultiFileType, index: number, newName: string) => setFiles(prev => {
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

    const handleUpdateServerAdditionalPdfName = (index: number, newName: string) => setServerPaths(prev => {
        const updated = [...prev.additionalPdfs];
        updated[index].name = newName;
        return {...prev, additionalPdfs: updated};
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

    const handleRemoveFile = (type: MultiFileType, index: number) => setFiles(prev => {
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

    const handleRemoveServerAdditionalPdf = (index: number) => setServerPaths(prev => {
        const updated = [...prev.additionalPdfs];
        updated.splice(index, 1);
        return {...prev, additionalPdfs: updated};
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
    const hasServerAdditionalPdfChanges = JSON.stringify(serverPaths.additionalPdfs) !== JSON.stringify(initialServerState.additionalPdfs);
    const hasServerCoverChanges = serverPaths.cover !== initialServerState.cover;
    const hasServerPdfChanges = serverPaths.pdf !== initialServerState.pdf;
    const hasLocalFileChanges = files.cover !== null || files.pdf !== null || files.video !== null || files.projectPhotos.length > 0 || files.models3d.length > 0 || files.additionalPdfs.length > 0;
    const hasAnyFileChanges = hasServerPhotoChanges || hasServerModelChanges || hasServerVideoChanges || hasServerAdditionalPdfChanges || hasServerCoverChanges || hasServerPdfChanges || hasLocalFileChanges;

    return {
        files,
        serverPaths,
        initialServerState,
        coverPreviewUrl,
        handleSingleFileChange,
        handleMultipleFilesChange,
        handleUpdateFileName,
        handleUpdateServerPhotoName,
        handleUpdateServerModelName,
        handleUpdateServerAdditionalPdfName,
        handleUpdateVideoName,
        handleRemoveFile,
        handleRemoveServerModel,
        handleRemoveServerAdditionalPdf,
        handleRemoveVideo,
        handleRemoveCover,
        handleRemovePdf,
        handleRemoveServerPhoto,
        initializeFiles,
        resetLocalFiles,
        hasAnyFileChanges,
        hasServerAdditionalPdfChanges,
        hasServerPhotoChanges,
        hasServerModelChanges,
        hasServerVideoChanges,
        hasServerCoverChanges,
        hasServerPdfChanges,
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

    const GLOBAL_REQUIRED_FIELDS: (keyof RestorationData)[] = [
        'category',
        'name',
        'keywords'
    ];

    const CONDITIONAL_REQUIRED_FIELDS: (keyof RestorationData)[] = [
        'inventoryNumber',
        'author',
        'date',
        'material',
        'technique',
        'storage'
    ];

    const EXEMPT_CATEGORIES = [
        'ISTRAZIVACKI_RADOVI_I_REFERENTNI_MATERIJALI',
        'DIPLOMSKI_I_SEMINARSKI_RADOVI',
        'UNSPECIFIED'
    ];

    const checkIsFieldRequired = (fieldName: keyof RestorationData): boolean => {
        if (GLOBAL_REQUIRED_FIELDS.includes(fieldName)) return true;

        if (CONDITIONAL_REQUIRED_FIELDS.includes(fieldName)) {
            const selectedCategory = formManager.restorationData.category;

            // If no category is selected, or it is in the exempt list, the field is NOT required
            if (!selectedCategory || EXEMPT_CATEGORIES.includes(selectedCategory)) {
                return false;
            }

            // For all other categories, the fields ARE required
            return true;
        }

        return false;
    };

    // Execution: single clean check for all required fields
    const areRestorationFieldsFilled = [...GLOBAL_REQUIRED_FIELDS, ...CONDITIONAL_REQUIRED_FIELDS].every(field => {
        // Skip checking if the field isn't required for this specific category
        if (!checkIsFieldRequired(field)) return true;

        const val = formManager.restorationData[field] as unknown;

        if (field === 'keywords') {
            const keywordsString = val as string || '';
            const keywordsCount = keywordsString.split(',').map(k => k.trim()).filter(Boolean).length;
            return keywordsCount >= 3;
        }

        // Failsafe for empty values
        if (val === undefined || val === null || typeof val !== 'string') return false;

        if (field === 'category') {
            return val !== 'UNSPECIFIED' && val.trim() !== '';
        }

        return val.trim() !== '';
    });

    // Mentors are unconditionally required (at least one must be selected)
    const hasAtLeastOneMentor = formManager.metadata.mentors.length > 0;

    // Combined form validation
    const isFormFilled = areRestorationFieldsFilled && hasAtLeastOneMentor;

    // Check for PDF in either newly uploaded files or existing server paths
    const hasPdf = Boolean(fileManager.files.pdf) || Boolean(fileManager.serverPaths.pdf?.trim());
    const hasCoverPhoto = Boolean(fileManager.files.cover) || Boolean(fileManager.serverPaths.cover?.trim());

    const isPublishable = isFormFilled && hasPdf && hasCoverPhoto;
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
                coCreatorEmails: formManager.metadata.coCreators.map(a => a.email),
                mentorEmails: formManager.metadata.mentors.map(m => m.email)
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

            if (fileManager.hasServerAdditionalPdfChanges) {
                fileTasks.push(safeTask(
                    syncAdditionalPdfs(currentDocId, fileManager.serverPaths.additionalPdfs),
                    "Ažuriranje postojećih dodatnih PDF-ova"
                ));
            }
            if (fileManager.files.additionalPdfs.length > 0) {
                fileTasks.push(safeTask(
                    uploadAdditionalPdfs(
                        currentDocId,
                        fileManager.files.additionalPdfs.map(p => p.file),
                        fileManager.files.additionalPdfs.map(p => p.name)
                    ),
                    "Prijenos novih dodatnih PDF-ova"
                ));
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
        handleRestorationDataChange: formManager.updateField,
        metadata: formManager.metadata,
        fileManager,

        checkIsFieldRequired
    };
}