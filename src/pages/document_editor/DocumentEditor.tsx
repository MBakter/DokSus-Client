import {useDocumentEditor} from "./useDocumentEditor.ts";
import {useEffect, useState} from "preact/hooks";
import {RestorationDataFields,} from "./content/RestorationDataFields.tsx";
import {ProjectSettings} from "./content/ProjectSettings.tsx";
import {Attachments} from "./content/Attachments.tsx";
import {IconCheck, IconDownload, IconPDF} from "../../assets/Icons.tsx";
import {getDownloadUrl} from "../../util/Utilities.ts";

interface DocumentEditorProps {
    id?: string;
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
                isPublished={editor.metadata.isPublished}
                onSave={() => editor.handleSave(false)}
                onPublish={() => editor.handleSave(true)}
            />

            <div className="w-full max-w-5xl flex flex-col gap-10 px-4 lg:px-0 mt-6">

                <ProjectSettings
                    metadata={editor.metadata}
                    fileManager={editor.fileManager}
                />

                <PdfSection
                    category={editor.restorationData.category}
                    pdfFile={editor.fileManager.files.pdf}
                    serverPdf={editor.fileManager.serverPaths.pdf}
                    onChange={editor.fileManager.handleSingleFileChange('pdf')}
                    onRemove={editor.fileManager.handleRemovePdf}
                />

                <RestorationDataFields
                    restorationData={editor.restorationData}
                    handleRestorationDataChange={editor.handleRestorationDataChange}
                    checkRequired={editor.checkIsFieldRequired}
                />

                <Attachments
                    fileManager={editor.fileManager}
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
        <div className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm mb-6 flex justify-center">
            <div className="w-full max-w-5xl flex items-center justify-between px-4 lg:px-0">

                {/* Title & Status Badge & Asterisk Legend */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {documentId ? 'Uređivanje dokumenta' : 'Novi dokument'}
                        </h1>
                        {isPublished && (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase tracking-wider border border-emerald-300 shadow-sm">
                                Objavljeno
                            </span>
                        )}
                    </div>
                    {/* Persistent Required Fields Sign */}
                    <p className="text-xs text-slate-500 font-medium">
                        <span className="text-red-500 font-bold text-sm mr-1">*</span>
                        Označava polja obavezna za objavu dokumenta
                    </p>
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
                            disabled={isSaving || (!isPublished && !hasChanges)}
                            className="px-5 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPublished ? 'Vrati u skicu' : 'Spremi skicu'}
                        </button>

                        <button
                            onClick={handlePublishClick}
                            // FIX: Disabled if saving, OR if it's missing requirements, OR if it's published but has no changes
                            disabled={isSaving || !isPublishable || (isPublished && !hasChanges)}
                            className="px-6 py-2 bg-blue-900 text-white font-bold tracking-wide rounded hover:bg-blue-800 disabled:opacity-50 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            {isPublished ? 'Spremi promjene' : 'Objavi dokument'}
                        </button>
                    </div>

                    {!isPublishable && (
                        <span className="text-[10px] text-red-600 font-bold mt-1">
                            Nedostaju obavezni podaci ili PDF za objavu.
                        </span>
                    )}
                </div>

            </div>
        </div>
    );
}

export function PdfSection({ pdfFile, serverPdf, onChange, onRemove }: any) {
    return (
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm w-full">
            <h2 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">
                Glavni Dokument (PDF) <span className="text-red-500">*</span>
            </h2>

            {/* Removed the inner gray background; using a clean, open layout */}
            <div className="flex flex-col gap-5">

                {serverPdf && !pdfFile && (
                    <div className="flex items-center mb-2">
                        <a
                            href={getDownloadUrl(serverPdf)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-base text-blue-700 font-medium hover:text-blue-900 transition-colors group"
                        >
                            <IconPDF  />
                            <span className="group-hover:underline">Preuzmi trenutni PDF</span>
                            <IconDownload className="w-5 h-5 text-slate-400 group-hover:text-blue-900 transition-colors" />
                        </a>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-4">
                    {/* Styled as a clean, slightly dashed dropzone-style button to indicate file input */}
                    <label
                        className="cursor-pointer inline-flex items-center justify-center bg-white border-2 border-dashed border-slate-300 text-slate-700 font-medium text-sm py-2.5 px-6 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer"
                    >

                        Odaberi PDF
                        <input type="file" accept=".pdf" className="hidden" onChange={onChange}/>
                    </label>

                    {(serverPdf || pdfFile) && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 font-medium text-sm py-2.5 px-6 rounded-md transition-colors cursor-pointer"
                        >
                            Ukloni PDF
                        </button>
                    )}
                </div>

                {pdfFile && (
                    <div className="flex items-center gap-2.5 text-sm text-emerald-800 font-medium bg-emerald-50/50 p-3 rounded-md border border-emerald-100 mt-2 w-fit">
                        <IconCheck />
                        <span>Pripremljeno za prijenos: <span className="font-bold">{pdfFile.name}</span></span>
                    </div>
                )}
            </div>
        </section>
    );
}