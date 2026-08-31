import {getDownloadUrl} from "../../util/Utilities.ts";
import {IconImagePlaceholder} from "../../assets/Icons.tsx";
import {useContext} from "preact/hooks";
import {AuthContext} from "../../context/AuthContext.tsx";

interface DocumentCardProps {
    document: any; // Using any or your Document type
    showAuthorIcon: boolean;
    onClick?: () => void;
}

export function DocumentCard({ document, onClick }: DocumentCardProps) {
    const { isAuthenticated } = useContext(AuthContext);

    const isPublic = document.visibility === 'PUBLIC';
    const visibilityLabel = isPublic ? 'Javno' : 'OKIRU';
    const visibilityTooltip = isPublic ? 'Vidljivo svim posjetiteljima' : 'Vidljivo isključivo prijavljenim korisnicima';

    const allProfiles = [
        document.ownerProfile,
        ...(document.authorProfiles || [])
    ].filter(Boolean);

    const profiles = Array.from(new Map(allProfiles.map(p => [p.email, p])).values());

    return (
        <div
            onClick={onClick}
            // Removed hardcoded heights, using h-full to adapt to content and grid siblings
            className="flex flex-col h-full bg-white border border-slate-200 rounded-md shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer"
        >
            {/* Draft Status */}
            {!document.isPublished && (
                <span className="absolute top-3 left-3 bg-yellow-100 text-yellow-800 border border-yellow-300 text-[10px] px-2 py-1 uppercase tracking-wider font-bold rounded-sm z-10 shadow-sm">
                    U izradi
                </span>
            )}

            {/* Visibility Tag (Top Right) */}
            <div
                className={`absolute top-3 right-3 flex items-center opacity-85 gap-1.5 px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider z-10 shadow-sm border backdrop-blur-sm transition-colors ${
                    isPublic
                        ? 'bg-white/90 text-slate-700 border-slate-300'
                        : 'bg-slate-800/90 text-white border-slate-700'
                }`}
                title={visibilityTooltip}
            >
                {visibilityLabel}
            </div>

            {/* Image Container (Fixed height of 44 / 176px so images align perfectly in the grid) */}
            <div className="h-44 bg-slate-50 border-b border-slate-100 overflow-hidden relative flex items-center justify-center shrink-0">
                {document.coverPath ? (
                    <img
                        src={getDownloadUrl(document.coverPath)}
                        alt={document.content.name}
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                    />
                ) : (
                    <IconImagePlaceholder />
                )}
            </div>

            {/* Card Content - flex-1 ensures it fills available space dynamically */}
            <div className="p-4 text-xs text-slate-700 flex flex-col flex-1 bg-white z-10">
                <div className="flex justify-between items-center text-slate-500 mb-2">
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                        {document.content.invNumber}
                    </span>
                    <span className="font-medium text-[10px]">{document.content.date}</span>
                </div>

                <p className="font-bold text-sm text-slate-900 line-clamp-2 mb-2" title={document.content.name}>
                    {document.content.name}
                </p>

                <p className="truncate"><span className="font-semibold text-slate-900">Tehnika:</span> {document.content.technique}</p>

                {/* Co-Authors Footer (Only visible if signed in) */}
                {isAuthenticated && profiles.length > 0 && (
                    // mt-auto pushes the footer to the absolute bottom of the card
                    <div className="mt-auto pt-4 border-t border-slate-100">
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Autori projekta</p>

                        {/* flex-wrap allows icons to flow to the next line dynamically when there are many */}
                        <div className="flex flex-wrap gap-2">
                            {profiles.map((profile: any, idx: number) => {
                                const initials = `${profile.name.charAt(0)}${profile.surname.charAt(0)}`.toUpperCase();
                                const fullName = `${profile.name} ${profile.surname}`;

                                return (
                                    <a
                                        key={idx}
                                        href={`/profil/${encodeURIComponent(profile.email)}`}
                                        className="w-7 h-7 flex items-center justify-center bg-slate-100 text-slate-600 border border-slate-300 rounded-full text-[10px] font-bold hover:bg-blue-900 hover:text-white hover:border-blue-900 transition-colors"
                                        title={`Prikaži profil: ${fullName}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {initials}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}