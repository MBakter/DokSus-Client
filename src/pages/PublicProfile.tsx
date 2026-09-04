import {useContext, useEffect, useState} from 'preact/hooks';
import {type Document} from '../data/types/Document';
import type {UserProfile} from "../data/types/UserProfile.ts";
import {fetchSingleUserProfile} from "../api/feature/UserProfileApi.ts";
import {fetchUserPublishedDocuments} from "../api/feature/DocumentApi.ts";
import {DocumentCard} from "../components/feature/DocumentCard.tsx";
import {route} from "preact-router";
import {AuthContext} from "../context/AuthContext.tsx";
import {useCategoryReference} from "../data/reference/ReferenceData.ts";

interface PublicProfileProps {
    email?: string; // Automatically injected by preact-router from the URL
}

export function PublicProfile({ email }: PublicProfileProps) {
    const { isAuthenticated } = useContext(AuthContext);
    const [createdDocs, setCreatedDocs] = useState<Document[]>([]);
    const [coCreatedDocs, setCoCreatedDocs] = useState<Document[]>([]);
    const [mentoredDocs, setMentoredDocs] = useState<Document[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { categories } = useCategoryReference();

    useEffect(() => {
        if (email) {
            loadData(decodeURIComponent(email));
        }
    }, [email]);

    const loadData = async (targetEmail: string) => {
        setIsLoading(true);
        try {
            const [userProfile, publicDocs] = await Promise.all([
                fetchSingleUserProfile(targetEmail),
                fetchUserPublishedDocuments(targetEmail)
            ]);

            setProfile(userProfile);

            // Set exact unique count from the backend
            setTotalDocs(publicDocs.length);

            // Separate documents locally based on roles
            setCreatedDocs(publicDocs.filter(doc => doc.creatorEmail === targetEmail));

            setCoCreatedDocs(publicDocs.filter(doc =>
                doc.coCreatorEmails?.includes(targetEmail) ||
                doc.profiles?.coCreatorProfiles?.some((p: any) => p.email === targetEmail)
            ));

            setMentoredDocs(publicDocs.filter(doc =>
                doc.mentorEmails?.includes(targetEmail) ||
                doc.profiles?.mentorProfiles?.some((p: any) => p.email === targetEmail)
            ));

        } catch (error) {
            console.error("Failed to load profile data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const profileEmail = profile?.email || (email ? decodeURIComponent(email) : '');

    return (
        <div className="w-full flex flex-col items-center pb-12">

            {/* User Profile Header */}
            <div className="w-full max-w-6xl bg-white border border-slate-200 rounded-md p-6 mb-10 shadow-sm flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-900 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-sm">
                    {profile
                        ? `${profile.name.charAt(0)}${profile.surname.charAt(0)}`.toUpperCase()
                        : '👤'}
                </div>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {profile ? `${profile.name} ${profile.surname}` : 'Korisnički profil'}
                    </h1>

                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        {profile && (
                            <span>Ukupno <strong>{totalDocs}</strong> javnih dokumenata</span>
                        )}

                        {/* Display contact email ONLY if logged in */}
                        {isAuthenticated && (
                            <>
                                {profile && <span className="text-slate-300">•</span>}
                                <span className="flex items-center gap-1.5">
                                    Kontakt: {' '}
                                    <a
                                        href={`mailto:${profileEmail}`}
                                        className="text-blue-700 font-medium hover:underline"
                                    >
                                        {profileEmail}
                                    </a>
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full max-w-6xl flex flex-col gap-12">

                {isLoading ? (
                    <div className="py-10 text-slate-500 font-medium">Učitavanje profila...</div>
                ) : (
                    <>
                        {/* Section 1: Owned Projects */}
                        <div>
                            <div className="flex items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800 whitespace-nowrap">Vlastiti projekti (Vlasnik)</h2>
                                <div className="ml-4 flex-1 border-t border-slate-200"></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {createdDocs.map((doc) => (
                                    <DocumentCard
                                        key={doc.id}
                                        document={doc}
                                        categories={categories}
                                        onClick={() => route(`/dokument/${doc.id}`)}
                                    />
                                ))}
                                {createdDocs.length === 0 && (
                                    <p className="col-span-full text-slate-500 italic py-2">
                                        Ovaj korisnik trenutno nema vlastitih javno objavljenih dokumenata.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Co-created Projects */}
                        {coCreatedDocs.length > 0 && (
                            <div>
                                <div className="flex items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-800 whitespace-nowrap">Projekti u suradnji (Koautor)</h2>
                                    <div className="ml-4 flex-1 border-t border-slate-200"></div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {coCreatedDocs.map((doc) => (
                                        <DocumentCard
                                            key={doc.id}
                                            document={doc}
                                            categories={categories}
                                            onClick={() => route(`/dokument/${doc.id}`)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section 3: Mentored Projects (Professors Only) */}
                        {mentoredDocs.length > 0 && (
                            <div>
                                <div className="flex items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-800 whitespace-nowrap">Projekti pod mentorstvom (Mentor)</h2>
                                    <div className="ml-4 flex-1 border-t border-slate-200"></div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {mentoredDocs.map((doc) => (
                                        <DocumentCard
                                            key={doc.id}
                                            document={doc}
                                            categories={categories}
                                            onClick={() => route(`/dokument/${doc.id}`)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}