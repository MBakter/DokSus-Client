import { useEffect, useState } from 'preact/hooks';
import {type Document } from '../types/Document';
import type {UserProfile} from "../types/UserProfile.ts";
import {fetchSingleUserProfile} from "../api/feature/UserProfileApi.ts";
import {fetchUserPublishedDocuments} from "../api/feature/DocumentApi.ts";
import {DocumentCard} from "../components/feature/DocumentCard.tsx";

interface PublicProfileProps {
    email?: string; // Automatically injected by preact-router from the URL
}

export function PublicProfile({ email }: PublicProfileProps) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (email) {
            loadData(decodeURIComponent(email));
        }
    }, [email]);

    const loadData = async (targetEmail: string) => {
        setIsLoading(true);
        try {
            // Fetch both the user's info and their public documents concurrently
            const [userProfile, publicDocs] = await Promise.all([
                fetchSingleUserProfile(targetEmail),
                fetchUserPublishedDocuments(targetEmail)
            ]);

            setProfile(userProfile);
            setDocuments(publicDocs);
        } catch (error) {
            console.error("Failed to load profile data", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center pb-12">

            {/* User Profile Header */}
            <div className="w-full max-w-6xl bg-white border border-slate-200 rounded-md p-6 mb-10 shadow-sm flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-900 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-sm">
                    {profile
                        ? `${profile.name.charAt(0)}${profile.surname.charAt(0)}`.toUpperCase()
                        : '👤'}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {profile ? `${profile.name} ${profile.surname}` : 'Korisnički profil'}
                    </h1>
                    {profile && (
                        <p className="text-sm text-slate-500 mt-1">
                            {profile.role === 'ROLE_ADMIN' ? 'Administrator' : 'Korisnik'}
                            {' • '}{documents.length} javnih dokumenata
                        </p>
                    )}
                </div>
            </div>

            {/* Documents Grid */}
            <div className="w-full max-w-6xl">
                <div className="flex items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800 whitespace-nowrap">Objavljeni projekti</h2>
                    <div className="ml-4 flex-1 border-t border-slate-200"></div>
                </div>

                {isLoading ? (
                    <div className="py-10 text-slate-500 font-medium">Učitavanje profila...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {documents.map((doc) => (
                            <DocumentCard key={doc.id} document={doc} showAuthorIcon={false} />
                        ))}
                        {documents.length === 0 && (
                            <p className="col-span-full text-slate-500 italic py-4">
                                Ovaj korisnik trenutno nema javno objavljenih dokumenata.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}