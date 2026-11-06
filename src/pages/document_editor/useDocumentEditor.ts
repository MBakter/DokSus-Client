import {useEffect, useRef, useState} from 'preact/hooks';
import {type NamedFile, type RestorationData, type ServerNamedFile, Visibility} from "../../data/types/Document.ts";
import {copyFile, type FileKind, invalidFilesMessage, isAllowedFile} from "./fileTypes.ts";
import {
    createDocumentMetadata,
    deleteCover,
    deleteDocument,
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

const SINGLE_FILE_KIND: Record<SingleFileType, FileKind> = {
    [SingleFileType.COVER]: 'image',
    [SingleFileType.PDF]: 'pdf',
    [SingleFileType.VIDEO]: 'video'
};

const MULTI_FILE_KIND: Record<MultiFileType, FileKind> = {
    [MultiFileType.PROJECT_PHOTOS]: 'image',
    [MultiFileType.MODELS_3D]: 'model',
    [MultiFileType.ADDITIONAL_PDFS]: 'pdf'
};

type LocalFiles = {
    cover: File | null;
    pdf: File | null;
    video: NamedFile | null;
    projectPhotos: NamedFile[];
    models3d: NamedFile[];
    additionalPdfs: NamedFile[];
};

const emptyLocalFiles = (): LocalFiles => ({
    cover: null,
    pdf: null,
    video: null,
    projectPhotos: [],
    models3d: [],
    additionalPdfs: []
});

/**
 * State of the editor's form fields and metadata (visibility, co-creators, mentors).
 * Keeps a snapshot of the loaded values so it can tell whether anything changed.
 */
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

/**
 * State of the editor's attachments. Tracks two things separately:
 * `files` – newly picked files waiting to be uploaded, and
 * `serverPaths` – files already on the server (which the user may rename or remove).
 */
export function useDocumentFiles() {
    const [files, setFiles] = useState<LocalFiles>(emptyLocalFiles);

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
        setFiles(emptyLocalFiles());
        setCoverPreviewUrl(prev => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
    };

    // Bumped per field so a slow read of an earlier selection cannot overwrite a later one.
    const selectionVersion = useRef<Record<SingleFileType, number>>({
        [SingleFileType.COVER]: 0,
        [SingleFileType.PDF]: 0,
        [SingleFileType.VIDEO]: 0
    });

    const rememberFile = async (file: File, kind: FileKind, input: HTMLInputElement): Promise<File | null> => {
        if (!isAllowedFile(file, kind)) {
            alert(invalidFilesMessage([file.name], kind));
            input.value = '';
            return null;
        }
        try {
            const stored = await copyFile(file);
            input.value = '';
            return stored;
        } catch (error) {
            console.error("Failed to read selected file", error);
            alert(`Datoteku "${file.name}" nije moguće pročitati. Odaberite je ponovno.`);
            input.value = '';
            return null;
        }
    };

    const handleSingleFileChange = (type: SingleFileType) => async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const selectedFile = target.files?.[0];
        if (!selectedFile) return;

        const version = ++selectionVersion.current[type];
        const stored = await rememberFile(selectedFile, SINGLE_FILE_KIND[type], target);
        if (!stored || version !== selectionVersion.current[type]) return;

        if (type === SingleFileType.COVER) {
            setFiles(prev => ({...prev, cover: stored}));
            setCoverPreviewUrl(prev => {
                if (prev) URL.revokeObjectURL(prev);
                return URL.createObjectURL(stored);
            });
        } else if (type === SingleFileType.PDF) {
            setFiles(prev => ({...prev, pdf: stored}));
        } else if (type === SingleFileType.VIDEO) {
            setFiles(prev => {
                if (prev.video?.previewUrl) URL.revokeObjectURL(prev.video.previewUrl);
                return {
                    ...prev,
                    video: {
                        file: stored,
                        name: stored.name.split('.')[0],
                        previewUrl: URL.createObjectURL(stored)
                    }
                };
            });
        }
    };

    const handleMultipleFilesChange = (type: MultiFileType) => async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const selected = target.files ? Array.from(target.files) : [];
        if (selected.length === 0) return;

        const kind = MULTI_FILE_KIND[type];
        const rejected = selected.filter(file => !isAllowedFile(file, kind));
        const accepted = selected.filter(file => isAllowedFile(file, kind));
        if (rejected.length > 0) {
            alert(invalidFilesMessage(rejected.map(file => file.name), kind));
        }
        if (accepted.length === 0) {
            target.value = '';
            return;
        }

        let stored: File[];
        try {
            stored = await Promise.all(accepted.map(file => copyFile(file)));
        } catch (error) {
            console.error("Failed to read selected files", error);
            alert("Odabrane datoteke nije moguće pročitati. Odaberite ih ponovno.");
            target.value = '';
            return;
        }
        target.value = '';

        const newFiles: NamedFile[] = stored.map(file => ({
            file,
            name: file.name.split('.')[0],
            previewUrl: URL.createObjectURL(file)
        }));
        setFiles(prev => ({...prev, [type]: [...prev[type], ...newFiles]}));
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

    // Latest file state, including picks made while a save request is already running.
    const fileStateRef = useRef({
        files,
        serverPaths,
        initialServerState,
        hasServerPhotoChanges,
        hasServerModelChanges,
        hasServerVideoChanges,
        hasServerAdditionalPdfChanges,
        hasServerCoverChanges,
        hasServerPdfChanges
    });
    fileStateRef.current = {
        files,
        serverPaths,
        initialServerState,
        hasServerPhotoChanges,
        hasServerModelChanges,
        hasServerVideoChanges,
        hasServerAdditionalPdfChanges,
        hasServerCoverChanges,
        hasServerPdfChanges
    };

    /**
     * Drops local files that were uploaded. Files picked after that snapshot, and files whose
     * upload failed (`keep`), stay in the form so the next save can send them.
     */
    const discardUploadedFiles = (
        uploaded: LocalFiles,
        keep: { cover: boolean; pdf: boolean; video: boolean; projectPhotos: boolean; models3d: boolean; additionalPdfs: boolean }
    ) => {
        const dropPreview = (item: NamedFile) => {
            if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        };
        if (!keep.projectPhotos) uploaded.projectPhotos.forEach(dropPreview);
        if (!keep.models3d) uploaded.models3d.forEach(dropPreview);
        if (!keep.additionalPdfs) uploaded.additionalPdfs.forEach(dropPreview);

        setFiles(prev => {
            const clearCover = !keep.cover && uploaded.cover !== null && prev.cover === uploaded.cover;
            const clearPdf = !keep.pdf && uploaded.pdf !== null && prev.pdf === uploaded.pdf;
            const clearVideo = !keep.video && uploaded.video !== null && prev.video === uploaded.video;
            if (clearCover) {
                setCoverPreviewUrl(url => {
                    if (url) URL.revokeObjectURL(url);
                    return null;
                });
            }
            if (clearVideo && prev.video?.previewUrl) URL.revokeObjectURL(prev.video.previewUrl);
            return {
                cover: clearCover ? null : prev.cover,
                pdf: clearPdf ? null : prev.pdf,
                video: clearVideo ? null : prev.video,
                projectPhotos: keep.projectPhotos ? prev.projectPhotos : prev.projectPhotos.filter(photo => !uploaded.projectPhotos.includes(photo)),
                models3d: keep.models3d ? prev.models3d : prev.models3d.filter(model => !uploaded.models3d.includes(model)),
                additionalPdfs: keep.additionalPdfs ? prev.additionalPdfs : prev.additionalPdfs.filter(pdf => !uploaded.additionalPdfs.includes(pdf))
            };
        });
    };

    return {
        files,
        serverPaths,
        initialServerState,
        coverPreviewUrl,
        getFileSnapshot: () => fileStateRef.current,
        discardUploadedFiles,
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

/**
 * Main logic of the document editor. Combines the form and file state, loads an existing document,
 * validates required fields for publishing, and saves: first the form data (create or update),
 * then all file uploads/syncs in parallel.
 */
export function useDocumentEditor(id?: string) {
    const [documentId, setDocumentId] = useState<string | null>(id || null);
    const [isSaving, setIsSaving] = useState(false);
    const isSavingRef = useRef(false);
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
        if (isSavingRef.current) return;
        isSavingRef.current = true;
        setIsSaving(true);
        try {
        const failedTasks: string[] = [];
        let currentDocId = documentId;

        const safeTask = (promise: Promise<any>, taskName: string) => {
            return promise.catch((err) => {
                console.error(`Task failed: ${taskName}`, err);
                failedTasks.push(taskName);
            });
        };

        const task = {
            cover: "Spremanje naslovne fotografije",
            deleteCover: "Brisanje naslovne fotografije",
            pdf: "Spremanje PDF dokumenta",
            deletePdf: "Brisanje PDF dokumenta",
            additionalPdfs: "Prijenos novih dodatnih PDF-ova",
            syncAdditionalPdfs: "Ažuriranje postojećih dodatnih PDF-ova",
            video: "Spremanje videa",
            deleteVideo: "Brisanje videa",
            renameVideo: "Preimenovanje videa",
            photos: "Prijenos novih fotografija",
            syncPhotos: "Ažuriranje postojećih fotografija",
            models: "Prijenos novih 3D modela",
            syncModels: "Ažuriranje postojećih 3D modela"
        };

        let pendingFiles = emptyLocalFiles();

        try {
            // Publishing needs the cover and PDF to already be stored. When they are only
            // selected locally, save as a draft first and publish after the uploads succeed.
            const before = fileManager.getFileSnapshot();
            const coverAlreadyStored = Boolean(before.serverPaths.cover?.trim()) && !before.files.cover;
            const pdfAlreadyStored = Boolean(before.serverPaths.pdf?.trim()) && !before.files.pdf;
            const publishImmediately = publish && coverAlreadyStored && pdfAlreadyStored;
            const keepPublished = formManager.metadata.isPublished && publish;

            const metadataPayload = {
                content: formManager.restorationData,
                isPublished: publishImmediately || keepPublished,
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
            const docId = currentDocId;

            // Read again so files chosen while the metadata request was in flight are included.
            const pending = fileManager.getFileSnapshot();
            pendingFiles = pending.files;
            const stored = {
                cover: false,
                pdf: false,
                video: false,
                additionalPdfs: false,
                projectPhotos: false,
                models3d: false
            };

            const fileTasks: Array<() => Promise<unknown>> = [];

            if (pending.files.cover) {
                const cover = pending.files.cover;
                fileTasks.push(() => safeTask(uploadCover(docId, cover).then(() => {
                    stored.cover = true;
                }), task.cover));
            } else if (pending.hasServerCoverChanges && !pending.serverPaths.cover) {
                fileTasks.push(() => safeTask(deleteCover(docId), task.deleteCover));
            }

            if (pending.files.pdf) {
                const pdf = pending.files.pdf;
                fileTasks.push(() => safeTask(uploadPdf(docId, pdf).then(() => {
                    stored.pdf = true;
                }), task.pdf));
            } else if (pending.hasServerPdfChanges && !pending.serverPaths.pdf) {
                fileTasks.push(() => safeTask(deletePdf(docId), task.deletePdf));
            }

            if (pending.hasServerAdditionalPdfChanges) {
                fileTasks.push(() => safeTask(
                    syncAdditionalPdfs(docId, pending.serverPaths.additionalPdfs),
                    task.syncAdditionalPdfs
                ));
            }
            if (pending.files.additionalPdfs.length > 0) {
                const additionalPdfs = pending.files.additionalPdfs;
                fileTasks.push(() => safeTask(uploadAdditionalPdfs(
                    docId,
                    additionalPdfs.map(p => p.file),
                    additionalPdfs.map(p => p.name),
                    pending.serverPaths.additionalPdfs.map(pdf => pdf.path)
                ).then(() => {
                    stored.additionalPdfs = true;
                }), task.additionalPdfs));
            }

            if (pending.files.video) {
                const video = pending.files.video;
                fileTasks.push(() => safeTask(uploadVideo(docId, video.file, video.name).then(() => {
                    stored.video = true;
                }), task.video));
            } else if (!pending.serverPaths.video && pending.initialServerState.video) {
                fileTasks.push(() => safeTask(syncVideo(docId, null), task.deleteVideo));
            } else if (pending.serverPaths.video && pending.hasServerVideoChanges) {
                fileTasks.push(() => safeTask(syncVideo(docId, pending.serverPaths.video), task.renameVideo));
            }

            if (pending.hasServerPhotoChanges) {
                fileTasks.push(() => safeTask(syncProjectPhotos(docId, pending.serverPaths.projectPhotos), task.syncPhotos));
            }
            if (pending.files.projectPhotos.length > 0) {
                const projectPhotos = pending.files.projectPhotos;
                fileTasks.push(() => safeTask(uploadProjectPhotos(
                    docId,
                    projectPhotos.map(p => p.file),
                    projectPhotos.map(p => p.name),
                    pending.serverPaths.projectPhotos.map(photo => photo.path)
                ).then(() => {
                    stored.projectPhotos = true;
                }), task.photos));
            }

            if (pending.hasServerModelChanges) {
                fileTasks.push(() => safeTask(syncModels3d(docId, pending.serverPaths.models3d), task.syncModels));
            }
            if (pending.files.models3d.length > 0) {
                const models3d = pending.files.models3d;
                fileTasks.push(() => safeTask(uploadModels3d(
                    docId,
                    models3d.map(m => m.file),
                    models3d.map(m => m.name),
                    pending.serverPaths.models3d.map(model => model.path)
                ).then(() => {
                    stored.models3d = true;
                }), task.models));
            }

            // One after another. Each call updates only its own file field, but a later sync still
            // needs to see files uploaded before it, so they must not run at the same time.
            for (const fileTask of fileTasks) await fileTask();

            fileManager.discardUploadedFiles(pendingFiles, {
                cover: Boolean(pendingFiles.cover) && !stored.cover,
                pdf: Boolean(pendingFiles.pdf) && !stored.pdf,
                video: Boolean(pendingFiles.video) && !stored.video,
                additionalPdfs: pendingFiles.additionalPdfs.length > 0 && !stored.additionalPdfs,
                projectPhotos: pendingFiles.projectPhotos.length > 0 && !stored.projectPhotos,
                models3d: pendingFiles.models3d.length > 0 && !stored.models3d
            });

            const requiredFileFailed = failedTasks.includes(task.cover) ||
                failedTasks.includes(task.pdf) ||
                failedTasks.includes(task.deleteCover) ||
                failedTasks.includes(task.deletePdf);

            // Drafts become published only after the required files are actually stored.
            if (publish && !publishImmediately && !requiredFileFailed) {
                await updateDocumentMetadata(docId, {...metadataPayload, isPublished: true});
            }

            const isPublishedNow = (publish && !requiredFileFailed) || (keepPublished && requiredFileFailed);
            formManager.metadata.setIsPublished(isPublishedNow);

            if (failedTasks.length > 0) {
                alert(`Spremljeno s greškama. Sljedeće operacije nisu uspjele:\n\n- ${failedTasks.join('\n- ')}\n\nTe datoteke su ostale u obrascu. Pritisnite spremanje ponovno.`);
            } else if (publish && isPublishedNow) {
                window.location.href = '/racun';
                return;
            }
        } catch (error) {
            console.error("Critical metadata save failure:", error);
            alert("Dogodila se greška prilikom spremanja projekta. Provjerite internetsku vezu i pokušajte ponovno.");
            return;
        }

        try {
            if (currentDocId) await loadExistingDocument(currentDocId);
        } catch (resyncError) {
            console.error("Failed to resync state after save", resyncError);
        }
        } finally {
            isSavingRef.current = false;
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!documentId) return;

        const isConfirmed = window.confirm(
            "Jeste li sigurni da želite obrisati ovu skicu? Ova akcija je nepovratna."
        );

        if (!isConfirmed) return;

        try {
            await deleteDocument(documentId);
            window.location.href = '/racun';
        } catch (error) {
            console.error("Failed to delete document", error);
            alert("Dogodila se greška prilikom brisanja nacrta.");
        }
    };

    return {
        documentId,
        isSaving,
        isLoading,
        isPublishable,
        hasChanges,
        handleSave,
        handleDelete,

        // Expose the perfectly separated namespaces to the UI
        restorationData: formManager.restorationData,
        handleRestorationDataChange: formManager.updateField,
        metadata: formManager.metadata,
        fileManager,

        checkIsFieldRequired
    };
}