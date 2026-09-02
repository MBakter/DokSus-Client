import {useDocumentEditor} from "./useDocumentEditor.ts";
import {useEffect, useState} from "preact/hooks";
import {RestorationDataFields,} from "./content/RestorationDataFields.tsx";
import {ProjectSettings} from "./content/ProjectSettings.tsx";
import {Attachments} from "./content/Attachments.tsx";

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

                <RestorationDataFields
                    restorationData={editor.restorationData}
                    handleRestorationDataChange={editor.handleRestorationDataChange}
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
