import {CATEGORIES, REQUIRED_METADATA_FIELDS, useDocumentEditor} from "./useDocumentEditor.ts";
import {useEffect, useRef, useState} from "preact/hooks";
import Lightbox from "yet-another-react-lightbox";
import {Zoom} from "yet-another-react-lightbox/plugins";
import {type DocumentContent, Visibility} from "../../types/Document.ts";
import "yet-another-react-lightbox/styles.css";
import '@google/model-viewer';
import {getDownloadUrl} from "../../util/Utilities.ts";
import {
    IconCamera,
    IconCheck,
    IconDownload,
    IconGlobe,
    IconInstitution,
    IconPDF, IconSearch, IconUsers,
    IconVideo, IconX
} from "../../assets/Icons.tsx";
import type {UserProfile} from "../../types/UserProfile.ts";
import {searchUsersByQuery} from "../../api/feature/UserProfileApi.ts";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': any;
        }
    }
}

interface DocumentEditorProps {
    id?: string;
}

interface CoAuthorsSectionProps {
    selectedAuthors: UserProfile[];
    onAddAuthor: (author: UserProfile) => void;
    onRemoveAuthor: (email: string) => void;
}

export function DocumentEditor({ id }: DocumentEditorProps) {
    const editor = useDocumentEditor(id);

    if (editor.isLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500 font-medium">Učitavanje dokumenta...</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center pb-16 bg-slate-50 min-h-screen relative">

            <TopActionBar
                documentId={editor.documentId}
                isSaving={editor.isSaving}
                hasChanges={editor.hasChanges}
                isPublishable={editor.isPublishable}
                isPublished={editor.isPublished}
                onSave={() => editor.handleSave(false)}
                onPublish={() => editor.handleSave(true)}
            />

            <div className="w-full max-w-5xl flex flex-col gap-6 px-4 lg:px-0 mt-2">
                <VisibilitySection
                    visibility={editor.visibility}
                    onChange={editor.setVisibility}
                />

                <CoAuthorsSection
                    selectedAuthors={editor.coAuthors}
                    onAddAuthor={editor.handleAddCoAuthor}
                    onRemoveAuthor={editor.handleRemoveCoAuthor}
                />

                <CoverPhotoSection
                    coverFile={editor.files.cover}
                    serverCover={editor.serverPaths.cover}
                    coverPreviewUrl={editor.coverPreviewUrl}
                    onChange={editor.handleSingleFileChange('cover')}
                    onRemove={editor.handleRemoveCover}
                />

                <BasicDataSection formData={editor.formData} onChange={editor.handleInputChange} />
                <TechDataSection formData={editor.formData} onChange={editor.handleInputChange} />
                <AnalysisSection formData={editor.formData} onChange={editor.handleInputChange} />
                <StorageSection formData={editor.formData} onChange={editor.handleInputChange} />

                <PdfSection
                    pdfFile={editor.files.pdf}
                    serverPdf={editor.serverPaths.pdf}
                    onChange={editor.handleSingleFileChange('pdf')}
                    onRemove={editor.handleRemovePdf}
                />

                <PhotosSection
                    files={editor.files}
                    serverPaths={editor.serverPaths}
                    onMultipleFilesChange={editor.handleMultipleFilesChange('projectPhotos')}
                    onUpdateFileName={editor.handleUpdateFileName}
                    onUpdateServerPhotoName={editor.handleUpdateServerPhotoName}
                    onRemoveFile={editor.handleRemoveFile}
                    onRemoveServerPhoto={editor.handleRemoveServerPhoto}
                />

                <Models3DSection
                    files={editor.files}
                    serverPaths={editor.serverPaths}
                    onMultipleFilesChange={editor.handleMultipleFilesChange('models3d')}
                    onUpdateFileName={editor.handleUpdateFileName}
                    onUpdateServerModelName={editor.handleUpdateServerModelName}
                    onRemoveFile={editor.handleRemoveFile}
                    onRemoveServerModel={editor.handleRemoveServerModel}
                />

                <VideoSection
                    videoFile={editor.files.video}
                    serverVideo={editor.serverPaths.video}
                    onChange={editor.handleSingleFileChange('video')}
                    onUpdateVideoName={editor.handleUpdateVideoName}
                    onRemoveVideo={editor.handleRemoveVideo}
                />
            </div>
        </div>
    );
}

export function TopActionBar({ documentId, isSaving, hasChanges, onSave, isPublishable, onPublish, isPublished }: any) {
    const [actionText, setActionText] = useState("");

    // Clear the loading text when saving finishes
    useEffect(() => {
        if (!isSaving) setActionText("");
    }, [isSaving]);

    const handleDraftClick = () => {
        setActionText(isPublished ? "Vraćanje u skicu..." : "Spremanje skice...");
        onSave();
    };

    const handlePublishClick = () => {
        setActionText(isPublished ? "Spremanje promjena..." : "Objavljivanje...");
        onPublish();
    };

    return (
        <div className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm mb-6 flex justify-center">
            <div className="w-full max-w-5xl flex items-center justify-between px-4 lg:px-0">

                {/* Title & Status Badge */}
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {documentId ? 'Uređivanje dokumenta' : 'Novi dokument'}
                    </h1>
                    {isPublished && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase tracking-wider border border-emerald-300 shadow-sm">
                            Objavljeno
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-3">

                        {/* Dynamic Loading Text */}
                        {actionText && (
                            <span className="text-sm font-bold text-blue-700 animate-pulse mr-3">
                                {actionText}
                            </span>
                        )}

                        <button
                            onClick={handleDraftClick}
                            // If published, they can always unpublish. If draft, they need changes to save.
                            disabled={isSaving || (!isPublished && !hasChanges)}
                            className="px-5 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPublished ? 'Vrati u skicu' : 'Spremi skicu'}
                        </button>

                        <button
                            onClick={handlePublishClick}
                            // If published, disabled if no changes. If draft, disabled if not publishable.
                            disabled={isSaving || (isPublished ? !hasChanges : !isPublishable)}
                            className="px-6 py-2 bg-blue-900 text-white font-bold tracking-wide rounded hover:bg-blue-800 disabled:opacity-50 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            {isPublished ? 'Spremi promjene' : 'Objavi dokument'}
                        </button>
                    </div>

                    {/* Helper text only shows if it's a draft and missing requirements */}
                    {!isPublishable && !isPublished && (
                        <span className="text-[10px] text-slate-500 font-medium mt-1">
                            * Za objavu su obavezni metapodaci i PDF dokument.
                        </span>
                    )}
                </div>

            </div>
        </div>
    );
}

export function VisibilitySection({ visibility, onChange }: { visibility: Visibility, onChange: (val: Visibility) => void }) {
    return (
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Vidljivost projekta <span className="text-red-500">*</span></h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => onChange(Visibility.PUBLIC)}
                    className={`flex flex-col items-center justify-center p-6 border rounded-md transition-all ${
                        visibility === Visibility.PUBLIC
                            ? 'border-blue-900 bg-blue-50 text-blue-900 ring-1 ring-blue-900 shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400 hover:bg-slate-100'
                    }`}
                >
                    <IconGlobe />
                    <span className="font-bold text-base mb-1">Javno (Public)</span>
                    <span className="text-xs text-center px-4">Projekt je vidljiv svim posjetiteljima platforme.</span>
                </button>

                <button
                    type="button"
                    onClick={() => onChange(Visibility.OKIRU)}
                    className={`flex flex-col items-center justify-center p-6 border rounded-md transition-all ${
                        visibility === Visibility.OKIRU
                            ? 'border-blue-900 bg-blue-50 text-blue-900 ring-1 ring-blue-900 shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400 hover:bg-slate-100'
                    }`}
                >
                    <IconInstitution />
                    <span className="font-bold text-base mb-1">Interno (OKIRU)</span>
                    <span className="text-xs text-center px-4">Projekt je vidljiv isključivo prijavljenim korisnicima.</span>
                </button>
            </div>
        </section>
    );
}

export function CoAuthorsSection({ selectedAuthors, onAddAuthor, onRemoveAuthor }: CoAuthorsSectionProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        const fetchResults = async () => {
            setIsSearching(true);
            setShowDropdown(true);
            try {
                // Call actual backend endpoint
                const results: UserProfile[] = await searchUsersByQuery(searchQuery);

                // Filter out already selected authors
                const available = results.filter(user =>
                    !selectedAuthors.some(selected => selected.email === user.email)
                );

                setSearchResults(available);
            } catch (error) {
                console.error("Error searching users", error);
                setSearchResults([]); // Handle error gracefully in UI
            } finally {
                setIsSearching(false);
            }
        };

        // Debounce to prevent spamming the backend while typing
        const debounceTimer = setTimeout(fetchResults, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, selectedAuthors]);

    const handleSelect = (user: UserProfile) => {
        onAddAuthor(user);
        setSearchQuery('');
        setShowDropdown(false);
    };

    const getInitials = (name: string, surname: string) =>
        `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();

    return (
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm relative" ref={dropdownRef}>
            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
                <IconUsers />
                Koautori projekta
            </h2>

            {/* Selected Authors Display */}
            {selectedAuthors.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6">
                    {selectedAuthors.map(author => (
                        <div key={author.email} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full pl-2 pr-4 py-1.5 shadow-sm">
                            <div className="w-7 h-7 flex items-center justify-center bg-blue-900 text-white rounded-full text-[10px] font-bold shrink-0">
                                {getInitials(author.name, author.surname)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-800 leading-none mb-0.5">
                                    {author.name} {author.surname}
                                </span>
                            </div>
                            <button
                                onClick={() => onRemoveAuthor(author.email)}
                                className="ml-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full p-1 transition-colors"
                                title="Ukloni koautora"
                            >
                                <IconX />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconSearch />
                </div>
                <input
                    type="text"
                    placeholder="Pretraži korisnike po imenu ili email adresi..."
                    value={searchQuery}
                    onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-base rounded-md pl-10 pr-4 py-2.5 transition-all focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 placeholder:text-slate-400 shadow-sm"
                />

                {/* Dropdown Results */}
                {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-md shadow-lg z-50 p-4 max-h-80 overflow-y-auto">
                        {isSearching ? (
                            <p className="text-sm text-slate-500 text-center py-4">Pretraživanje...</p>
                        ) : searchResults.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {searchResults.map(user => (
                                    <div
                                        key={user.email}
                                        onClick={() => handleSelect(user)}
                                        className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 hover:border-blue-300 cursor-pointer transition-colors text-center group"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center bg-slate-200 text-slate-600 rounded-full text-base font-bold mb-3 group-hover:bg-blue-900 group-hover:text-white transition-colors">
                                            {getInitials(user.name, user.surname)}
                                        </div>
                                        <span className="font-bold text-sm text-slate-800 line-clamp-1 w-full">
                                            {user.name} {user.surname}
                                        </span>
                                        <span className="text-xs text-slate-500 line-clamp-1 w-full mt-0.5">
                                            {user.email}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4">Nema rezultata za "{searchQuery}"</p>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

export function CoverPhotoSection({ coverFile, serverCover, coverPreviewUrl, onChange, onRemove }: any) {
    return (
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-blue-900 mb-4 border-b border-slate-100 pb-2">Naslovna fotografija</h2>

            <div className="border-2 border-dashed border-slate-300 rounded-md p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                {coverPreviewUrl ? (
                    <div className="mb-4 flex flex-col items-center">
                        <img src={coverPreviewUrl} alt="Nova naslovna" className="w-48 h-48 object-cover rounded-md border border-slate-300 shadow-sm" />
                        <span className="text-xs text-blue-600 mt-3 font-medium">Odabrano za prijenos: {coverFile?.name}</span>
                    </div>
                ) : serverCover ? (
                    <div className="mb-4 flex flex-col items-center">
                        <img src={getDownloadUrl(serverCover)} alt="Trenutna naslovna" className="w-48 h-48 object-cover rounded-md border border-slate-300 shadow-sm" />
                        <span className="text-xs text-slate-500 mt-3">Trenutna slika na poslužitelju</span>
                    </div>
                ) : (
                    <>
                        <IconCamera />
                        <p className="text-sm text-slate-600 mb-4">Ova fotografija će predstavljati projekt u glavnom pretraživaču.</p>
                    </>
                )}

                <div className="flex gap-3 mt-2">
                    <label className="cursor-pointer bg-white border border-slate-300 text-slate-700 font-medium py-2 px-6 rounded-md hover:border-blue-500 transition-colors shadow-sm">
                        {serverCover || coverFile ? 'Promijeni sliku' : 'Odaberi sliku'}
                        <input type="file" accept="image/*" className="hidden" onChange={onChange} />
                    </label>

                    {(serverCover || coverFile) && (
                        <button onClick={onRemove} className="text-red-600 hover:bg-red-50 border border-slate-300 hover:border-red-200 font-medium py-2 px-6 rounded-md transition-colors shadow-sm">
                            Ukloni
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}

const renderLabel = (label: string, fieldName: keyof DocumentContent) => (
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label} {REQUIRED_METADATA_FIELDS.includes(fieldName) && <span className="text-red-500 ml-1">*</span>}
    </label>
);

export function BasicDataSection({ formData, onChange }: any) {
    return (
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Identifikacija i opći podaci</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                    {renderLabel("Kategorija", "category")}
                    <select name="category" value={formData.category} onChange={onChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2">
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat || "— Odaberite kategoriju —"}</option>
                        ))}
                    </select>
                </div>
                <div>{renderLabel("Broj OKIRU", "invNumber")}<input type="text" name="invNumber" value={formData.invNumber} onInput={onChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                <div>{renderLabel("Naslov / Naziv predmeta", "name")}<input type="text" name="name" value={formData.name} onInput={onChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                <div>{renderLabel("Autor", "author")}<input type="text" name="author" value={formData.author} onInput={onChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                <div>{renderLabel("Datacija", "date")}<input type="text" name="date" value={formData.date} onInput={onChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                <div>{renderLabel("Student", "student")}<input type="text" name="student" value={formData.student} onInput={onChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                <div>{renderLabel("Profesor / Mentor", "professor")}<input type="text" name="professor" value={formData.professor} onInput={onChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
            </div>
        </section>
    );
}

export function TechDataSection({ formData, onChange }: any) {
    return (
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Tehnološki podaci</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>{renderLabel("Osnovni materijal", "material")}<input type="text" name="material" value={formData.material} onInput={onChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                <div>{renderLabel("Tehnika", "technique")}<input type="text" name="technique" value={formData.technique} onInput={onChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                <div>{renderLabel("Pigment", "pigment")}<input type="text" name="pigment" value={formData.pigment} onInput={onChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                <div>{renderLabel("Vezivo", "binder")}<input type="text" name="binder" value={formData.binder} onInput={onChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                <div>{renderLabel("Završni sloj", "finishingLayer")}<input type="text" name="finishingLayer" value={formData.finishingLayer} onInput={onChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                <div>{renderLabel("Korišteni materijali (Zahvat)", "materialsUsed")}<input type="text" name="materialsUsed" value={formData.materialsUsed} onInput={onChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
            </div>
        </section>
    );
}

export function AnalysisSection({ formData, onChange }: any) {
    return (
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Analize i provedeni radovi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>{renderLabel("Vrsta analize", "typeOfAnalysis")}<input type="text" name="typeOfAnalysis" value={formData.typeOfAnalysis} onInput={onChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                <div>{renderLabel("Cilj analize", "goalOfAnalysis")}<input type="text" name="goalOfAnalysis" value={formData.goalOfAnalysis} onInput={onChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                <div className="md:col-span-2">
                    {renderLabel("Provedeni radovi", "works")}
                    <textarea name="works" value={formData.works} onInput={onChange} rows={3} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 resize-none"></textarea>
                </div>
                <div className="md:col-span-2">
                    {renderLabel("Ključne riječi", "keywords")}
                    <input type="text" name="keywords" value={formData.keywords} onInput={onChange} placeholder="Odvojite zarezom" className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" />
                </div>
            </div>
        </section>
    );
}

export function StorageSection({ formData, onChange }: any) {
    return (
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Smještaj i pohrana</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>{renderLabel("Izvorna lokacija", "location")}<input type="text" name="location" value={formData.location} onInput={onChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
                <div>{renderLabel("Mjesto pohrane / Depo", "storage")}<input type="text" name="storage" value={formData.storage} onInput={onChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2" /></div>
            </div>
        </section>
    );
}

export function PdfSection({ pdfFile, serverPdf, onChange, onRemove }: any) {
    return (
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">
                Glavni Dokument (PDF) <span className="text-red-500">*</span>
            </h2>

            {/* Increased padding and added gap for a less cramped layout */}
            <div className="border border-slate-200 rounded-md p-8 bg-slate-50 flex flex-col gap-6">

                {serverPdf && !pdfFile && (
                    <div className="flex items-center">
                        <a
                            href={getDownloadUrl(serverPdf)}
                            target="_blank"
                            className="flex items-center gap-2.5 text-base text-blue-700 font-medium hover:text-blue-900 transition-colors group"
                        >
                            <IconPDF />
                            <span className="group-hover:underline">Preuzmi trenutni PDF</span>
                            <IconDownload />
                        </a>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-4">
                    <label className="cursor-pointer inline-flex items-center bg-white border border-slate-300 text-slate-700 font-medium text-base py-2.5 px-6 rounded-md hover:bg-slate-100 hover:border-slate-400 transition-colors shadow-sm">
                        Odaberi PDF
                        <input type="file" accept=".pdf" className="hidden" onChange={onChange} />
                    </label>

                    {(serverPdf || pdfFile) && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="text-red-600 hover:bg-red-50 border border-slate-300 hover:border-red-200 font-medium text-base py-2.5 px-6 rounded-md transition-colors shadow-sm"
                        >
                            Ukloni PDF
                        </button>
                    )}
                </div>

                {pdfFile && (
                    <div className="flex items-center gap-3 text-base text-emerald-800 font-medium bg-emerald-50 p-4 rounded-md border border-emerald-200">
                        <IconCheck />
                        <span>Pripremljeno za prijenos: <span className="font-bold">{pdfFile.name}</span></span>
                    </div>
                )}
            </div>
        </section>
    );
}

export function PhotosSection({ files, serverPaths, onMultipleFilesChange, onUpdateFileName, onUpdateServerPhotoName, onRemoveFile, onRemoveServerPhoto }: any) {
    const ITEMS_PER_PAGE = 3;

    const [lightboxIndex, setLightboxIndex] = useState(-1);
    const [photoPage, setPhotoPage] = useState(0);

    const totalPages = Math.ceil(serverPaths.projectPhotos.length / ITEMS_PER_PAGE);
    const lightboxSlides = serverPaths.projectPhotos.map((photo: any) => ({
        src: getDownloadUrl(photo.path), alt: photo.name,
    }));

    return (
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Fotografije projekta</h2>

            {serverPaths.projectPhotos.length > 0 && (
                <div className="flex flex-col mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <Lightbox open={lightboxIndex >= 0} close={() => setLightboxIndex(-1)} index={lightboxIndex} slides={lightboxSlides} plugins={[Zoom]} />

                    <div className="overflow-hidden w-full mb-6">
                        <div className="flex transition-transform duration-500 ease-in-out" style={{transform: `translateX(-${photoPage * 100}%)`}}>
                            {serverPaths.projectPhotos.map((photo: any, index: number) => (
                                <div key={index} className="w-full md:w-1/3 flex-shrink-0 px-2">
                                    <div className="flex flex-col bg-white border border-slate-300 rounded shadow-sm overflow-hidden h-full">
                                        <div className="relative group cursor-pointer aspect-[4/3] bg-black overflow-hidden" onClick={() => setLightboxIndex(index)}>
                                            <img src={getDownloadUrl(photo.path)} alt="preview" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                        </div>
                                        <div className="p-2 border-t border-slate-200 flex-1 flex flex-col">
                                            <textarea
                                                value={photo.name}
                                                onChange={(e) => onUpdateServerPhotoName(index, (e.target as HTMLTextAreaElement).value)}
                                                className="w-full text-sm font-medium text-slate-700 bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 flex-1 mb-2"
                                                rows={2} placeholder="Unesite naziv"
                                            />
                                            <button
                                                onClick={() => onRemoveServerPhoto(index)}
                                                className="text-red-500 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-xs px-2 py-1 rounded transition-colors font-medium self-end"
                                            >
                                                Ukloni
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-6">
                            <button onClick={() => setPhotoPage(p => Math.max(0, p - 1))} disabled={photoPage === 0} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors">
                                <span className="text-xl font-bold">←</span>
                            </button>
                            <div className="flex gap-2">
                                {Array.from({length: totalPages}).map((_, idx) => (
                                    <div key={idx} onClick={() => setPhotoPage(idx)} className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${idx === photoPage ? 'bg-blue-600' : 'bg-slate-300 hover:bg-slate-400'}`} />
                                ))}
                            </div>
                            <button onClick={() => setPhotoPage(p => Math.min(totalPages - 1, p + 1))} disabled={photoPage === totalPages - 1} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors">
                                <span className="text-xl font-bold">→</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {files.projectPhotos.map((item: any, index: number) => (
                <div key={index} className="flex gap-4 mb-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
                    <img src={item.previewUrl} alt="preview" className="w-24 h-24 object-cover rounded border border-slate-300 shadow-sm"/>
                    <div className="flex-1 flex flex-col justify-between">
                        <textarea
                            value={item.name}
                            placeholder="Unesite opisni naziv fotografije (u više linija)"
                            onChange={(e) => onUpdateFileName('projectPhotos', index, (e.target as HTMLTextAreaElement).value)}
                            className="w-full text-sm px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 resize-none h-16"
                        />
                        <div className="flex justify-between items-end mt-1">
                            <span className="text-xs text-slate-500 truncate max-w-[200px]">{item.file.name}</span>
                            <button onClick={() => onRemoveFile('projectPhotos', index)} className="text-red-500 hover:bg-red-100 text-sm px-3 py-1 rounded transition-colors font-medium">Ukloni</button>
                        </div>
                    </div>
                </div>
            ))}

            <label className="cursor-pointer inline-block bg-white border border-slate-300 text-slate-700 font-medium text-sm py-2 px-4 rounded hover:bg-slate-50 mt-2">
                + Dodaj nove fotografije
                <input type="file" accept="image/*" multiple className="hidden" onChange={onMultipleFilesChange}/>
            </label>
        </section>
    );
}

export function Models3DSection({ files, serverPaths, onMultipleFilesChange, onUpdateFileName, onUpdateServerModelName, onRemoveFile, onRemoveServerModel }: any) {
    const [modelPage, setModelPage] = useState(0);

    const allModels = [
        ...serverPaths.models3d.map((m: any, i: number) => ({isServer: true, data: m, index: i})),
        ...files.models3d.map((m: any, i: number) => ({isServer: false, data: m, index: i}))
    ];
    const totalModels = allModels.length;
    const currentModel = allModels[modelPage];

    useEffect(() => {
        if (modelPage >= totalModels && totalModels > 0) {
            setModelPage(totalModels - 1);
        } else if (totalModels === 0) {
            setModelPage(0);
        }
    }, [totalModels, modelPage]);

    const isModelFormatSupported = (filename: string) => {
        const lowerCaseName = filename.toLowerCase();
        return lowerCaseName.endsWith('.glb') || lowerCaseName.endsWith('.gltf');
    };

    const currentModelFilename = currentModel ? (currentModel.isServer ? currentModel.data.path : currentModel.data.file.name) : '';
    const isModelSupported = isModelFormatSupported(currentModelFilename);

    return (
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">3D Modeli</h2>

            {totalModels > 0 && (
                <div className="flex flex-col mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">

                    <div className="flex flex-col bg-white border border-slate-300 rounded shadow-sm overflow-hidden mb-4">

                        <div className="w-full h-[400px] bg-slate-200 relative flex items-center justify-center overflow-hidden">
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
                                    <div className="flex flex-col items-center justify-center text-slate-500 w-full h-full text-center p-6">
                                        <span className="text-4xl mb-3">🧊</span>
                                        <p className="font-semibold text-lg text-slate-700">Format nije podržan za pregled</p>
                                        <p className="text-sm mt-1">Samo .glb i .gltf formati mogu biti prikazani u pregledniku.</p>
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
                                            onUpdateServerModelName(currentModel.index, (e.target as HTMLTextAreaElement).value);
                                        } else {
                                            onUpdateFileName('models3d', currentModel.index, (e.target as HTMLTextAreaElement).value);
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
                                        type="button"
                                        onClick={() => {
                                            if (currentModel.isServer) {
                                                onRemoveServerModel(currentModel.index);
                                            } else {
                                                onRemoveFile('models3d', currentModel.index);
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
                            <button type="button"
                                    onClick={() => setModelPage(p => Math.max(0, p - 1))}
                                    disabled={modelPage === 0}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors">
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
                            <button type="button"
                                    onClick={() => setModelPage(p => Math.min(totalModels - 1, p + 1))}
                                    disabled={modelPage === totalModels - 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors">
                                <span className="text-xl font-bold">→</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            <label className="cursor-pointer inline-block bg-white border border-slate-300 text-slate-700 font-medium text-sm py-2 px-4 rounded hover:bg-slate-50 mt-2">
                + Dodaj nove modele
                <input type="file" accept=".obj,.gltf,.glb" multiple className="hidden"
                       onChange={onMultipleFilesChange}/>
            </label>
        </section>
    );
}

export function VideoSection({ videoFile, serverVideo, onChange, onUpdateVideoName, onRemoveVideo }: any) {
    return (
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Videozapis</h2>

            {(serverVideo || videoFile) ? (
                <div className="flex flex-col mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex flex-col bg-white border border-slate-300 rounded shadow-sm overflow-hidden mb-4">
                        <div className="w-full bg-slate-200 relative flex items-center justify-center overflow-hidden">
                            <video src={serverVideo ? getDownloadUrl(serverVideo.path) : videoFile!.previewUrl} controls className="w-full h-auto max-h-[450px] bg-black">
                                Vaš preglednik ne podržava video element.
                            </video>
                        </div>

                        <div className="p-4 flex flex-col gap-3">
                            <textarea
                                value={serverVideo ? serverVideo.name : videoFile!.name}
                                onChange={(e) => onUpdateVideoName((e.target as HTMLTextAreaElement).value, !!serverVideo)}
                                className="w-full text-sm font-medium text-slate-700 bg-slate-50 border border-slate-300 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-3"
                                rows={2} placeholder="Unesite naziv videozapisa"
                            />

                            <div className="flex justify-between items-center mt-2">
                                <div className="flex gap-4">
                                    {serverVideo ? (
                                        <a href={getDownloadUrl(serverVideo.path)} target="_blank" className="text-blue-700 hover:underline font-bold text-sm flex items-center gap-1"><span>↓</span> Preuzmi datoteku</a>
                                    ) : (
                                        <span className="text-xs font-medium text-slate-500">Nova datoteka spremna za prijenos: {videoFile!.file.name}</span>
                                    )}
                                </div>
                                <button onClick={() => onRemoveVideo(!!serverVideo)} className="text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 font-bold px-4 py-1.5 rounded text-sm transition-all">
                                    Ukloni video
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-md p-8 bg-slate-50 flex flex-col items-center justify-center transition-colors hover:bg-slate-100">
                    <IconVideo />
                    <p className="text-sm text-slate-600 mb-4">Ovdje možete priložiti videozapis o projektu.</p>
                    <label className="cursor-pointer inline-block bg-white border border-slate-300 text-slate-700 font-medium text-sm py-2 px-6 rounded-md hover:border-blue-500 transition-colors shadow-sm">
                        Odaberi video
                        <input type="file" accept="video/*" className="hidden" onChange={onChange}/>
                    </label>
                </div>
            )}
        </section>
    );
}