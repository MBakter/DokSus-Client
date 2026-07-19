import {useState, useEffect} from 'preact/hooks';
import { route } from 'preact-router';
import type {Document} from '../types/Document.ts';
import {fetchDocuments} from "../api/DocumentApi.ts";

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

            {/* Top Categories Grid */}
            <div className="flex flex-wrap justify-center gap-6 mb-10 w-full max-w-5xl">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className={`w-48 h-56 flex items-center justify-center text-center p-4 border border-blue-900 transition-colors duration-200
                            ${selectedCategory === cat ? 'bg-blue-200' : 'bg-blue-50 hover:bg-blue-100'}
                        `}
                    >
                        <span className="font-medium text-gray-800 text-sm">{cat}</span>
                    </button>
                ))}
            </div>

            {/* Divider Line */}
            <div className="w-full max-w-6xl flex items-center mb-8">
                <div className="flex-1 border-t border-blue-900"></div>
                <span className="px-4 text-gray-800 font-medium">
                    {selectedCategory ? selectedCategory : "Sve"}
                </span>
                <div className="flex-1 border-t border-blue-900"></div>
            </div>

            {/* Documents Grid */}
            {isLoading ? (
                <div className="py-20 text-gray-500">Učitavanje...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-6xl">
                    {documents.map((doc) => (
                        <div key={doc.id} className="border border-blue-900 flex flex-col h-80 bg-orange-50">
                            <div className="flex-1 flex items-center justify-center border-b border-blue-900">
                                <span className="text-4xl text-gray-400">🖼️</span>
                            </div>

                            <div className="p-3 text-xs text-gray-800 flex flex-col gap-1">
                                <p><span className="font-semibold">Broj OKIRU:</span> {doc.content.invNumber}</p>
                                <p className="truncate"><span className="font-semibold">Naslov:</span> {doc.content.name}</p>
                                <p className="truncate"><span className="font-semibold">Autor:</span> {doc.content.author}</p>
                                <p><span className="font-semibold">Datacija:</span> {doc.content.date}</p>
                                <p className="truncate"><span className="font-semibold">Tehnika:</span> {doc.content.technique}</p>
                            </div>
                        </div>
                    ))}
                    {documents.length === 0 && (
                        <p className="col-span-full text-center text-gray-500 italic py-4">Nema pronađenih dokumenata.</p>
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
                <div className="mt-12 flex gap-4">
                    <button
                        disabled={currentPage === 0}
                        onClick={() => changePage(currentPage - 1)}
                        className="px-4 py-2 border border-blue-900 bg-white disabled:opacity-50"
                    >
                        Prethodna
                    </button>
                    <span className="px-4 py-2 text-gray-800">
                        Stranica {currentPage + 1} od {totalPages}
                    </span>
                    <button
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => changePage(currentPage + 1)}
                        className="px-4 py-2 border border-blue-900 bg-white disabled:opacity-50"
                    >
                        Sljedeća
                    </button>
                </div>
            )}
        </div>
    );
}