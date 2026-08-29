import {useEffect, useState} from 'preact/hooks';
import type {DocumentContent} from "../types/Document.ts";
import {createDocument, fetchDocumentById, updateDocument} from "../api/feature/DocumentApi.ts";

const CATEGORIES = [
    "", // Empty default option
    "DRVENI PREDMETI", "SLIKE NA PLATNU", "ZIDNE SLIKE",
    "KAMENA I ARHITEKTONSKA PLASTIKA", "OSTALI MATERIJALI",
    "REFERENTNA ISTRAŽIVANJA", "DIPLOMSKI I SEMINARSKI RADOVI"
];

// Configuration array for required fields
const REQUIRED_METADATA_FIELDS: Array<keyof DocumentContent> = [
    'category',
    'invNumber',
    'name',
    'author',
    'date',
    'student',
    'professor'
];

const INITIAL_DATA: DocumentContent = {
    category: '', invNumber: '', name: '', author: '', date: '', student: '', professor: '',
    material: '', technique: '', pigment: '', binder: '', finishingLayer: '', materialsUsed: '',
    typeOfAnalysis: '', goalOfAnalysis: '', works: '', keywords: '', location: '', storage: ''
};

interface DocumentEditorProps {
    id?: string; // Automatically injected by preact-router when URL is /uredi/:id
}

export function DocumentEditor({ id }: DocumentEditorProps) {
    const [documentId, setDocumentId] = useState<string | null>(id || null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(!!id);

    const [formData, setFormData] = useState<DocumentContent>(INITIAL_DATA);
    const [snapshot, setSnapshot] = useState<DocumentContent>(INITIAL_DATA);

    const [files, setFiles] = useState<{
        cover: File | null;
        pdf: File | null;
        model3d: File | null;
    }>({
        cover: null,
        pdf: null,
        model3d: null
    });
    const [existingFiles, setExistingFiles] = useState({
        pdf: false,
        cover: false,
        model3d: false
    });

    // Fetch existing document data when editing
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

            setExistingFiles({
                pdf: !!document.pdfPath,
                cover: !!document.coverPath,
                model3d: !!document.model3dPath
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

    const handleFileChange = (type: 'cover' | 'pdf' | 'model3d') => (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            const selectedFile = target.files[0];
            setFiles(prev => ({ ...prev, [type]: selectedFile }));
        }
    };

    // Validation logic for the Publish button
    const isFormFilled = REQUIRED_METADATA_FIELDS.every(field => formData[field].trim() !== '');
    const isPublishable = isFormFilled && (files.pdf !== null || existingFiles.pdf);

    // Compare current form state with the snapshot to detect changes
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(snapshot);

    const handleSave = async (publish: boolean) => {
        setIsSaving(true);
        try {
            const payload = new FormData();

            // Append the JSON object as a Blob so Spring Boot can parse it
            payload.append("document", new Blob([JSON.stringify(formData)], { type: "application/json" }));
            payload.append("isPublished", String(publish));

            // Append files if they exist
            if (files.cover) payload.append("cover", files.cover);
            if (files.pdf) payload.append("pdf", files.pdf);
            if (files.model3d) payload.append("model3d", files.model3d);

            if (documentId) {
                await updateDocument(documentId, payload);
            } else {
                const newDoc = await createDocument(payload);
                setDocumentId(newDoc.id);
            }

            if (publish) {
                window.location.href = '/racun';
            } else {
                setSnapshot(formData);
            }
        } catch (error) {
            console.error("Failed to save document:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Helper to render labels with automatic asterisks for required fields
    const renderLabel = (label: string, fieldName: keyof DocumentContent) => (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {label} {REQUIRED_METADATA_FIELDS.includes(fieldName) && <span className="text-red-500 ml-1">*</span>}
        </label>
    );

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
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        {isSaving ? 'Spremanje...' : 'Spremi nacrt'}
                    </button>
                </div>
            </div>

            <div className="w-full max-w-5xl flex flex-col gap-6">

                {/* Section 1: Osnovni podaci */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Identifikacija i opći podaci</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            {renderLabel("Kategorija", "category")}
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat || "— Odaberite kategoriju —"}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            {renderLabel("Broj OKIRU", "invNumber")}
                            <input type="text" name="invNumber" value={formData.invNumber} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            {renderLabel("Naslov / Naziv predmeta", "name")}
                            <input type="text" name="name" value={formData.name} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            {renderLabel("Autor", "author")}
                            <input type="text" name="author" value={formData.author} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            {renderLabel("Datacija", "date")}
                            <input type="text" name="date" value={formData.date} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            {renderLabel("Student", "student")}
                            <input type="text" name="student" value={formData.student} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            {renderLabel("Profesor / Mentor", "professor")}
                            <input type="text" name="professor" value={formData.professor} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                    </div>
                </section>

                {/* Section 2: Materijali i tehnika */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Tehnološki podaci</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            {renderLabel("Osnovni materijal", "material")}
                            <input type="text" name="material" value={formData.material} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            {renderLabel("Tehnika", "technique")}
                            <input type="text" name="technique" value={formData.technique} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            {renderLabel("Pigment", "pigment")}
                            <input type="text" name="pigment" value={formData.pigment} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            {renderLabel("Vezivo", "binder")}
                            <input type="text" name="binder" value={formData.binder} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            {renderLabel("Završni sloj", "finishingLayer")}
                            <input type="text" name="finishingLayer" value={formData.finishingLayer} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            {renderLabel("Korišteni materijali (Zahvat)", "materialsUsed")}
                            <input type="text" name="materialsUsed" value={formData.materialsUsed} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                    </div>
                </section>

                {/* Section 3: Analiza i zahvati */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Analize i provedeni radovi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            {renderLabel("Vrsta analize", "typeOfAnalysis")}
                            <input type="text" name="typeOfAnalysis" value={formData.typeOfAnalysis} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            {renderLabel("Cilj analize", "goalOfAnalysis")}
                            <input type="text" name="goalOfAnalysis" value={formData.goalOfAnalysis} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div className="md:col-span-2">
                            {renderLabel("Provedeni radovi", "works")}
                            <textarea name="works" value={formData.works} onInput={handleInputChange} rows={3} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 resize-none"></textarea>
                        </div>
                        <div className="md:col-span-2">
                            {renderLabel("Ključne riječi", "keywords")}
                            <input type="text" name="keywords" value={formData.keywords} onInput={handleInputChange} placeholder="Odvojite zarezom (npr. drvo, polikromija, 18. stoljeće)" className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                    </div>
                </section>

                {/* Section 4: Lokacija */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Smještaj i pohrana</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            {renderLabel("Izvorna lokacija", "location")}
                            <input type="text" name="location" value={formData.location} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            {renderLabel("Mjesto pohrane / Depo", "storage")}
                            <input type="text" name="storage" value={formData.storage} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                    </div>
                </section>

                {/* Section 5: Prilozi i dokumentacija */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
                        <h2 className="text-lg font-bold text-blue-900">Multimedija i privitci</h2>
                        <a href="#" className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1">
                            <span>↓</span> Preuzmi DOCX predložak
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="border border-dashed border-slate-300 rounded-md p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
                            <span className="text-3xl mb-2">📸</span>
                            <span className="text-sm font-semibold text-slate-700 mb-1">Naslovna fotografija</span>
                            <label className="mt-3 cursor-pointer bg-white border border-slate-300 text-slate-600 text-xs py-1.5 px-3 rounded hover:bg-slate-100 transition-colors">
                                Odaberi sliku
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange('cover')} />
                            </label>
                            {files.cover && <span className="text-xs text-green-600 mt-2 font-medium">✓ Slika dodana</span>}
                        </div>

                        <div className="border border-dashed border-slate-300 rounded-md p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
                            <span className="text-3xl mb-2">📄</span>
                            <span className="text-sm font-semibold text-slate-700 mb-1">Dokumentacija (PDF) <span className="text-red-500">*</span></span>
                            <label className="mt-3 cursor-pointer bg-white border border-slate-300 text-slate-600 text-xs py-1.5 px-3 rounded hover:bg-slate-100 transition-colors">
                                Odaberi PDF
                                <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange('pdf')} />
                            </label>
                            {files.pdf && <span className="text-xs text-green-600 mt-2 font-medium">✓ PDF dodan</span>}
                        </div>

                        <div className="border border-dashed border-slate-300 rounded-md p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
                            <span className="text-3xl mb-2">🧊</span>
                            <span className="text-sm font-semibold text-slate-700 mb-1">3D Model (Opcijonalno)</span>
                            <label className="mt-3 cursor-pointer bg-white border border-slate-300 text-slate-600 text-xs py-1.5 px-3 rounded hover:bg-slate-100 transition-colors">
                                Odaberi datoteku
                                <input type="file" accept=".obj,.gltf,.glb" className="hidden" onChange={handleFileChange('model3d')} />
                            </label>
                            {files.model3d && <span className="text-xs text-green-600 mt-2 font-medium">✓ Model dodan</span>}
                        </div>
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