import type {Document} from "../../types/Document.ts";

interface DocumentCardProps {
    document: Document;
    showAuthorIcon: boolean;
    onClick?: () => void;
}

export function DocumentCard({ document, showAuthorIcon, onClick }: DocumentCardProps) {
    // Generate initials from the fetched account profile, fallback to the content author
    const authorInitials = document.ownerProfile
        ? `${document.ownerProfile.name.charAt(0)}${document.ownerProfile.surname.charAt(0)}`.toUpperCase()
        : document.content.author.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();

    const accountFullName = document.ownerProfile
        ? `${document.ownerProfile.name} ${document.ownerProfile.surname}`
        : document.content.author;

    return (

        <div onClick={onClick}
             className="flex flex-col h-80 bg-white border border-slate-200 rounded-md shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">

            {!document.isPublished && (
                <span className="absolute top-3 left-3 bg-yellow-100 text-yellow-800 border border-yellow-300 text-[10px] px-2 py-1 uppercase tracking-wider font-bold rounded-sm z-10 shadow-sm">
                    U izradi
                </span>
            )}

            {/* Author Icon for Home Page */}
            {showAuthorIcon && (
                <a
                    href={`/profil/${encodeURIComponent(document.ownerEmail)}`}
                    className="absolute top-3 right-3 bg-blue-900 text-white w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold shadow-sm z-10 hover:bg-blue-700 hover:scale-105 transition-all cursor-pointer"
                    title={`Objavio/la: ${accountFullName} - Prikaži profil`}
                    onClick={(e) => e.stopPropagation()} // Prevents parent clicks if card becomes interactive later
                >
                    {authorInitials}
                </a>
            )}

            <div className="flex-1 flex items-center justify-center bg-slate-50 border-b border-slate-100 group-hover:bg-slate-100 transition-colors">
                <span className="text-4xl text-slate-300">🖼️</span>
            </div>

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