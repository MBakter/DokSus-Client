import {useState, useEffect} from 'preact/hooks';
import { route } from 'preact-router';
import type {Document} from '../types/Document.ts';
import {fetchDocuments} from "../api/feature/DocumentApi.ts";
import {DocumentCard} from "../components/feature/DocumentCard.tsx";

const CATEGORIES = [
    "DRVENI PREDMETI",
    "SLIKE NA PLATNU",
    "ZIDNE SLIKE",
    "KAMENA I ARHITEKTONSKA PLASTIKA",
    "OSTALI MATERIJALI",
    "REFERENTNA ISTRAŽIVANJA",
    "DIPLOMSKI I SEMINARSKI RADOVI"
];

interface HomeProps {
    url?: string; // Injected automatically by preact-router
}

export function Home({ url }: HomeProps) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [isCategoriesOpen, setIsCategoriesOpen] = useState<boolean>(true);

    // Parse the current state directly from the injected URL
    const searchParams = new URLSearchParams(url?.split('?')[1] || typeof window !== 'undefined' ? window.location.search : '');
    const searchQuery = searchParams.get('search') || '';
    const selectedCategory = searchParams.get('category') || null;
    const currentPage = parseInt(searchParams.get('page') || '0', 10);

    // API call triggers automatically when the URL parameters change
    useEffect(() => {
        loadDocuments(currentPage, selectedCategory, searchQuery);
    }, [currentPage, selectedCategory, searchQuery]);

    const loadDocuments = async (page: number, category: string | null, search: string) => {
        setIsLoading(true);
        try {
            const data = await fetchDocuments(page, category, search);
            setDocuments(data.content);
            setTotalPages(data.totalPages);
            console.log("Loaded documents")
        } catch (error) {
            console.error("Failed to load documents", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryClick = (category: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (selectedCategory === category) {
            params.delete('category');
        } else {
            params.set('category', category);
            setIsCategoriesOpen(false);
        }

        params.delete('page'); // Reset to the first page when changing filters
        route(`/?${params.toString()}`);
    };

    const changePage = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        route(`/?${params.toString()}`);
    };

    return (
        <div className="w-full flex flex-col items-center">

            {/* Interactive Title Header / Divider */}
            <div
                className="w-full max-w-6xl flex items-center mt-4 mb-6 cursor-pointer group"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                title={isCategoriesOpen ? "Zatvori kategorije" : "Otvori kategorije"}
            >
                <div className="flex-1 border-t border-blue-900 transition-colors group-hover:border-blue-600"></div>
                <div className="px-4 text-gray-800 font-medium flex items-center gap-2 transition-colors group-hover:text-blue-600 select-none">
                    <span>{selectedCategory ? selectedCategory : "Sve Kategorije"}</span>
                    <span
                        className={`text-xs transform transition-transform duration-300 ease-in-out ${isCategoriesOpen ? 'rotate-180' : 'rotate-0'}`}
                    >
                        ▼
                    </span>
                </div>
                <div className="flex-1 border-t border-blue-900 transition-colors group-hover:border-blue-600"></div>
            </div>

            {/* Animated Categories Grid Wrapper */}
            <div
                className={`grid transition-[grid-template-rows] duration-500 ease-in-out w-full max-w-5xl ${
                    isCategoriesOpen ? 'grid-rows-[1fr] mb-8' : 'grid-rows-[0fr] mb-0'
                }`}
            >
                <div className="overflow-hidden w-full flex flex-wrap justify-center gap-6">
                    <div className="flex flex-wrap justify-center gap-6 w-full pb-2 pt-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCategoryClick(cat);
                                }}
                                // Redesigned Category Buttons
                                className={`w-48 h-40 flex items-center justify-center text-center p-4 border rounded-md shadow-sm transition-all duration-200
                                    ${selectedCategory === cat
                                    ? 'border-blue-700 bg-blue-50 ring-1 ring-blue-700 text-blue-900 font-bold shadow-md'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:shadow hover:text-blue-800'
                                }
                                `}
                            >
                                <span className="text-sm tracking-wide leading-relaxed">{cat}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Documents Grid */}
            {isLoading ? (
                <div className="py-20 text-slate-500 font-medium">Učitavanje...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                    {documents.map((doc) => (
                        <DocumentCard key={doc.id} document={doc} showAuthorIcon={true} />
                    ))}
                    {documents.length === 0 && (
                        <p className="col-span-full text-center text-slate-500 italic py-4">Nema pronađenih dokumenata.</p>
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
                <div className="mt-12 flex gap-4">
                    <button
                        disabled={currentPage === 0}
                        onClick={() => changePage(currentPage - 1)}
                        className="px-4 py-2 border border-blue-900 bg-white disabled:opacity-50 transition-opacity cursor-pointer"
                    >
                        Prethodna
                    </button>
                    <span className="px-4 py-2 text-gray-800 font-medium">
                        Stranica {currentPage + 1} od {totalPages}
                    </span>
                    <button
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => changePage(currentPage + 1)}
                        className="px-4 py-2 border border-blue-900 bg-white disabled:opacity-50 transition-opacity cursor-pointer"
                    >
                        Sljedeća
                    </button>
                </div>
            )}
        </div>
    );
}