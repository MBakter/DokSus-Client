import { useContext, useEffect, useState } from 'preact/hooks';
import { AuthContext } from '../context/AuthContext';
import { fetchMyDocuments } from '../api/feature/DocumentApi.ts';
import type {Document} from '../types/Document';
import {DocumentCard} from "../components/feature/DocumentCard.tsx";
import {route} from "preact-router";

export function Account() {
    const { user } = useContext(AuthContext);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadMyDocuments();
    }, []);

    const loadMyDocuments = async () => {
        setIsLoading(true);
        try {
            const data = await fetchMyDocuments();
            setDocuments(data);
        } catch (error) {
            console.error("Failed to load user documents", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return null; // Safety check, layout shouldn't render this if logged out
    }

    const privateDocuments = documents.filter(doc => !doc.isPublished);
    const publicDocuments = documents.filter(doc => doc.isPublished);

    const renderDocumentGrid = (docs: Document[]) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
            {docs.map((doc) => (
                <DocumentCard
                    key={doc.id}
                    document={doc}
                    showAuthorIcon={false}
                    onClick={() => route(`/uredi/${doc.id}`)} // Routes to the editor
                />
            ))}
            {docs.length === 0 && (
                <p className="text-slate-500 italic py-4">Nema pronađenih dokumenata u ovoj kategoriji.</p>
            )}
        </div>
    );

    return (
        <div className="w-full flex flex-col items-center pb-12">

            {/* User Data Header */}
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 mb-8 tracking-tight">Moji projekti</h1>
                </div>

            {isLoading ? (
                <div className="py-20 text-slate-500 font-medium">Učitavanje dokumenata...</div>
            ) : (
                <div className="w-full max-w-6xl flex flex-col gap-12">
                    {/* Private Documents Section */}
                    <section>
                        <div className="flex items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 whitespace-nowrap">Privatni projekti</h2>
                            <div className="ml-4 flex-1 border-t border-slate-200"></div>
                        </div>
                        {renderDocumentGrid(privateDocuments)}
                    </section>

                    {/* Public Documents Section */}
                    <section>
                        <div className="flex items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 whitespace-nowrap">Objavljeni projekti</h2>
                            <div className="ml-4 flex-1 border-t border-slate-200"></div>
                        </div>
                        {renderDocumentGrid(publicDocuments)}
                    </section>
                </div>
            )}
        </div>
    );
}