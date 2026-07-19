import type {Document} from "../../types/Document.ts";

interface DocumentCardProps {
    document: Document;
    showAuthorIcon: boolean;
}

export function DocumentCard({ document, showAuthorIcon }: DocumentCardProps) {
    // Generate up to 2 initials from the author string (e.g., "Ivan Ivić" -> "II")
    const authorInitials = document.content.author
        .split(' ')
        .map((word: string) => word.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();

    return (
        <div className="flex flex-col h-80 bg-white border border-slate-200 rounded-md shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">

            {/* Private Badge for Account Page */}
            {!document.isPublished && (
                <span className="absolute top-3 left-3 bg-yellow-100 text-yellow-800 border border-yellow-300 text-[10px] px-2 py-1 uppercase tracking-wider font-bold rounded-sm z-10 shadow-sm">
                    U izradi
                </span>
            )}

            {/* Author Icon for Home Page */}
            {showAuthorIcon && (
                <div
                    className="absolute top-3 right-3 bg-blue-900 text-white w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold shadow-sm z-10"
                    title={`Autor: ${document.content.author}`}
                >
                    {authorInitials}
                </div>
            )}

            {/* Image Placeholder */}
            <div className="flex-1 flex items-center justify-center bg-slate-50 border-b border-slate-100 group-hover:bg-slate-100 transition-colors">
                <span className="text-4xl text-slate-300">🖼️</span>
            </div>

            {/* Information Layout */}
            <div className="p-4 text-xs text-slate-700 flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-slate-500 mb-1">
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{document.content.invNumber}</span>
                    <span className="font-medium text-[10px]">{document.content.date}</span>
                </div>
                <p className="font-bold text-sm text-slate-900 truncate" title={document.content.name}>
                    {document.content.name}
                </p>
                <p className="truncate"><span className="font-semibold text-slate-900">Autor:</span> {document.content.author}</p>
                <p className="truncate"><span className="font-semibold text-slate-900">Tehnika:</span> {document.content.technique}</p>
            </div>
        </div>
    );
}