import {useEffect, useRef, useState} from "preact/hooks";
import type {UserProfile} from "../../../types/UserProfile.ts";
import {getDownloadUrl, getInitials} from "../../../util/Utilities.ts";
import {
    IconGlobe, IconImageAdd, IconImageEdit, IconInstitution,
    IconSearch, IconTrash,
    IconUsers,
    IconX
} from "../../../assets/Icons.tsx";
import {searchUsersByQuery} from "../../../api/feature/UserProfileApi.ts";
import {Visibility} from "../../../types/Document.ts";

interface CoverPhotoProps {
    coverFile: File | null;
    serverCover: string;
    coverPreviewUrl: string | null;
    onChange: (e: Event) => void;
    onRemove: () => void;
}

interface CoAuthorsSectionProps {
    selectedAuthors: UserProfile[];
    onAddAuthor: (author: UserProfile) => void;
    onRemoveAuthor: (email: string) => void;
}

export function ProjectSettings({ metadata, fileManager }: any) {
    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-2">Postavke projekta</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VisibilitySection
                    visibility={metadata.visibility}
                    onChange={metadata.setVisibility}
                />

                <CoverPhotoSection
                    coverFile={fileManager.files.cover}
                    serverCover={fileManager.serverPaths.cover}
                    coverPreviewUrl={fileManager.coverPreviewUrl}
                    onChange={fileManager.handleSingleFileChange('cover')}
                    onRemove={fileManager.handleRemoveCover}
                />
            </div>

            <CoAuthorsSection
                selectedAuthors={metadata.coAuthors}
                onAddAuthor={metadata.handleAddCoAuthor}
                onRemoveAuthor={metadata.handleRemoveCoAuthor}
            />
        </div>
    );
}

export function VisibilitySection({ visibility, onChange }: { visibility: Visibility, onChange: (val: Visibility) => void }) {
    return (
        <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col h-full relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-slate-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>

            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
                <span>Vidljivost projekta</span>
            </h2>

            <div className="flex flex-col gap-3 flex-grow justify-center relative z-10">
                <button
                    type="button"
                    onClick={() => onChange(Visibility.PUBLIC)}
                    className={`flex items-center text-left gap-4 p-4 border rounded-lg transition-all duration-200 group ${
                        visibility === Visibility.PUBLIC
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-md transform scale-[1.02]'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white hover:shadow-sm'
                    }`}
                >
                    <div className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                        visibility === Visibility.PUBLIC ? 'bg-blue-100' : 'bg-slate-200'
                    }`}>
                        <IconGlobe className={`transition-colors ${
                            visibility === Visibility.PUBLIC ? 'w-6 h-6 text-blue-600' : 'w-6 h-6 text-slate-400 group-hover:text-slate-500'
                        }`} />
                    </div>
                    <div>
                        <span className={`font-bold text-sm block ${visibility === Visibility.PUBLIC ? 'text-blue-900' : 'text-slate-600'}`}>Javno (Public)</span>
                        <span className={`text-xs opacity-90 ${visibility === Visibility.PUBLIC ? 'text-blue-900' : 'text-slate-600'}`}>Vidljivo svim posjetiteljima platforme.</span>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => onChange(Visibility.OKIRU)}
                    className={`flex items-center text-left gap-4 p-4 border rounded-lg transition-all duration-200 group ${
                        visibility === Visibility.OKIRU
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-md transform scale-[1.02]'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white hover:shadow-sm'
                    }`}
                >
                    <div className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                        visibility === Visibility.OKIRU ? 'bg-blue-100' : 'bg-slate-200'
                    }`}>
                        <IconInstitution className={`transition-colors ${
                            visibility === Visibility.OKIRU ? 'w-6 h-6 text-blue-600' : 'w-6 h-6 text-slate-400 group-hover:text-slate-500'
                        }`} />
                    </div>
                    <div>
                        <span className={`font-bold text-sm block ${visibility === Visibility.OKIRU ? 'text-blue-900' : 'text-slate-600'}`}>Interno (OKIRU)</span>
                        <span className={`text-xs opacity-90 ${visibility === Visibility.OKIRU ? 'text-blue-900' : 'text-slate-600'}`}>Vidljivo isključivo prijavljenim korisnicima.</span>
                    </div>
                </button>
            </div>
        </section>
    );
}

export function CoverPhotoSection({ serverCover, coverPreviewUrl, onChange, onRemove }: CoverPhotoProps) {
    const hasImage = !!(coverPreviewUrl || serverCover);

    return (
        <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
                Naslovna fotografija
            </h2>

            <div className="flex flex-col flex-grow justify-center w-full">
                <label className="relative group cursor-pointer block w-full max-w-[200px] mx-auto aspect-square rounded-xl overflow-hidden border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 transition-all duration-300 shadow-inner">

                    {hasImage ? (
                        <>
                            <img
                                src={coverPreviewUrl ? coverPreviewUrl : getDownloadUrl(serverCover)}
                                alt="Naslovna"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />

                            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white">
                                <IconImageEdit className="w-8 h-8 text-white mb-2 drop-shadow-md" />
                                <span className="text-sm font-semibold drop-shadow-md">Promijeni</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 group-hover:text-blue-500 transition-colors">
                            <IconImageAdd className="w-10 h-10 text-slate-400 group-hover:text-blue-500 transition-colors mb-2" />
                            <span className="text-sm font-medium text-center px-4 group-hover:text-blue-500">Kliknite za odabir</span>
                        </div>
                    )}

                    <input type="file" accept="image/*" className="hidden" onChange={onChange} />
                </label>

                <div className="flex justify-between items-center mt-5">
                    <p className="text-xs text-slate-500">
                        Prikazuje se u pretraživaču.
                    </p>

                    {hasImage && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRemove();
                            }}
                            className="group flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 py-1.5 px-3 rounded-md transition-all"
                            title="Ukloni sliku"
                        >
                            <IconTrash className="w-4 h-4 text-slate-500 group-hover:text-red-600 transition-colors" />
                            <span>Obriši</span>
                        </button>
                    )}
                </div>
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