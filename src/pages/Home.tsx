import {useState, useEffect, useContext} from 'preact/hooks';
import type {Document} from '../types/Document.ts';
import {SearchContext} from "../context/SearchContext.tsx";
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

export function Home() {
    const { searchQuery } = useContext(SearchContext);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);

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
        setSelectedCategory(prev => prev === category ? null : category);
        setCurrentPage(0);
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

            {/* Projects Grid */}
            {isLoading ? (
                <div className="py-20 text-gray-500">Učitavanje...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-6xl">
                    {documents.map((project) => (
                        <div key={project.id} className="border border-blue-900 flex flex-col h-80 bg-orange-50">
                            {/* Image Placeholder */}
                            <div className="flex-1 flex items-center justify-center border-b border-blue-900">
                                <span className="text-4xl text-gray-400">🖼️</span>
                            </div>

                            {/* Project Information */}
                            <div className="p-3 text-xs text-gray-800 flex flex-col gap-1">
                                <p><span className="font-semibold">Broj OKIRU:</span> {project.content.invNumber}</p>
                                <p className="truncate"><span className="font-semibold">Naslov:</span> {project.content.name}</p>
                                <p className="truncate"><span className="font-semibold">Autor:</span> {project.content.author}</p>
                                <p><span className="font-semibold">Datacija:</span> {project.content.date}</p>
                                <p className="truncate"><span className="font-semibold">Tehnika:</span> {project.content.technique}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
                <div className="mt-12 flex gap-4">
                    <button
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-4 py-2 border border-blue-900 bg-white disabled:opacity-50"
                    >
                        Prethodna
                    </button>
                    <span className="px-4 py-2 text-gray-800">
                        Stranica {currentPage + 1} od {totalPages}
                    </span>
                    <button
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="px-4 py-2 border border-blue-900 bg-white disabled:opacity-50"
                    >
                        Sljedeća
                    </button>
                </div>
            )}
        </div>
    );
}