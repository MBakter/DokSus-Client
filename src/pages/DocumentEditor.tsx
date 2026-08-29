import { useEffect, useState } from 'preact/hooks';
import type { DocumentContent } from "../types/Document.ts";
import { createDocument, fetchDocumentById, updateDocument } from "../api/feature/DocumentApi.ts";

const CATEGORIES = [
    "",
    "DRVENI PREDMETI", "SLIKE NA PLATNU", "ZIDNE SLIKE",
    "KAMENA I ARHITEKTONSKA PLASTIKA", "OSTALI MATERIJALI",
    "REFERENTNA ISTRAŽIVANJA", "DIPLOMSKI I SEMINARSKI RADOVI"
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
}

interface ServerNamedFile {
    path: string;
    name: string;
}

interface DocumentEditorProps {
    id?: string; // Automatically injected by preact-router when URL is /uredi/:id
}

export function DocumentEditor({ id }: DocumentEditorProps) {
    const [documentId, setDocumentId] = useState<string | null>(id || null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(!!id);

    const [formData, setFormData] = useState<DocumentContent>(INITIAL_DATA);
    const [snapshot, setSnapshot] = useState<DocumentContent>(INITIAL_DATA);

    // Expanded file state to handle arrays and the new video field
    const [files, setFiles] = useState<{
        cover: File | null;
        pdf: File | null;
        video: File | null;
        projectPhotos: NamedFile[];
        models3d: NamedFile[];
    }>({
        cover: null,
        pdf: null,
        video: null,
        projectPhotos: [],
        models3d: []
    });

    // Track paths of files already saved on the server to enable downloads
    const [serverPaths, setServerPaths] = useState<{
        cover: string;
        pdf: string;
        video: string;
        projectPhotos: ServerNamedFile[];
        models3d: ServerNamedFile[];
    }>({
        cover: '',
        pdf: '',
        video: '',
        projectPhotos: [],
        models3d: []
    });

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

            // Safely map existing paths from the backend
            setServerPaths({
                cover: document.coverPath || '',
                pdf: document.pdfPath || '',
                video: (document as any).videoPath || '',
                projectPhotos: (document as any).projectPhotos || [],
                models3d: (document as any).models3d || []
            });
        } catch (error) {
            console.error("Failed to load document", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: Event) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        setFormData(prev => ({ ...prev, [target.name]: target.value }));
    };

    // Handler for single files (cover, pdf, video)
    const handleSingleFileChange = (type: 'cover' | 'pdf' | 'video') => (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            const selectedFile = target.files[0];
            setFiles(prev => ({ ...prev, [type]: selectedFile }));
        }
    };

    // Handler for multiple files (photos, models)
    const handleMultipleFilesChange = (type: 'projectPhotos' | 'models3d') => (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            const newFiles: NamedFile[] = Array.from(target.files).map(file => ({
                file,
                name: file.name.split('.')[0] // Default name is the filename without extension
            }));
            setFiles(prev => ({ ...prev, [type]: [...prev[type], ...newFiles] }));
        }
        target.value = ''; // Reset input so the same file can be selected again if removed
    };

    const handleUpdateFileName = (type: 'projectPhotos' | 'models3d', index: number, newName: string) => {
        setFiles(prev => {
            const updated = [...prev[type]];
            updated[index].name = newName;
            return { ...prev, [type]: updated };
        });
    };

    const handleRemoveFile = (type: 'projectPhotos' | 'models3d', index: number) => {
        setFiles(prev => {
            const updated = [...prev[type]];
            updated.splice(index, 1);
            return { ...prev, [type]: updated };
        });
    };

    const isFormFilled = REQUIRED_METADATA_FIELDS.every(field => formData[field].trim() !== '');
    const isPublishable = isFormFilled && (files.pdf !== null || serverPaths.pdf !== '');

    // Compare current form state with the snapshot to detect changes
    const hasTextChanges = JSON.stringify(formData) !== JSON.stringify(snapshot);
    const hasFileChanges = files.cover !== null || files.pdf !== null || files.video !== null ||
        files.projectPhotos.length > 0 || files.models3d.length > 0;
    const hasChanges = hasTextChanges || hasFileChanges;

    const handleSave = async (publish: boolean) => {
        setIsSaving(true);
        try {
            const payload = new FormData();

            // Append the JSON object as a Blob so Spring Boot can parse it
            payload.append("document", new Blob([JSON.stringify(formData)], { type: "application/json" }), "document.json");
            payload.append("isPublished", String(publish));

            // Append files if they exist
            if (files.cover) payload.append("cover", files.cover);
            if (files.pdf) payload.append("pdf", files.pdf);
            if (files.video) payload.append("video", files.video);

            // Append multiple files and their corresponding names
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
                // If saved as draft, reload to get updated server paths and reset local file state
                if (documentId) loadExistingDocument(documentId);
                setFiles({ cover: null, pdf: null, video: null, projectPhotos: [], models3d: [] });
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

    // Helper to generate the download URL (Update this base path to match your Spring Boot static resource config)
    const getDownloadUrl = (path: string) => `/api/files?path=${encodeURIComponent(path)}`;

    if (isLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500 font-medium">Učitavanje dokumenta...</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center pb-16 bg-slate-50 min-h-screen">

            {/* Top Action Bar */}
            <div className="w-full max-w-5xl flex items-center justify-between mt-8 mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {documentId ? 'Uređivanje dokumenta' : 'Novi dokument'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Unos restauratorskog projekta u bazu</p>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500 italic hidden sm:block">
                        Spremanjem nacrta dokument ostaje privatan.
                    </span>
                    <button
                        onClick={() => handleSave(false)}
                        disabled={isSaving || !hasChanges}
                        className="flex items-center gap-2 px-5 py-2 bg-blue-700 text-white font-medium rounded-md hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Spremanje...' : 'Spremi nacrt'}
                    </button>
                </div>
            </div>

            <div className="w-full max-w-5xl flex flex-col gap-6">

                {/* NEW TOP SECTION: Cover Photo */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-4 border-b border-slate-100 pb-2">Naslovna fotografija</h2>
                    <div className="border-2 border-dashed border-slate-300 rounded-md p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                        <span className="text-4xl mb-3">📸</span>
                        <p className="text-sm text-slate-600 mb-4">Ova fotografija će predstavljati projekt u glavnom pretraživaču.</p>

                        {serverPaths.cover && !files.cover && (
                            <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-md border border-green-200">
                                <span className="font-medium text-sm">Trenutna slika spremljena</span>
                                <a href={getDownloadUrl(serverPaths.cover)} target="_blank" className="text-xs underline ml-2">Preuzmi</a>
                            </div>
                        )}

                        <label className="cursor-pointer bg-white border border-slate-300 text-slate-700 font-medium py-2 px-6 rounded-md hover:border-blue-500 transition-colors shadow-sm">
                            {serverPaths.cover || files.cover ? 'Promijeni sliku' : 'Odaberi sliku'}
                            <input type="file" accept="image/*" className="hidden" onChange={handleSingleFileChange('cover')} />
                        </label>
                        {files.cover && <span className="text-xs text-blue-600 mt-3 font-medium">Odabrano za prijenos: {files.cover.name}</span>}
                    </div>
                </section>

                {/* Section 1: Osnovni podaci */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Identifikacija i opći podaci</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            {renderLabel("Kategorija", "category")}
                            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2">
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat || "— Odaberite kategoriju —"}</option>)}
                            </select>
                        </div>
                        <div>
                            {renderLabel("Broj OKIRU", "invNumber")}
                            <input type="text" name="invNumber" value={formData.invNumber} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" />
                        </div>
                        <div>
                            {renderLabel("Naslov / Naziv predmeta", "name")}
                            <input type="text" name="name" value={formData.name} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" />
                        </div>
                        <div>
                            {renderLabel("Autor", "author")}
                            <input type="text" name="author" value={formData.author} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" />
                        </div>
                        <div>
                            {renderLabel("Datacija", "date")}
                            <input type="text" name="date" value={formData.date} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" />
                        </div>
                        <div>
                            {renderLabel("Student", "student")}
                            <input type="text" name="student" value={formData.student} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" />
                        </div>
                        <div>
                            {renderLabel("Profesor / Mentor", "professor")}
                            <input type="text" name="professor" value={formData.professor} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" />
                        </div>
                    </div>
                </section>

                {/* Section 2: Materijali i tehnika */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Tehnološki podaci</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Material inputs shortened for brevity, keep the exact same fields you had before */}
                        <div>{renderLabel("Osnovni materijal", "material")}<input type="text" name="material" value={formData.material} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                        <div>{renderLabel("Tehnika", "technique")}<input type="text" name="technique" value={formData.technique} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                        <div>{renderLabel("Pigment", "pigment")}<input type="text" name="pigment" value={formData.pigment} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                        <div>{renderLabel("Vezivo", "binder")}<input type="text" name="binder" value={formData.binder} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                        <div>{renderLabel("Završni sloj", "finishingLayer")}<input type="text" name="finishingLayer" value={formData.finishingLayer} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                        <div>{renderLabel("Korišteni materijali (Zahvat)", "materialsUsed")}<input type="text" name="materialsUsed" value={formData.materialsUsed} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                    </div>
                </section>

                {/* Section 3: Analiza i zahvati */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Analize i provedeni radovi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>{renderLabel("Vrsta analize", "typeOfAnalysis")}<input type="text" name="typeOfAnalysis" value={formData.typeOfAnalysis} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                        <div>{renderLabel("Cilj analize", "goalOfAnalysis")}<input type="text" name="goalOfAnalysis" value={formData.goalOfAnalysis} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                        <div className="md:col-span-2">
                            {renderLabel("Provedeni radovi", "works")}
                            <textarea name="works" value={formData.works} onInput={handleInputChange} rows={3} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 resize-none"></textarea>
                        </div>
                        <div className="md:col-span-2">
                            {renderLabel("Ključne riječi", "keywords")}
                            <input type="text" name="keywords" value={formData.keywords} onInput={handleInputChange} placeholder="Odvojite zarezom" className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" />
                        </div>
                    </div>
                </section>

                {/* Section 4: Lokacija */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Smještaj i pohrana</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>{renderLabel("Izvorna lokacija", "location")}<input type="text" name="location" value={formData.location} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                        <div>{renderLabel("Mjesto pohrane / Depo", "storage")}<input type="text" name="storage" value={formData.storage} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                    </div>
                </section>

                {/* BOTTOM SECTION: Detailed Attachments */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Dokumentacija i Prilozi</h2>

                    {/* Singular Files (PDF & Video) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* PDF */}
                        <div className="border border-slate-200 rounded-md p-5 bg-slate-50">
                            <h3 className="font-semibold text-slate-800 mb-2">Glavni Dokument (PDF) <span className="text-red-500">*</span></h3>
                            {serverPaths.pdf && !files.pdf && (
                                <a href={getDownloadUrl(serverPaths.pdf)} target="_blank" className="text-sm text-blue-700 underline block mb-3">📄 Preuzmi trenutni PDF</a>
                            )}
                            <label className="cursor-pointer bg-white border border-slate-300 text-slate-600 text-xs py-1.5 px-3 rounded hover:bg-slate-100">
                                Odaberi PDF
                                <input type="file" accept=".pdf" className="hidden" onChange={handleSingleFileChange('pdf')} />
                            </label>
                            {files.pdf && <p className="text-xs text-green-600 mt-2">Pripremljeno: {files.pdf.name}</p>}
                        </div>

                        {/* Video */}
                        <div className="border border-slate-200 rounded-md p-5 bg-slate-50">
                            <h3 className="font-semibold text-slate-800 mb-2">Videozapis</h3>
                            {serverPaths.video && !files.video && (
                                <a href={getDownloadUrl(serverPaths.video)} target="_blank" className="text-sm text-blue-700 underline block mb-3">🎥 Preuzmi trenutni Video</a>
                            )}
                            <label className="cursor-pointer bg-white border border-slate-300 text-slate-600 text-xs py-1.5 px-3 rounded hover:bg-slate-100">
                                Odaberi Video
                                <input type="file" accept="video/*" className="hidden" onChange={handleSingleFileChange('video')} />
                            </label>
                            {files.video && <p className="text-xs text-green-600 mt-2">Pripremljeno: {files.video.name}</p>}
                        </div>
                    </div>

                    {/* Multiple Files: Project Photos */}
                    <div className="mb-8">
                        <h3 className="font-semibold text-slate-800 mb-3 border-b border-slate-200 pb-1">Fotografije projekta</h3>

                        {/* List existing server photos */}
                        {serverPaths.projectPhotos.length > 0 && (
                            <ul className="mb-4 space-y-2">
                                {serverPaths.projectPhotos.map((photo, i) => (
                                    <li key={i} className="text-sm flex items-center gap-2">
                                        <span>✓ {photo.name}</span>
                                        <a href={getDownloadUrl(photo.path)} target="_blank" className="text-blue-600 underline text-xs">Preuzmi</a>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* List new staged photos with name inputs */}
                        {files.projectPhotos.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 mb-2 p-2 bg-blue-50 border border-blue-100 rounded">
                                <span className="text-xs text-slate-500 w-24 truncate">{item.file.name}</span>
                                <input
                                    type="text"
                                    value={item.name}
                                    placeholder="Unesite naziv fotografije"
                                    onChange={(e) => handleUpdateFileName('projectPhotos', index, (e.target as HTMLInputElement).value)}
                                    className="flex-1 text-sm px-2 py-1 border border-slate-300 rounded"
                                />
                                <button onClick={() => handleRemoveFile('projectPhotos', index)} className="text-red-500 text-sm px-2">Ukloni</button>
                            </div>
                        ))}

                        <label className="cursor-pointer inline-block bg-white border border-slate-300 text-slate-600 text-xs py-1.5 px-3 rounded hover:bg-slate-100 mt-2">
                            + Dodaj fotografije
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleMultipleFilesChange('projectPhotos')} />
                        </label>
                    </div>

                    {/* Multiple Files: 3D Models */}
                    <div>
                        <h3 className="font-semibold text-slate-800 mb-3 border-b border-slate-200 pb-1">3D Modeli</h3>

                        {/* List existing server models */}
                        {serverPaths.models3d.length > 0 && (
                            <ul className="mb-4 space-y-2">
                                {serverPaths.models3d.map((model, i) => (
                                    <li key={i} className="text-sm flex items-center gap-2">
                                        <span>🧊 {model.name}</span>
                                        <a href={getDownloadUrl(model.path)} target="_blank" className="text-blue-600 underline text-xs">Preuzmi</a>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {files.models3d.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 mb-2 p-2 bg-blue-50 border border-blue-100 rounded">
                                <span className="text-xs text-slate-500 w-24 truncate">{item.file.name}</span>
                                <input
                                    type="text"
                                    value={item.name}
                                    placeholder="Unesite naziv modela"
                                    onChange={(e) => handleUpdateFileName('models3d', index, (e.target as HTMLInputElement).value)}
                                    className="flex-1 text-sm px-2 py-1 border border-slate-300 rounded"
                                />
                                <button onClick={() => handleRemoveFile('models3d', index)} className="text-red-500 text-sm px-2">Ukloni</button>
                            </div>
                        ))}

                        <label className="cursor-pointer inline-block bg-white border border-slate-300 text-slate-600 text-xs py-1.5 px-3 rounded hover:bg-slate-100 mt-2">
                            + Dodaj modele
                            <input type="file" accept=".obj,.gltf,.glb" multiple className="hidden" onChange={handleMultipleFilesChange('models3d')} />
                        </label>
                    </div>

                </section>

                {/* Bottom Publish Action */}
                <div className="mt-4 flex flex-col items-end gap-2">
                    <button
                        onClick={() => handleSave(true)}
                        disabled={!isPublishable || isSaving}
                        className="px-10 py-3 bg-blue-900 text-white font-bold tracking-wide rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        {isSaving ? 'Obrada...' : 'Objavi dokument'}
                    </button>
                    {!isPublishable && (
                        <p className="text-xs text-slate-500">
                            * Gumb za objavu postaje aktivan nakon popunjavanja osnovnih podataka i učitavanja PDF dokumenta.
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}