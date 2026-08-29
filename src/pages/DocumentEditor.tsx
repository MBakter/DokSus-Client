import {useEffect, useState} from 'preact/hooks';
import type {DocumentContent} from "../types/Document.ts";
import {createDocument, fetchDocumentById, updateDocument} from "../api/feature/DocumentApi.ts";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import '@google/model-viewer';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': any;
        }
    }
}

const CATEGORIES = [
    "",
    "DRVENI PREDMETI", "SLIKE NA PLATNU", "ZIDNE SLIKE",
    "KAMENA I ARHITEKTONSKA PLASTIKA", "OSTALI MATERIJALI",
    "ISTRAŽIVAČKI RADOVI I REFERENTNI MATERIJALI", "DIPLOMSKI I SEMINARSKI RADOVI"
];

// Configuration array for required fields
const REQUIRED_METADATA_FIELDS: Array<keyof DocumentContent> = [
    'category', 'invNumber', 'name', 'author', 'date', 'student', 'professor'
];

const INITIAL_DATA: DocumentContent = {
    category: '', invNumber: '', name: '', author: '', date: '', student: '', professor: '',
    material: '', technique: '', pigment: '', binder: '', finishingLayer: '', materialsUsed: '',
    typeOfAnalysis: '', goalOfAnalysis: '', works: '', keywords: '', location: '', storage: ''
};

interface NamedFile {
    file: File;
    name: string;
    previewUrl: string;
}

interface ServerNamedFile {
    path: string;
    name: string;
}

interface DocumentEditorProps {
    id?: string; // Automatically injected by preact-router when URL is /uredi/:id
}

export function DocumentEditor({id}: DocumentEditorProps) {
    const [documentId, setDocumentId] = useState<string | null>(id || null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(!!id);

    // Gallery & Pagination State
    const [lightboxIndex, setLightboxIndex] = useState(-1);
    const [photoPage, setPhotoPage] = useState(0);
    const ITEMS_PER_PAGE = 3;

    const [formData, setFormData] = useState<DocumentContent>(INITIAL_DATA);
    const [snapshot, setSnapshot] = useState<DocumentContent>(INITIAL_DATA);

    const [files, setFiles] = useState<{
        cover: File | null;
        pdf: File | null;
        video: File | null;
        projectPhotos: NamedFile[];
        models3d: NamedFile[];
    }>({
        cover: null, pdf: null, video: null, projectPhotos: [], models3d: []
    });

    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

    const [serverPaths, setServerPaths] = useState<{
        cover: string;
        pdf: string;
        video: string;
        projectPhotos: ServerNamedFile[];
        models3d: ServerNamedFile[];
    }>({
        cover: '', pdf: '', video: '', projectPhotos: [], models3d: []
    });

    // Used strictly to detect if existing photo names were edited
    const [originalServerPhotos, setOriginalServerPhotos] = useState<ServerNamedFile[]>([]);

    // 3D Model Pagination State
    const [modelPage, setModelPage] = useState(0);

    // Helper: Rename existing server 3D models
    const handleUpdateServerModelName = (index: number, newName: string) => {
        setServerPaths(prev => {
            const updated = [...prev.models3d];
            updated[index].name = newName;
            return {...prev, models3d: updated};
        });
    };

    // Helper: Remove existing server 3D models
    const handleRemoveServerModel = (index: number) => {
        setServerPaths(prev => {
            const updated = [...prev.models3d];
            updated.splice(index, 1);
            return {...prev, models3d: updated};
        });
    };

    // Combine both server and local models into one unified array for the viewer
    const allModels = [
        ...serverPaths.models3d.map((m, i) => ({isServer: true, data: m, index: i})),
        ...files.models3d.map((m, i) => ({isServer: false, data: m as any, index: i}))
    ];
    const totalModels = allModels.length;
    const currentModel = allModels[modelPage];

    // Ensure pagination doesn't break if you delete the last model on the last page
    useEffect(() => {
        if (modelPage >= totalModels && totalModels > 0) {
            setModelPage(totalModels - 1);
        }
    }, [totalModels, modelPage]);

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

            setServerPaths({
                cover: document.coverPath || '',
                pdf: document.pdfPath || '',
                video: (document as any).videoPath || '',
                projectPhotos: fetchedPhotos,
                models3d: (document as any).models3d || []
            });

            // Store a deep copy to compare later for changes
            setOriginalServerPhotos(JSON.parse(JSON.stringify(fetchedPhotos)));
        } catch (error) {
            console.error("Failed to load document", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: Event) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        setFormData(prev => ({...prev, [target.name]: target.value}));
    };

    const handleSingleFileChange = (type: 'cover' | 'pdf' | 'video') => (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            const selectedFile = target.files[0];
            setFiles(prev => ({...prev, [type]: selectedFile}));
            if (type === 'cover') setCoverPreviewUrl(URL.createObjectURL(selectedFile));
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

    // Rename STAGED (newly uploaded) files
    const handleUpdateFileName = (type: 'projectPhotos' | 'models3d', index: number, newName: string) => {
        setFiles(prev => {
            const updated = [...prev[type]];
            updated[index].name = newName;
            return {...prev, [type]: updated};
        });
    };

    // Rename EXISTING (server) files
    const handleUpdateServerPhotoName = (index: number, newName: string) => {
        setServerPaths(prev => {
            const updated = [...prev.projectPhotos];
            updated[index].name = newName;
            return {...prev, projectPhotos: updated};
        });
    };

    const handleRemoveFile = (type: 'projectPhotos' | 'models3d', index: number) => {
        setFiles(prev => {
            const updated = [...prev[type]];
            if (updated[index].previewUrl) URL.revokeObjectURL(updated[index].previewUrl);
            updated.splice(index, 1);
            return {...prev, [type]: updated};
        });
    };

    const isFormFilled = REQUIRED_METADATA_FIELDS.every(field => formData[field].trim() !== '');
    const isPublishable = isFormFilled && (files.pdf !== null || serverPaths.pdf !== '');

    // Track all forms of changes
    const hasTextChanges = JSON.stringify(formData) !== JSON.stringify(snapshot);
    const hasServerPhotoChanges = JSON.stringify(serverPaths.projectPhotos) !== JSON.stringify(originalServerPhotos);
    const hasFileChanges = files.cover !== null || files.pdf !== null || files.video !== null ||
        files.projectPhotos.length > 0 || files.models3d.length > 0;

    const hasChanges = hasTextChanges || hasFileChanges || hasServerPhotoChanges;

    const handleSave = async (publish: boolean) => {
        setIsSaving(true);
        try {
            const payload = new FormData();
            payload.append("document", new Blob([JSON.stringify(formData)], {type: "application/json"}), "document.json");
            payload.append("isPublished", String(publish));

            // Send updated names of existing photos to the backend
            if (hasServerPhotoChanges) {
                payload.append("existingProjectPhotos", new Blob([JSON.stringify(serverPaths.projectPhotos)], {type: "application/json"}), "existingPhotos.json");
            }

            if (files.cover) payload.append("cover", files.cover);
            if (files.pdf) payload.append("pdf", files.pdf);
            if (files.video) payload.append("video", files.video);

            files.projectPhotos.forEach(item => {
                payload.append("projectPhotos", item.file);
                payload.append("projectPhotoNames", item.name);
            });

            files.models3d.forEach(item => {
                payload.append("models3d", item.file);
                payload.append("models3dNames", item.name);
            });

            if (documentId) {
                await updateDocument(documentId, payload);
            } else {
                const newDoc = await createDocument(payload);
                setDocumentId(newDoc.id);
            }

            if (publish) {
                window.location.href = '/racun';
            } else {
                if (documentId) loadExistingDocument(documentId);
                setFiles({cover: null, pdf: null, video: null, projectPhotos: [], models3d: []});
                setCoverPreviewUrl(null);
            }
        } catch (error) {
            console.error("Failed to save document:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const renderLabel = (label: string, fieldName: keyof DocumentContent) => (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {label} {REQUIRED_METADATA_FIELDS.includes(fieldName) && <span className="text-red-500 ml-1">*</span>}
        </label>
    );

    const getDownloadUrl = (path: string) => `/api/files?path=${encodeURIComponent(path)}`;

    if (isLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500 font-medium">Učitavanje dokumenta...</p>
            </div>
        );
    }

    const lightboxSlides = serverPaths.projectPhotos.map(photo => ({
        src: getDownloadUrl(photo.path),
        alt: photo.name,
    }));

    // Pagination Logic
    const totalPages = Math.ceil(serverPaths.projectPhotos.length / ITEMS_PER_PAGE);

    const isModelFormatSupported = (filename: string) => {
        const lowerCaseName = filename.toLowerCase();
        return lowerCaseName.endsWith('.glb') || lowerCaseName.endsWith('.gltf');
    };

    // Determine the filename based on whether it is an existing server file or a newly uploaded file
    const currentModelFilename = currentModel
        ? (currentModel.isServer ? currentModel.data.path : currentModel.data.file.name)
        : '';

    const isModelSupported = isModelFormatSupported(currentModelFilename);

    return (
        <div className="w-full flex flex-col items-center pb-16 bg-slate-50 min-h-screen relative">

            {serverPaths.projectPhotos.length > 0 && (
                <Lightbox
                    open={lightboxIndex >= 0}
                    close={() => setLightboxIndex(-1)}
                    index={lightboxIndex}
                    slides={lightboxSlides}
                    plugins={[Zoom]}
                />
            )}

            {/* STICKY Top Action Bar */}
            <div
                className="sticky top-0 z-50 w-full bg-white/75 backdrop-blur-md border-b border-slate-200 py-4 shadow-sm mb-6 px-6 md:px-12">
                <div className="w-full flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            {documentId ? 'Uređivanje dokumenta' : 'Novi dokument'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handleSave(false)}
                            disabled={isSaving || !hasChanges}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-700 text-white font-bold rounded-md hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Spremanje...' : 'Spremi skicu'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-5xl flex flex-col gap-6 px-4 lg:px-0">

                {/* Naslovna fotografija */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-4 border-b border-slate-100 pb-2">Naslovna
                        fotografija</h2>

                    <div
                        className="border-2 border-dashed border-slate-300 rounded-md p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors">

                        {/* If a new cover is staged, show its preview */}
                        {coverPreviewUrl ? (
                            <div className="mb-4 flex flex-col items-center">
                                <img src={coverPreviewUrl} alt="Nova naslovna"
                                     className="w-48 h-48 object-cover rounded-md border border-slate-300 shadow-sm"/>
                                <span
                                    className="text-xs text-blue-600 mt-3 font-medium">Odabrano za prijenos: {files.cover?.name}</span>
                            </div>
                        ) : serverPaths.cover ? (
                            /* If no new cover is staged, show the existing server cover */
                            <div className="mb-4 flex flex-col items-center">
                                <img src={getDownloadUrl(serverPaths.cover)} alt="Trenutna naslovna"
                                     className="w-48 h-48 object-cover rounded-md border border-slate-300 shadow-sm"/>
                                <span className="text-xs text-slate-500 mt-3">Trenutna slika na poslužitelju</span>
                            </div>
                        ) : (
                            /* Default placeholder if empty */
                            <>
                                <span className="text-4xl mb-3">📸</span>
                                <p className="text-sm text-slate-600 mb-4">Ova fotografija će predstavljati projekt u
                                    glavnom pretraživaču.</p>
                            </>
                        )}

                        <label
                            className="cursor-pointer bg-white border border-slate-300 text-slate-700 font-medium py-2 px-6 rounded-md hover:border-blue-500 transition-colors shadow-sm mt-2">
                            {serverPaths.cover || files.cover ? 'Promijeni sliku' : 'Odaberi sliku'}
                            <input type="file" accept="image/*" className="hidden"
                                   onChange={handleSingleFileChange('cover')}/>
                        </label>
                    </div>
                </section>

                {/* Section 1: Osnovni podaci */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Identifikacija i
                        opći podaci</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            {renderLabel("Kategorija", "category")}
                            <select name="category" value={formData.category} onChange={handleInputChange}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2">
                                {CATEGORIES.map(cat => <option key={cat}
                                                               value={cat}>{cat || "— Odaberite kategoriju —"}</option>)}
                            </select>
                        </div>
                        <div>{renderLabel("Broj OKIRU", "invNumber")}<input type="text" name="invNumber"
                                                                            value={formData.invNumber}
                                                                            onInput={handleInputChange}
                                                                            className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2"/>
                        </div>
                        <div>{renderLabel("Naslov / Naziv predmeta", "name")}<input type="text" name="name"
                                                                                    value={formData.name}
                                                                                    onInput={handleInputChange}
                                                                                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2"/>
                        </div>
                        <div>{renderLabel("Autor", "author")}<input type="text" name="author" value={formData.author}
                                                                    onInput={handleInputChange}
                                                                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2"/>
                        </div>
                        <div>{renderLabel("Datacija", "date")}<input type="text" name="date" value={formData.date}
                                                                     onInput={handleInputChange}
                                                                     className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2"/>
                        </div>
                        <div>{renderLabel("Student", "student")}<input type="text" name="student"
                                                                       value={formData.student}
                                                                       onInput={handleInputChange}
                                                                       className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2"/>
                        </div>
                        <div>{renderLabel("Profesor / Mentor", "professor")}<input type="text" name="professor"
                                                                                   value={formData.professor}
                                                                                   onInput={handleInputChange}
                                                                                   className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2"/>
                        </div>
                    </div>
                </section>

                {/* Section 2: Materijali i tehnika */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Tehnološki
                        podaci</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>{renderLabel("Osnovni materijal", "material")}<input type="text" name="material"
                                                                                  value={formData.material}
                                                                                  onInput={handleInputChange}
                                                                                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2"/>
                        </div>
                        <div>{renderLabel("Tehnika", "technique")}<input type="text" name="technique"
                                                                         value={formData.technique}
                                                                         onInput={handleInputChange}
                                                                         className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2"/>
                        </div>
                        <div>{renderLabel("Pigment", "pigment")}<input type="text" name="pigment"
                                                                       value={formData.pigment}
                                                                       onInput={handleInputChange}
                                                                       className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2"/>
                        </div>
                        <div>{renderLabel("Vezivo", "binder")}<input type="text" name="binder" value={formData.binder}
                                                                     onInput={handleInputChange}
                                                                     className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2"/>
                        </div>
                        <div>{renderLabel("Završni sloj", "finishingLayer")}<input type="text" name="finishingLayer"
                                                                                   value={formData.finishingLayer}
                                                                                   onInput={handleInputChange}
                                                                                   className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2"/>
                        </div>
                        <div>{renderLabel("Korišteni materijali (Zahvat)", "materialsUsed")}<input type="text"
                                                                                                   name="materialsUsed"
                                                                                                   value={formData.materialsUsed}
                                                                                                   onInput={handleInputChange}
                                                                                                   className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2"/>
                        </div>
                    </div>
                </section>

                {/* Section 3: Analiza i zahvati */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Analize i
                        provedeni radovi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>{renderLabel("Vrsta analize", "typeOfAnalysis")}<input type="text" name="typeOfAnalysis"
                                                                                    value={formData.typeOfAnalysis}
                                                                                    onInput={handleInputChange}
                                                                                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2"/>
                        </div>
                        <div>{renderLabel("Cilj analize", "goalOfAnalysis")}<input type="text" name="goalOfAnalysis"
                                                                                   value={formData.goalOfAnalysis}
                                                                                   onInput={handleInputChange}
                                                                                   className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2"/>
                        </div>
                        <div className="md:col-span-2">
                            {renderLabel("Provedeni radovi", "works")}
                            <textarea name="works" value={formData.works} onInput={handleInputChange} rows={3}
                                      className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 resize-none"></textarea>
                        </div>
                        <div className="md:col-span-2">
                            {renderLabel("Ključne riječi", "keywords")}
                            <input type="text" name="keywords" value={formData.keywords} onInput={handleInputChange}
                                   placeholder="Odvojite zarezom"
                                   className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2"/>
                        </div>
                    </div>
                </section>

                {/* Section 4: Lokacija */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Smještaj i
                        pohrana</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>{renderLabel("Izvorna lokacija", "location")}<input type="text" name="location"
                                                                                 value={formData.location}
                                                                                 onInput={handleInputChange}
                                                                                 className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2"/>
                        </div>
                        <div>{renderLabel("Mjesto pohrane / Depo", "storage")}<input type="text" name="storage"
                                                                                     value={formData.storage}
                                                                                     onInput={handleInputChange}
                                                                                     className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2"/>
                        </div>
                    </div>
                </section>

                {/* BOTTOM SECTION: Detailed Attachments */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Dokumentacija i
                        Prilozi</h2>

                    {/* PDF (Now Full Width) */}
                    <div className="mb-8 border border-slate-200 rounded-md p-6 bg-slate-50">
                        <h3 className="font-semibold text-lg text-slate-800 mb-3">Glavni Dokument (PDF) <span
                            className="text-red-500">*</span></h3>
                        {serverPaths.pdf && !files.pdf && (
                            <a href={getDownloadUrl(serverPaths.pdf)} target="_blank"
                               className="text-sm text-blue-700 font-medium underline block mb-3">📄 Preuzmi trenutni
                                PDF</a>
                        )}
                        <label
                            className="cursor-pointer inline-block bg-white border border-slate-300 text-slate-700 font-medium text-sm py-2 px-4 rounded hover:bg-slate-100 transition-colors">
                            Odaberi PDF
                            <input type="file" accept=".pdf" className="hidden"
                                   onChange={handleSingleFileChange('pdf')}/>
                        </label>
                        {files.pdf &&
                            <p className="text-sm text-green-600 font-medium mt-3">Pripremljeno: {files.pdf.name}</p>}
                    </div>

                    {/* Multiple Files: Project Photos */}
                    <div className="mb-8 border-t border-slate-100 pt-8">
                        <h3 className="font-semibold text-lg text-slate-800 mb-4">Fotografije projekta</h3>

                        {serverPaths.projectPhotos.length > 0 && (
                            <div className="flex flex-col mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">

                                {/* Sliding Container */}
                                <div className="overflow-hidden w-full mb-6">
                                    <div
                                        className="flex transition-transform duration-500 ease-in-out"
                                        style={{transform: `translateX(-${photoPage * 100}%)`}}
                                    >
                                        {/* Render ALL photos, CSS transform handles the paging */}
                                        {serverPaths.projectPhotos.map((photo, index) => (
                                            <div key={index} className="w-full md:w-1/3 flex-shrink-0 px-2">
                                                <div
                                                    className="flex flex-col bg-white border border-slate-300 rounded shadow-sm overflow-hidden h-full">
                                                    {/* Image Thumbnail */}
                                                    <div
                                                        className="relative group cursor-pointer aspect-[4/3] bg-black overflow-hidden"
                                                        onClick={() => setLightboxIndex(index)}
                                                    >
                                                        <img
                                                            src={getDownloadUrl(photo.path)}
                                                            alt="preview"
                                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                    </div>
                                                    {/* Edit Name Area (Multi-line) */}
                                                    <div className="p-2 border-t border-slate-200 flex-1 flex flex-col">
                                                        <textarea
                                                            value={photo.name}
                                                            onChange={(e) => handleUpdateServerPhotoName(index, (e.target as HTMLTextAreaElement).value)}
                                                            className="w-full text-sm font-medium text-slate-700 bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 flex-1"
                                                            rows={2}
                                                            placeholder="Unesite naziv"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-6">
                                        <button
                                            onClick={() => setPhotoPage(p => Math.max(0, p - 1))}
                                            disabled={photoPage === 0}
                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors"
                                        >
                                            <span className="text-xl font-bold">←</span>
                                        </button>

                                        <div className="flex gap-2">
                                            {Array.from({length: totalPages}).map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setPhotoPage(idx)}
                                                    className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${idx === photoPage ? 'bg-blue-600' : 'bg-slate-300 hover:bg-slate-400'}`}
                                                />
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setPhotoPage(p => Math.min(totalPages - 1, p + 1))}
                                            disabled={photoPage === totalPages - 1}
                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors"
                                        >
                                            <span className="text-xl font-bold">→</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* List for staging new photos with Multi-Line Textareas */}
                        {files.projectPhotos.map((item, index) => (
                            <div key={index}
                                 className="flex gap-4 mb-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
                                <img src={item.previewUrl} alt="preview"
                                     className="w-24 h-24 object-cover rounded border border-slate-300 shadow-sm"/>
                                <div className="flex-1 flex flex-col justify-between">
                                    <textarea
                                        value={item.name}
                                        placeholder="Unesite opisni naziv fotografije (u više linija)"
                                        onChange={(e) => handleUpdateFileName('projectPhotos', index, (e.target as HTMLTextAreaElement).value)}
                                        className="w-full text-sm px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 resize-none h-16"
                                    />
                                    <div className="flex justify-between items-end mt-1">
                                        <span
                                            className="text-xs text-slate-500 truncate max-w-[200px]">{item.file.name}</span>
                                        <button onClick={() => handleRemoveFile('projectPhotos', index)}
                                                className="text-red-500 hover:bg-red-100 text-sm px-3 py-1 rounded transition-colors font-medium">Ukloni
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <label
                            className="cursor-pointer inline-block bg-white border border-slate-300 text-slate-700 font-medium text-sm py-2 px-4 rounded hover:bg-slate-50 mt-2">
                            + Dodaj nove fotografije
                            <input type="file" accept="image/*" multiple className="hidden"
                                   onChange={handleMultipleFilesChange('projectPhotos')}/>
                        </label>
                    </div>

                    {/* Multiple Files: 3D Models (Paginated Viewer) */}
                    <div className="border-t border-slate-100 pt-8 mb-8">
                        <h3 className="font-semibold text-lg text-slate-800 mb-4">3D Modeli</h3>

                        {totalModels > 0 && (
                            <div className="flex flex-col mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">

                                <div
                                    className="flex flex-col bg-white border border-slate-300 rounded shadow-sm overflow-hidden mb-4">

                                    {/* 3D Model Renderer */}
                                    <div
                                        className="w-full h-[400px] bg-slate-200 relative flex items-center justify-center overflow-hidden">
                                        {currentModel && (
                                            isModelSupported ? (
                                                <model-viewer
                                                    src={currentModel.isServer ? getDownloadUrl(currentModel.data.path) : currentModel.data.previewUrl}
                                                    alt={currentModel.data.name}
                                                    auto-rotate
                                                    camera-controls
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        backgroundColor: '#f1f5f9',
                                                        cursor: 'grab'
                                                    }}
                                                ></model-viewer>
                                            ) : (
                                                <div
                                                    className="flex flex-col items-center justify-center text-slate-500 w-full h-full text-center p-6">
                                                    <span className="text-4xl mb-3">🧊</span>
                                                    <p className="font-semibold text-lg text-slate-700">Format nije
                                                        podržan za pregled</p>
                                                    <p className="text-sm mt-1">Samo .glb i .gltf formati mogu biti
                                                        prikazani u pregledniku.</p>
                                                    <p className="text-xs mt-2 bg-white px-2 py-1 rounded border border-slate-300">
                                                        {currentModelFilename.split('/').pop()}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    {/* Editor Controls */}
                                    {currentModel && (
                                        <div className="p-4 flex flex-col gap-3">
                        <textarea
                            value={currentModel.data.name}
                            onChange={(e) => {
                                if (currentModel.isServer) {
                                    handleUpdateServerModelName(currentModel.index, (e.target as HTMLTextAreaElement).value);
                                } else {
                                    handleUpdateFileName('models3d', currentModel.index, (e.target as HTMLTextAreaElement).value);
                                }
                            }}
                            className="w-full text-sm font-medium text-slate-700 bg-slate-50 border border-slate-300 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-3"
                            rows={2}
                            placeholder="Unesite naziv modela"
                        />
                                            <div className="flex justify-between items-center mt-2">
                                                <div className="flex gap-4">
                                                    {currentModel.isServer ? (
                                                        <a href={getDownloadUrl(currentModel.data.path)} target="_blank"
                                                           className="text-blue-700 hover:underline font-bold text-sm flex items-center gap-1">
                                                            <span>↓</span> Preuzmi datoteku
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs font-medium text-slate-500">Nova datoteka spremna za prijenos: {currentModel.data.file.name}</span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        if (currentModel.isServer) {
                                                            handleRemoveServerModel(currentModel.index);
                                                        } else {
                                                            handleRemoveFile('models3d', currentModel.index);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 font-bold px-4 py-1.5 rounded text-sm transition-all"
                                                >
                                                    Ukloni model
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Pagination Controls */}
                                {totalModels > 1 && (
                                    <div className="flex items-center justify-center gap-6 mt-2">
                                        <button
                                            onClick={() => setModelPage(p => Math.max(0, p - 1))}
                                            disabled={modelPage === 0}
                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors"
                                        >
                                            <span className="text-xl font-bold">←</span>
                                        </button>

                                        <div className="flex gap-2">
                                            {Array.from({length: totalModels}).map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setModelPage(idx)}
                                                    className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${idx === modelPage ? 'bg-blue-600' : 'bg-slate-300 hover:bg-slate-400'}`}
                                                />
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setModelPage(p => Math.min(totalModels - 1, p + 1))}
                                            disabled={modelPage === totalModels - 1}
                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors"
                                        >
                                            <span className="text-xl font-bold">→</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <label
                            className="cursor-pointer inline-block bg-white border border-slate-300 text-slate-700 font-medium text-sm py-2 px-4 rounded hover:bg-slate-50 mt-2">
                            + Dodaj nove modele
                            <input type="file" accept=".obj,.gltf,.glb" multiple className="hidden"
                                   onChange={handleMultipleFilesChange('models3d')}/>
                        </label>
                    </div>

                    {/* Single File: Video (Moved to the bottom) */}
                    <div className="border-t border-slate-100 pt-8">
                        <h3 className="font-semibold text-lg text-slate-800 mb-4">Videozapis</h3>
                        <div className="border border-slate-200 rounded-md p-6 bg-slate-50">
                            {serverPaths.video && !files.video && (
                                <a href={getDownloadUrl(serverPaths.video)} target="_blank"
                                   className="text-sm text-blue-700 font-medium underline block mb-3">🎥 Preuzmi trenutni
                                    Video</a>
                            )}
                            <label
                                className="cursor-pointer inline-block bg-white border border-slate-300 text-slate-700 font-medium text-sm py-2 px-4 rounded hover:bg-slate-100 transition-colors">
                                Odaberi Video
                                <input type="file" accept="video/*" className="hidden"
                                       onChange={handleSingleFileChange('video')}/>
                            </label>
                            {files.video &&
                                <p className="text-sm text-green-600 font-medium mt-3">Pripremljeno: {files.video.name}</p>}
                        </div>
                    </div>

                </section>

                {/* Bottom Publish Action */}
                <div className="mt-4 flex flex-col items-end gap-2">
                    <button
                        onClick={() => handleSave(true)}
                        disabled={!isPublishable || isSaving}
                        className="px-12 py-4 bg-blue-900 text-white font-bold tracking-wide rounded-md hover:bg-blue-800 disabled:opacity-50 transition-all shadow-md text-lg"
                    >
                        {isSaving ? 'Obrada...' : 'Objavi dokument'}
                    </button>
                    {!isPublishable && (
                        <p className="text-xs text-slate-500">
                            * Gumb za objavu postaje aktivan nakon popunjavanja osnovnih podataka i učitavanja PDF
                            dokumenta.
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}