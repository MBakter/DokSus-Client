import {DocumentCard} from "../components/feature/DocumentCard.tsx";
import {route} from "preact-router";
import {useEffect, useState} from "preact/hooks";
import {useCategoryReference} from "../data/reference/ReferenceData.ts";
import type {Document, PaginatedResponse} from "../data/types/Document.ts";
import {fetchDocuments} from "../api/feature/DocumentApi.ts";

interface GroupPageProps {
    id: string;
    url?: string;
}

export function GroupPage({ id, url }: GroupPageProps) {
    const decodedGroupName = decodeURIComponent(id);
    const [documents, setDocuments] = useState<Document[]>([]);

    // Pagination state
    const [totalElements, setTotalElements] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const { categories } = useCategoryReference();

    const searchParams = new URLSearchParams(url?.split('?')[1] || typeof window !== 'undefined' ? window.location.search : '');
    const currentPage = parseInt(searchParams.get('page') || '0', 10);

    // Fetch documents directly using the decoded group name from the route
    useEffect(() => {
        const loadGroupDocs = async () => {
            setIsLoading(true);
            try {
                const data: PaginatedResponse<Document> = await fetchDocuments(currentPage, null, null, decodedGroupName);

                setDocuments(data.content || []);
                setTotalPages(data.page?.totalPages || 1);
                setTotalElements(data.page?.totalElements || 0);

            } catch (error) {
                console.error("Failed to load group documents", error);
                setDocuments([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadGroupDocs();
    }, [decodedGroupName, currentPage]);

    const changePage = (newPage: number) => {
        route(`/group/${id}?page=${newPage}`);
    };

    return (
        <div className="w-full flex flex-col items-center pb-16 bg-slate-50 min-h-screen">

            {/* Group Banner */}
            <div className="w-full bg-white border-b border-slate-200 py-12 mb-10 shadow-sm flex justify-center">
                <div className="w-full max-w-6xl px-4 lg:px-0 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">Zbirka / Grupa</span>
                        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                            {decodedGroupName}
                        </h1>
                    </div>

                    {/* The requested Project Count Badge */}
                    <div className="bg-slate-100 border border-slate-200 px-5 py-3 rounded-lg flex items-center gap-3">
                        <div className="text-blue-900 font-bold text-2xl leading-none">
                            {totalElements}
                        </div>
                        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider leading-tight">
                            Objavljenih<br/>Projekata
                        </div>
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
                <div className="w-full max-w-6xl px-4 lg:px-0 flex flex-col items-center">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
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
                                Ova zbirka trenutno nema javno objavljenih dokumenata.
                            </p>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex items-center gap-2">
                            <button
                                disabled={currentPage === 0}
                                onClick={() => changePage(currentPage - 1)}
                                className="w-10 h-10 flex items-center justify-center border border-slate-300 bg-white text-slate-600 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold shadow-sm"
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
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}