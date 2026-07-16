import { useContext, useEffect, useState } from 'preact/hooks';
import { AuthContext } from '../context/AuthContext';
import { fetchMyDocuments } from '../api/DocumentApi';
import type {Document} from '../types/Document';

export function Account() {
    const { user, logout } = useContext(AuthContext);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-6xl">
            {docs.map((doc) => (
                <div key={doc.id} className="border border-blue-900 flex flex-col h-80 bg-orange-50 relative">
                    {!doc.isPublished && (
                        <span className="absolute top-2 right-2 bg-yellow-200 text-yellow-800 text-xs px-2 py-1 border border-yellow-400 font-semibold">
                            U izradi (Privatno)
                        </span>
                    )}
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
            {docs.length === 0 && (
                <p className="text-gray-500 italic py-4">Nema pronađenih dokumenata u ovoj kategoriji.</p>
            )}
        </div>
    );

    return (
        <div className="w-full flex flex-col items-center pb-12">

            {/* User Data Header */}
            <div className="w-full max-w-6xl bg-white border border-blue-900 p-6 mb-10 flex justify-between items-start shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 mb-2">Moj Račun</h1>
                    <div className="flex flex-col gap-1 text-gray-700">
                        <p><span className="font-semibold w-20 inline-block">Ime:</span> {user.name}</p>
                        <p><span className="font-semibold w-20 inline-block">Prezime:</span> {user.surname}</p>
                        <p><span className="font-semibold w-20 inline-block">Email:</span> {user.email}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="px-6 py-2 bg-blue-900 text-white font-medium hover:bg-blue-800 transition-colors"
                >
                    Odjava
                </button>
            </div>

            {isLoading ? (
                <div className="py-20 text-gray-500">Učitavanje dokumenata...</div>
            ) : (
                <div className="w-full max-w-6xl flex flex-col gap-12">

                    {/* Private Documents Section */}
                    <section>
                        <div className="flex items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 whitespace-nowrap">Privatni projekti</h2>
                            <div className="ml-4 flex-1 border-t border-gray-300"></div>
                        </div>
                        {renderDocumentGrid(privateDocuments)}
                    </section>

                    {/* Public Documents Section */}
                    <section>
                        <div className="flex items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 whitespace-nowrap">Objavljeni projekti</h2>
                            <div className="ml-4 flex-1 border-t border-gray-300"></div>
                        </div>
                        {renderDocumentGrid(publicDocuments)}
                    </section>

                </div>
            )}
        </div>
    );
}