import { useEffect, useState } from 'preact/hooks';
import { fetchDocumentById } from "../api/feature/DocumentApi.ts";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import '@google/model-viewer';
import {getDownloadUrl} from "../util/Utilities.ts";
import {
    IconCalendar,
    IconCube,
    IconImagePlaceholder,
    IconMentor,
    IconPDF,
    IconStudent,
    IconUser
} from "../assets/Icons.tsx";

interface DocumentViewerProps {
    id: string;
}

const getModelUrl = (path: string) => `/api/files?path=${encodeURIComponent(path)}#model.glb`;

export function DocumentViewer({ id }: DocumentViewerProps) {
    const [document, setDocument] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDoc = async () => {
            try {
                const doc = await fetchDocumentById(id);
                setDocument(doc);
            } catch (error) {
                console.error("Failed to fetch document", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) loadDoc();
    }, [id]);

    if (isLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4 text-slate-600">
                    <svg className="animate-spin h-8 w-8 text-blue-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="font-medium tracking-wide">Učitavanje podataka...</p>
                </div>
            </div>
        );
    }

    if (!document) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-red-600 font-semibold text-lg border border-red-200 bg-red-50 px-6 py-4 rounded-md">Dokument nije pronađen.</p>
            </div>
        );
    }

    const { content, coverPath, pdfPath, video, projectPhotos, models3d, ownerEmail, ownerProfile, authorProfiles } = document;
    const hasMultimedia = pdfPath || (projectPhotos && projectPhotos.length > 0) || (models3d && models3d.length > 0) || video;

    // Combine and deduplicate profiles
    const allProfiles = [ownerProfile, ...(authorProfiles || [])].filter(Boolean);
    const profiles = Array.from(new Map(allProfiles.map(p => [p.email, p])).values());

    return (
        <div className="w-full min-h-screen pb-20 pt-8 flex flex-col items-center selection:bg-blue-200">
            <div className="w-full max-w-5xl px-4 lg:px-0 flex flex-col gap-6">

                <HeroSection
                    content={content}
                    coverPath={coverPath}
                    profiles={profiles}
                    ownerEmail={ownerEmail}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TechDataSection content={content} />
                    <AnalysisStorageSection content={content} />
                </div>

                {hasMultimedia && (
                    <div className="bg-white p-8 rounded-md shadow-sm border border-slate-300 flex flex-col gap-10">
                        <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4">Multimedija i Prilozi</h3>

                        <PdfSection pdfPath={pdfPath} />
                        <PhotoGallerySection projectPhotos={projectPhotos} />
                        <ModelSection models3d={models3d} />
                        <VideoSection video={video} />
                    </div>
                )}

            </div>
        </div>
    );
}

// --- Helper Components ---

const DetailItem = ({ label, value, fullWidth = false }: { label: string, value: string, fullWidth?: boolean }) => {
    if (!value || value.trim() === '') return null;
    return (
        <div className={`flex flex-col ${fullWidth ? 'col-span-full' : ''} border-b border-slate-100 pb-3`}>
            <span className="text-sm font-semibold text-slate-700 tracking-wider mb-1">{label}</span>
            <span className="text-base text-slate-900 leading-relaxed whitespace-pre-wrap wrap-break-word">{value}</span>
        </div>
    );
};

// --- View Sections ---

const HeroSection = ({ content, coverPath, profiles, ownerEmail }: { content: any, coverPath: string | null, profiles: any[], ownerEmail: string }) => {
    const getInitials = (name: string, surname: string) => `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();

    return (
        <div className="bg-white rounded-md shadow-sm border border-slate-300 flex flex-col md:flex-row border-t-4 border-t-blue-900">
            <div className="w-full md:w-5/12 lg:w-1/2 bg-slate-50 border-r border-slate-200 relative min-h-[350px]">
                {coverPath ? (
                    <img
                        src={getDownloadUrl(coverPath)}
                        alt={content.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <IconImagePlaceholder />
                    </div>
                )}
            </div>

            <div className="w-full md:w-7/12 lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    {content.category && (
                        <span className="text-blue-800 text-sm font-bold tracking-widest uppercase">
                            {content.category}
                        </span>
                    )}
                    {content.invNumber && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-sm font-mono font-semibold rounded border border-slate-300">
                            OKIRU: {content.invNumber}
                        </span>
                    )}
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-8 leading-tight break-words">
                    {content.name}
                </h1>

                <div className="space-y-6">
                    {content.author && (
                        <div className="flex items-start gap-4">
                            <div className="text-slate-400 mt-0.5"><IconUser /></div>
                            <div>
                                <p className="text-sm text-slate-600 font-semibold uppercase tracking-wider mb-0.5">Autor / Umjetnik</p>
                                <p className="text-base font-medium text-slate-900 break-words">{content.author}</p>
                            </div>
                        </div>
                    )}
                    {content.student && (
                        <div className="flex items-start gap-4">
                            <div className="text-slate-400 mt-0.5"><IconStudent /></div>
                            <div>
                                <p className="text-sm text-slate-600 font-semibold uppercase tracking-wider mb-0.5">Student (Izvođač)</p>
                                <p className="text-base font-medium text-slate-900 break-words">{content.student}</p>
                            </div>
                        </div>
                    )}
                    {content.professor && (
                        <div className="flex items-start gap-4">
                            <div className="text-slate-400 mt-0.5"><IconMentor /></div>
                            <div>
                                <p className="text-sm text-slate-600 font-semibold uppercase tracking-wider mb-0.5">Mentor</p>
                                <p className="text-base font-medium text-slate-900 break-words">{content.professor}</p>
                            </div>
                        </div>
                    )}

                    {/* OKIRU Authors Block */}
                    {profiles.length > 0 && (
                        <div className="pt-6 border-t border-slate-100">
                            <p className="text-sm text-slate-600 font-semibold uppercase tracking-wider mb-3">Autori projekta</p>
                            <div className="flex flex-wrap gap-2.5">
                                {profiles.map(profile => {
                                    const isOwner = profile.email === ownerEmail;
                                    return (
                                        <a
                                            key={profile.email}
                                            href={`/profil/${encodeURIComponent(profile.email)}`}
                                            className={`flex items-center gap-2.5 border rounded-full pl-1.5 pr-4 py-1.5 shadow-sm transition-colors group bg-slate-50 border-slate-200 hover:border-slate-400`}
                                            title={isOwner ? 'Vlasnik projekta' : 'Koautor'}
                                        >
                                            <div className={`w-7 h-7 flex items-center justify-center text-white rounded-full text-[10px] font-bold shrink-0 transition-transform group-hover:scale-105 ${
                                                isOwner ? 'bg-blue-900' : 'bg-slate-700'
                                            }`}>
                                                {getInitials(profile.name, profile.surname)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-bold leading-none mb-0.5 text-slate-800`}>
                                                    {profile.name} {profile.surname}
                                                </span>
                                                {isOwner && (
                                                    <span className="text-[9px] uppercase tracking-wider text-blue-700 font-bold">
                                                        Vlasnik
                                                    </span>
                                                )}
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {content.date && (
                        <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                            <div className="text-slate-400"><IconCalendar /></div>
                            <span className="text-slate-700 text-base">Datacija: <strong>{content.date}</strong></span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TechDataSection = ({ content }: { content: any }) => (
    <div className="bg-white p-8 rounded-md shadow-sm border border-slate-300">
        <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">
            Tehnološki podaci
        </h3>
        <div className="grid grid-cols-1 gap-y-5 gap-x-4">
            <DetailItem label="Materijal" value={content.material} />
            <DetailItem label="Tehnika" value={content.technique} />
            <DetailItem label="Pigment" value={content.pigment} />
            <DetailItem label="Vezivo" value={content.binder} />
            <DetailItem label="Završni sloj" value={content.finishingLayer} />
            <DetailItem label="Korišteni materijali" value={content.materialsUsed} fullWidth />
        </div>
    </div>
);

const AnalysisStorageSection = ({ content }: { content: any }) => (
    <div className="bg-white p-8 rounded-md shadow-sm border border-slate-300 flex flex-col gap-8">
        <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">
                Analize i radovi
            </h3>
            <div className="grid grid-cols-1 gap-y-5 gap-x-4">
                <DetailItem label="Vrsta analize" value={content.typeOfAnalysis} />
                <DetailItem label="Cilj analize" value={content.goalOfAnalysis} />
                <DetailItem label="Provedeni radovi" value={content.works} fullWidth />
                <DetailItem label="Ključne riječi" value={content.keywords} fullWidth />
            </div>
        </div>

        <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">
                Smještaj i pohrana
            </h3>
            <div className="grid grid-cols-1 gap-y-5 gap-x-4">
                <DetailItem label="Izvorna lokacija" value={content.location} />
                <DetailItem label="Mjesto pohrane / Depo" value={content.storage} />
            </div>
        </div>
    </div>
);

const PdfSection = ({ pdfPath }: { pdfPath: string | null }) => {
    if (!pdfPath) return null;
    return (
        <div>
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-widest mb-4">Dokumentacija</h4>
            <a
                href={getDownloadUrl(pdfPath)}
                target="_blank"
                className="inline-flex items-center gap-3 bg-white hover:bg-slate-50 text-blue-900 border border-slate-300 px-6 py-4 rounded-md font-bold transition-colors shadow-sm"
            >
                <IconPDF />
                Preuzmi cjeloviti PDF dokument
            </a>
        </div>
    );
};

const PhotoGallerySection = ({ projectPhotos }: { projectPhotos: any[] }) => {
    const [lightboxIndex, setLightboxIndex] = useState(-1);
    const [photoPage, setPhotoPage] = useState(0);
    const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

    if (!projectPhotos || projectPhotos.length === 0) return null;

    const ITEMS_PER_PAGE = 2;

    const totalPhotoPages = Math.ceil(projectPhotos.length / ITEMS_PER_PAGE);

    // Only pass working images to the lightbox
    const lightboxSlides = projectPhotos.map((photo: any) => ({
        src: getDownloadUrl(photo.path),
        alt: photo.name,
    }));

    const handleImageError = (index: number) => {
        setFailedImages(prev => ({ ...prev, [index]: true }));
    };

    return (
        <div className="border-t border-slate-100 pt-8">
            <Lightbox
                open={lightboxIndex >= 0}
                close={() => setLightboxIndex(-1)}
                index={lightboxIndex}
                slides={lightboxSlides}
                plugins={[Zoom]}
            />

            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-widest mb-6">
                Fotografije zahvata <span className="text-sm font-medium text-slate-500 normal-case ml-2">({projectPhotos.length})</span>
            </h4>

            <div className="w-full overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${photoPage * 100}%)` }}
                >
                    {projectPhotos.map((photo: any, index: number) => (
                        <div key={index} className="w-full md:w-1/2 flex-shrink-0 px-3">
                            <div className="flex flex-col bg-white border border-slate-200 rounded shadow-sm h-full overflow-hidden">
                                <div
                                    className="relative group cursor-pointer aspect-[4/3] bg-slate-50 overflow-hidden"
                                    onClick={() => !failedImages[index] && setLightboxIndex(index)}
                                >
                                    {/* Placeholder is always rendered underneath */}
                                    <div className="absolute w-full h-full flex flex-col items-center justify-center text-slate-400">
                                        <IconImagePlaceholder />
                                        <span className="text-xs font-medium mt-2">Fotografija nije dostupna</span>
                                    </div>

                                    {/* Image renders on top, hides instantly on error */}
                                    {!failedImages[index] && (
                                        <img
                                            src={getDownloadUrl(photo.path)}
                                            alt={photo.name}
                                            onError={(e) => {
                                                // Instantly hide the broken image icon and text
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                handleImageError(index);
                                            }}
                                            // text-transparent prevents the alt text from showing during the error flash
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 text-transparent bg-white"
                                        />
                                    )}
                                </div>
                                <div className="p-5 flex-1 border-t border-slate-100 flex flex-col justify-start">
                                    <p className="text-sm font-medium text-slate-800 text-center leading-relaxed whitespace-pre-wrap break-words">
                                        {photo.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {totalPhotoPages > 1 && (
                <div className="flex items-center justify-center gap-6 mt-6">
                    <button
                        type="button"
                        onClick={() => setPhotoPage(p => Math.max(0, p - 1))}
                        disabled={photoPage === 0}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors text-slate-700 font-bold"
                    >
                        &larr;
                    </button>
                    <div className="flex gap-2">
                        {Array.from({length: totalPhotoPages}).map((_, idx) => (
                            <div
                                key={idx}
                                onClick={() => setPhotoPage(idx)}
                                className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${idx === photoPage ? 'bg-blue-800' : 'bg-slate-300 hover:bg-slate-400'}`}
                            />
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => setPhotoPage(p => Math.min(totalPhotoPages - 1, p + 1))}
                        disabled={photoPage === totalPhotoPages - 1}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors text-slate-700 font-bold"
                    >
                        &rarr;
                    </button>
                </div>
            )}
        </div>
    );
};

const ModelSection = ({ models3d }: { models3d: any[] }) => {
    const [modelPage, setModelPage] = useState(0);

    if (!models3d || models3d.length === 0) return null;

    const totalModels = models3d.length;
    const currentModel = models3d[modelPage];

    const isModelFormatSupported = (filename: string) => {
        const lowerCaseName = filename.toLowerCase();
        return lowerCaseName.endsWith('.glb') || lowerCaseName.endsWith('.gltf');
    };
    const isModelSupported = currentModel ? isModelFormatSupported(currentModel.path) : false;

    return (
        <div className="border-t border-slate-100 pt-8">
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-widest mb-4 flex justify-between items-end">
                Interaktivni 3D Modeli <span className="text-sm font-medium text-slate-500 normal-case ml-2">({totalModels})</span>
            </h4>
            <div className="w-full rounded-md overflow-hidden border border-slate-300 shadow-sm bg-slate-50">
                <div className="w-full h-[500px] relative border-b border-slate-200 bg-slate-200">
                    {isModelSupported ? (
                        <model-viewer
                            src={getModelUrl(currentModel.path)}
                            alt={currentModel.name}
                            auto-rotate="true"
                            camera-controls="true"
                            style={{ width: '100%', height: '100%', cursor: 'grab', backgroundColor: '#f1f5f9' }}
                        ></model-viewer>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500 w-full h-full text-center p-6 bg-slate-50">
                            <IconCube />
                            <p className="font-semibold text-lg text-slate-700 mt-4">Format nije podržan za pregled</p>
                            <p className="text-sm mt-1">Samo .glb i .gltf formati mogu biti prikazani u pregledniku.</p>
                            <p className="text-xs mt-3 bg-white px-3 py-1.5 rounded border border-slate-300 font-mono text-slate-600 break-words">
                                {currentModel.path.split('/').pop()}
                            </p>
                        </div>
                    )}
                </div>
                <div className="bg-white p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="w-full md:w-auto text-center md:text-left">
                        <p className="font-bold text-lg text-slate-900 leading-relaxed whitespace-pre-wrap break-words">{currentModel.name}</p>
                        {isModelSupported && (
                            <p className="text-sm text-slate-600 mt-1">Lijevi klik za rotaciju, pomicanje kotačića za zumiranje.</p>
                        )}
                    </div>

                    {totalModels > 1 && (
                        <div className="flex items-center justify-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                            <button
                                onClick={() => setModelPage(p => Math.max(0, p - 1))}
                                disabled={modelPage === 0}
                                className="px-5 py-2.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base transition-colors shadow-sm"
                            >
                                &larr; Prethodni
                            </button>
                            <span className="text-sm font-semibold text-slate-700 min-w-[4rem] text-center">
                                {modelPage + 1} / {totalModels}
                            </span>
                            <button
                                onClick={() => setModelPage(p => Math.min(totalModels - 1, p + 1))}
                                disabled={modelPage === totalModels - 1}
                                className="px-5 py-2.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base transition-colors shadow-sm"
                            >
                                Sljedeći &rarr;
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const VideoSection = ({ video }: { video: any }) => {
    if (!video) return null;
    return (
        <div className="border-t border-slate-100 pt-8">
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-widest mb-4">Video Zapis</h4>
            <div className="w-full bg-slate-900 rounded-md overflow-hidden border border-slate-800 shadow-sm">
                <video
                    src={getDownloadUrl(video.path)}
                    controls
                    className="w-full h-auto max-h-[600px] mx-auto block"
                >
                    Vaš preglednik ne podržava reprodukciju videa.
                </video>
            </div>
            <div className="mt-4">
                <p className="text-base font-medium text-slate-800 text-center leading-relaxed whitespace-pre-wrap break-words">
                    {video.name}
                </p>
            </div>
        </div>
    );
};