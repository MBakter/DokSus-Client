import {formatDateObj, getDownloadUrl} from "../../util/Utilities.ts";
import {IconImagePlaceholder} from "../../assets/Icons.tsx";
import {useContext, useState} from "preact/hooks";
import {AuthContext} from "../../context/AuthContext.tsx";


/**
 * todo
 *   These fields are to be updated
 *      - add author (the og one) under the title
 *      - change date to upload date
 *      - add date next to author
 *      - category on the bottom
 *   The last two category projects are different
 *      - it has category, title, upload date
 */

export interface DocumentCardProps {
    document: any;
    onClick: () => void;
    categories?: any[]; // Passed from parent
}

export function DocumentCard({document, onClick, categories = []}: DocumentCardProps) {
    const {isAuthenticated} = useContext(AuthContext);
    const [imageLoaded, setImageLoaded] = useState(false);

    const isPublic = document.visibility === 'PUBLIC';
    const visibilityLabel = isPublic ? 'Javno' : 'OKIRU';
    const visibilityTooltip = isPublic ? 'Vidljivo svim posjetiteljima' : 'Vidljivo isključivo prijavljenim korisnicima';

    // Co-creators / Creators
    const allProfiles = [
        document.profiles?.creatorProfile,
        ...(document.profiles?.coCreatorProfiles || [])
    ].filter(Boolean);
    const profiles = Array.from(new Map(allProfiles.map(p => [p.email, p])).values());

    // Mentors
    const allMentors = document.profiles?.mentorProfiles || [];
    const mentors = Array.from(new Map(allMentors.map(p => [p.email, p])).values());

    // Determine upload date (prefer publication date if published, fallback to creation)
    const uploadDateRaw = document.publicationDate || document.creationDate;
    const uploadDate = formatDateObj(uploadDateRaw);

    // Categories
    const categoryCode = document.restorationData?.category || 'UNSPECIFIED';

    const categoryDisplay = categories.find(c => c.id === categoryCode)?.name
        || categoryCode.replace(/_/g, ' ');

    // Avatar rendering helper with clickable links and overflow protection
    const renderAvatars = (people: any[], badgeColors: string) => {
        const maxVisible = 6;
        const visible = people.slice(0, maxVisible);
        const excess = people.length - maxVisible;

        return (
            <div className="flex flex-nowrap gap-1.5 overflow-hidden">
                {visible.map((person, idx) => {
                    const initials = `${person.name.charAt(0)}${person.surname.charAt(0)}`.toUpperCase();
                    return (
                        <a
                            key={idx}
                            href={`/profil/${encodeURIComponent(person.email)}`}
                            className={`w-6 h-6 shrink-0 flex items-center justify-center border rounded-full text-[9px] font-bold transition-colors ${badgeColors}`}
                            title={`${person.name} ${person.surname}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {initials}
                        </a>
                    );
                })}
                {excess > 0 && (
                    <div
                        className="w-6 h-6 shrink-0 flex items-center justify-center bg-slate-50 text-slate-400 border border-slate-200 rounded-full text-[9px] font-bold"
                        title={`Još ${excess}`}
                    >
                        +{excess}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            onClick={onClick}
            className="flex flex-col h-full bg-white border border-slate-200 rounded-md shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer"
        >
            {/* Draft Status */}
            {!document.isPublished && (
                <span
                    className="absolute top-3 left-3 bg-yellow-100 text-yellow-800 border border-yellow-300 text-[10px] px-2 py-1 uppercase tracking-wider font-bold rounded-sm z-10 shadow-sm">
                    U izradi
                </span>
            )}

            {/* Visibility Tag */}
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

            {/* Image Container */}
            <div
                className="h-44 bg-slate-50 border-b border-slate-100 overflow-hidden relative flex items-center justify-center shrink-0">
                {document.files?.coverPath ? (
                    <>
                        {!imageLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-100">
                                <svg className="animate-spin h-6 w-6 text-slate-300" xmlns="http://www.w3.org/2000/svg"
                                     fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        )}
                        <img
                            src={getDownloadUrl(document.files.coverPath)}
                            alt=""
                            onLoad={() => setImageLoaded(true)}
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        />
                    </>
                ) : (
                    <IconImagePlaceholder/>
                )}
            </div>

            {/* Card Content */}
            <div className="p-4 text-xs text-slate-700 flex flex-col flex-1 bg-white z-10 text-left">

                {/* Header Row: Inventory Number & Upload Date */}
                {(document.restorationData?.inventoryNumber || uploadDate) && (
                    <div className="flex justify-between items-start text-slate-500 mb-2 gap-2">
                        {document.restorationData?.inventoryNumber ? (
                            <span
                                className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 truncate min-w-0"
                                title={document.restorationData.inventoryNumber}>
                                {document.restorationData.inventoryNumber}
                            </span>
                        ) : <span className="min-w-0"/>}
                        {uploadDate && (
                            <span className="font-medium text-[10px] shrink-0 text-slate-400" title="Datum objave">
                                {uploadDate}
                            </span>
                        )}
                    </div>
                )}

                {/* Category Label */}
                {categoryCode !== 'UNSPECIFIED' && (
                    <div className="mb-1 truncate">
                        <span
                            className="inline-block px-2  text-slate-500 text-[12px] font-bold tracking-wide truncate max-w-full"
                            title={categoryDisplay}>
                            {categoryDisplay}
                        </span>
                    </div>
                )}

                {/* Name */}
                <div className="flex flex-col items-center justify-center min-h-[44px] mb-1.5">
                    <p className="font-bold text-sm text-slate-900 line-clamp-2 text-center w-full"
                       title={document.restorationData?.name}>
                        {document.restorationData?.name}
                    </p>
                </div>


                <div className="flex flex-col gap-1 mb-3">
                    {/* Author */}
                    {document.restorationData?.author && (
                        <p className="text-[11px] text-slate-600 truncate" title={document.restorationData.author}>
                            <span
                                className="font-semibold text-slate-900">Autor:</span> {document.restorationData.author}
                        </p>
                    )}

                    {/* Date */}
                    {document.restorationData?.date && (
                        <p className="text-[11px] text-slate-600 truncate" title={document.restorationData.date}>
                            <span
                                className="font-semibold text-slate-900">Datacija:</span> {document.restorationData.date}
                        </p>
                    )}

                    {/* Technique */}
                    {document.restorationData?.technique && (
                        <p className="text-[11px] text-slate-600 truncate" title={document.restorationData.technique}>
                            <span
                                className="font-semibold text-slate-900">Tehnika:</span> {document.restorationData.technique}
                        </p>
                    )}
                </div>

                {/* Footer block */}
                <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-3">

                    {/* Creators */}
                    {isAuthenticated && profiles.length > 0 && (
                        <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Autori
                                projekta</p>
                            {renderAvatars(profiles, "bg-slate-100 text-slate-600 border-slate-300 hover:bg-blue-900 hover:text-white hover:border-blue-900")}
                        </div>
                    )}

                    {/* Mentors */}
                    {isAuthenticated && mentors.length > 0 && (
                        <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Mentori</p>
                            {renderAvatars(mentors, "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-900 hover:text-white hover:border-blue-900")}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}