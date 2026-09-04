import {useEffect, useRef, useState} from 'preact/hooks';
import {route} from 'preact-router';
import type {Document, PaginatedResponse} from '../data/types/Document.ts';
import {fetchDocuments} from "../api/feature/DocumentApi.ts";
import {DocumentCard} from "../components/feature/DocumentCard.tsx";
import {type ReferenceCategory, useCategoryReference, useGroupReference} from "../data/reference/ReferenceData.ts";

interface HomeProps {
    url?: string; // Injected automatically by preact-router
}

export function Home({ url }: HomeProps) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState<boolean>(true);

    const { categories } = useCategoryReference();

    const searchParams = new URLSearchParams(url?.split('?')[1] || typeof window !== 'undefined' ? window.location.search : '');
    const searchQuery = searchParams.get('search') || '';

    // Default strictly to UNSPECIFIED so a category is ALWAYS selected
    const selectedCategory = searchParams.get('category') || 'UNSPECIFIED';
    const currentPage = parseInt(searchParams.get('page') || '0', 10);

    useEffect(() => {
        loadDocuments(currentPage, selectedCategory, searchQuery);
    }, [currentPage, selectedCategory, searchQuery]);

    const loadDocuments = async (page: number, category: string, search: string) => {
        setIsLoading(true);
        try {
            const data: PaginatedResponse<Document> = await fetchDocuments(page, category, search);

            setDocuments(data.content || []);
            setTotalPages(data.page?.totalPages || 1);

        } catch (error) {
            console.error("Failed to load documents", error);
            setDocuments([]);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryClick = (categoryName: string) => {
        if (selectedCategory === categoryName) {
            // Do nothing if clicking the already selected category (no un-selecting)
            setIsCategoriesOpen(false);
            return;
        }

        const params = new URLSearchParams(searchParams.toString());

        if (categoryName === 'UNSPECIFIED') {
            params.delete('category'); // Keep URL clean for the default state
        } else {
            params.set('category', categoryName);
        }

        params.delete('page'); // Reset to the first page when changing filters
        setIsCategoriesOpen(false);
        route(`/?${params.toString()}`);
    };

    const changePage = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        route(`/?${params.toString()}`);
    };

    const currentCategoryObj = categories.find((cat: ReferenceCategory) => cat.id === selectedCategory);
    const categoryTitle = (selectedCategory !== 'UNSPECIFIED' && currentCategoryObj)
        ? currentCategoryObj.name
        : "Sve Kategorije";

    return (
        <div className="w-full flex flex-col items-center pb-16 bg-slate-50 min-h-screen">

            {/* Interactive Title Header / Divider */}
            <div
                className="w-full max-w-6xl flex items-center mt-8 mb-6 cursor-pointer group"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                title={isCategoriesOpen ? "Zatvori kategorije" : "Otvori kategorije"}
            >
                <div className="flex-1 border-t border-slate-300 transition-colors group-hover:border-blue-400"></div>
                <div className="px-4 text-slate-700 font-bold uppercase tracking-widest text-sm flex items-center gap-2 transition-colors group-hover:text-blue-700 select-none">
                    <span>{categoryTitle}</span>
                    <span
                        className={`text-[10px] transform transition-transform duration-300 ease-in-out ${isCategoriesOpen ? 'rotate-180' : 'rotate-0'}`}
                    >
                        ▼
                    </span>
                </div>
                <div className="flex-1 border-t border-slate-300 transition-colors group-hover:border-blue-400"></div>
            </div>

            {/* Animated Categories Grid Wrapper */}
            <div
                className={`grid transition-[grid-template-rows] duration-500 ease-in-out w-full max-w-5xl ${
                    isCategoriesOpen ? 'grid-rows-[1fr] mb-8' : 'grid-rows-[0fr] mb-0'
                }`}
            >
                <div className="overflow-hidden w-full flex flex-wrap justify-center gap-6">
                    <div className="flex flex-wrap justify-center gap-4 w-full pb-2 pt-2">
                        {categories.map((category: ReferenceCategory) => (
                            <button
                                key={category.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCategoryClick(category.id);
                                }}
                                className={`w-44 h-32 flex items-center justify-center text-center p-4 border rounded-md shadow-sm transition-all duration-200
                                    ${selectedCategory === category.id
                                    ? 'border-blue-700 bg-blue-50 ring-1 ring-blue-700 text-blue-900 font-bold shadow-md'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:shadow hover:text-blue-800'
                                }
                                `}
                            >
                                <span className="text-sm font-semibold tracking-wide leading-relaxed">
                                    {category.id === 'UNSPECIFIED' ? "Sve kategorije" : category.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Documents Grid */}
            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-500">
                    <svg className="animate-spin h-8 w-8 text-blue-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-medium">Učitavanje...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl px-4 lg:px-0">
                    {documents.map((doc: Document) => (
                        <DocumentCard
                            key={doc.id}
                            document={doc}
                            categories={categories}
                            onClick={() => route(`/dokument/${doc.id}`)}
                        />
                    ))}
                    {documents.length === 0 && (
                        <p className="col-span-full text-center text-slate-500 italic py-10 border-2 border-dashed border-slate-200 rounded-md bg-white">
                            Nema pronađenih dokumenata za odabranu kategoriju.
                        </p>
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
                <div className="mt-12 flex items-center gap-2">
                    <button
                        disabled={currentPage === 0}
                        onClick={() => changePage(currentPage - 1)}
                        className="w-10 h-10 flex items-center justify-center border border-slate-300 bg-white text-slate-600 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold shadow-sm"
                        title="Prethodna stranica"
                    >
                        &lt;
                    </button>

                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => changePage(i)}
                                className={`w-10 h-10 flex items-center justify-center rounded border font-semibold transition-all shadow-sm ${
                                    currentPage === i
                                        ? 'bg-blue-900 text-white border-blue-900'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-blue-300'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => changePage(currentPage + 1)}
                        className="w-10 h-10 flex items-center justify-center border border-slate-300 bg-white text-slate-600 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold shadow-sm"
                        title="Sljedeća stranica"
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
}

export function GroupSearchAutocomplete() {
    const { groups, isLoading } = useGroupReference();
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredGroups = groups.filter(groupName =>
        groupName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div ref={wrapperRef} className="relative w-full max-w-lg z-20">
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm((e.target as HTMLInputElement).value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={isLoading ? "Učitavanje zbirki..." : "Pretraži zbirke i grupe..."}
                    disabled={isLoading}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
            </div>

            {isOpen && searchTerm.trim() !== '' && !isLoading && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {filteredGroups.length > 0 ? (
                        <div className="flex flex-col">
                            {filteredGroups.map((groupName, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setIsOpen(false);
                                        // Encoding the group name so it safely passes through the router URL
                                        route(`/group/${encodeURIComponent(groupName)}`);
                                    }}
                                    className="text-left px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-900 border-b border-slate-100 last:border-0 transition-colors"
                                >
                                    {groupName}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-4 text-sm text-slate-500 text-center italic">
                            Nema pronađenih zbirki za "{searchTerm}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}