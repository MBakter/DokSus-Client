import {useEffect, useRef, useState} from "preact/hooks";
import type {UserProfile} from "../../../../data/types/UserProfile.ts";
import {searchUsersByQuery} from "../../../../api/feature/UserProfileApi.ts";

interface UserSelectorProps {
    title: string;
    icon: React.ReactNode;
    selectedUsers: UserProfile[];
    onAddUser: (user: UserProfile) => void;
    onRemoveUser: (email: string) => void;
    isProfessorOnly?: boolean;
    placeholder: string;
    emptyText: string;
    isRequired?: boolean;
}

export function UserSelector(
    {
        title,
        icon,
        selectedUsers = [],
        onAddUser,
        onRemoveUser,
        isProfessorOnly,
        placeholder,
        emptyText,
        isRequired
    }: UserSelectorProps) {
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
                // Call API with optional professor filter
                const results: UserProfile[] = await searchUsersByQuery(searchQuery, isProfessorOnly);

                // Filter out already selected users
                const available = results.filter(user =>
                    !selectedUsers.some(selected => selected.email === user.email)
                );

                setSearchResults(available);
            } catch (error) {
                console.error("Error searching users", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const debounceTimer = setTimeout(fetchResults, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, selectedUsers, isProfessorOnly]);

    const handleSelect = (user: UserProfile) => {
        onAddUser(user);
        setSearchQuery('');
        setShowDropdown(false);
    };

    const getInitials = (name: string, surname: string) => {
        return `${name?.[0] || ''}${surname?.[0] || ''}`.toUpperCase();
    };

    return (
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm relative" ref={dropdownRef}>
            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
                {icon}
                {title}
                {isRequired && (
                    <span className="text-red-500 font-bold ml-0.5" title="Obavezno polje">*</span>
                )}
            </h2>

            {/* Selected Users Display */}
            {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6">
                    {selectedUsers.map(user => (
                        <div key={user.email}
                             className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full pl-2 pr-4 py-1.5 shadow-sm">
                            <div
                                className="w-7 h-7 flex items-center justify-center bg-blue-900 text-white rounded-full text-[10px] font-bold shrink-0">
                                {getInitials(user.name, user.surname)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-800 leading-none mb-0.5">
                                    {user.name} {user.surname}
                                </span>
                            </div>
                            <button
                                onClick={() => onRemoveUser(user.email)}
                                className="ml-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full p-1 transition-colors"
                                title="Ukloni"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-base rounded-md px-4 py-2.5 transition-all focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 placeholder:text-slate-400 shadow-sm"
                />

                {/* Dropdown Results */}
                {showDropdown && (
                    <div
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-md shadow-lg z-50 p-4 max-h-80 overflow-y-auto">
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
                                        <div
                                            className="w-12 h-12 flex items-center justify-center bg-slate-200 text-slate-600 rounded-full text-base font-bold mb-3 group-hover:bg-blue-900 group-hover:text-white transition-colors">
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
                            <p className="text-sm text-slate-500 text-center py-4">{emptyText}</p>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}