import {useContext, useEffect, useState} from 'preact/hooks';
import {fetchDocumentById, updateDocumentCreator} from "../api/feature/DocumentApi.ts";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import '@google/model-viewer';
import {formatDateObj, getDownloadUrl, getInitials} from "../util/Utilities.ts";
import {IconCube, IconImagePlaceholder, IconPDF} from "../assets/Icons.tsx";
import {AuthContext} from "../context/AuthContext.tsx";
import {useCategoryReference} from "../data/reference/ReferenceData.ts";
import type {Document} from "../data/types/Document.ts";

export function useDocumentViewer(id: string) {
    const [document, setDocument] = useState<Document | null>(null); // Replace 'any' with 'Document' interface
    const [isLoading, setIsLoading] = useState(true);
    const [isChangingCreator, setIsChangingCreator] = useState(false);

    const loadDoc = async () => {
        setIsLoading(true);
        try {
            const doc = await fetchDocumentById(id);
            setDocument(doc);
        } catch (error) {
            console.error("Failed to fetch document", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) loadDoc();
    }, [id]);

    const handleCreatorChange = async (newEmail: string) => {
        if (!newEmail || newEmail.trim() === '') return;

        setIsChangingCreator(true);
        try {
            await updateDocumentCreator(id, newEmail.trim());
            await loadDoc();
            alert("Vlasnik dokumenta je uspješno promijenjen.");
        } catch (error) {
            console.error("Failed to update creator", error);
            alert("Dogodila se greška prilikom promjene vlasnika.");
        } finally {
            setIsChangingCreator(false);
        }
    };

    return {
        document,
        isLoading,
        isChangingCreator,
        handleCreatorChange
    };
}

// --- Main Viewer Component ---

export function DocumentViewer({id}: { id: string }) {
    const {document, isLoading, isChangingCreator, handleCreatorChange} = useDocumentViewer(id);
    const {user} = useContext(AuthContext);
    const {categories} = useCategoryReference(); // Fetch categories here

    if (isLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4 text-slate-600">
                    <svg className="animate-spin h-8 w-8 text-blue-900" xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="font-medium tracking-wide">Učitavanje podataka...</p>
                </div>
            </div>
        );
    }

    if (!document) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-red-600 font-semibold text-lg border border-red-200 bg-red-50 px-6 py-4 rounded-md">Dokument
                    nije pronađen.</p>
            </div>
        );
    }

    const {restorationData, files, profiles, creationDate, publicationDate, isPublished} = document;

    const coverPath = files?.coverPath;
    const pdfPath = files?.pdfPath;
    const video = files?.video;
    const projectPhotos = files?.projectPhotos;
    const models3d = files?.models3d;

    const hasMultimedia = pdfPath || (projectPhotos && projectPhotos.length > 0) || (models3d && models3d.length > 0) || video;

    const creatorEmail = profiles?.creatorProfile?.email || '';
    const authors = [profiles?.creatorProfile, ...(profiles?.coCreatorProfiles || [])].filter(Boolean);
    const mentors = profiles?.mentorProfiles || [];

    // Unique profiles for rendering
    const uniqueAuthors = Array.from(new Map(authors.map(p => [p.email, p])).values());
    const uniqueMentors = Array.from(new Map(mentors.map(p => [p.email, p])).values());

    return (
        <div className="w-full min-h-screen pb-20 pt-8 flex flex-col items-center bg-slate-50 selection:bg-blue-200">
            <div className="w-full max-w-5xl px-4 lg:px-0 flex flex-col gap-8">

                {/* Hero / Main Info Section */}
                <HeroSection
                    restorationData={restorationData}
                    coverPath={coverPath}
                    authors={uniqueAuthors}
                    mentors={uniqueMentors}
                    creatorEmail={creatorEmail}
                    creationDate={creationDate}
                    publicationDate={publicationDate}
                    isPublished={isPublished}
                    categories={categories}
                    isProfessor={user?.isProfessor || false}
                    isChangingCreator={isChangingCreator}
                    onCreatorChange={handleCreatorChange}
                />

                {/* Data Sections */}
                <div className="flex flex-col gap-8">
                    <MaterialDetailsSection restorationData={restorationData}/>
                    <WorksSection restorationData={restorationData}/>
                    <AnalysisSection restorationData={restorationData}/>
                    <KeywordsSection restorationData={restorationData}/>
                </div>

                {/* Multimedia Section */}
                {hasMultimedia && (
                    <div className="bg-white p-8 rounded-md shadow-sm border border-slate-300 flex flex-col gap-10">
                        <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4">Multimedija i
                            Prilozi</h3>
                        <PdfSection pdfPath={pdfPath}/>
                        <PhotoGallerySection projectPhotos={projectPhotos}/>
                        <ModelSection models3d={models3d}/>
                        <VideoSection video={video}/>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Detail Helper ---

const DetailItem = ({label, value, fullWidth = false}: { label: string; value: string; fullWidth?: boolean }) => {
    if (!value || value.trim() === '') return null;
    return (
        <div className={`flex flex-col ${fullWidth ? 'col-span-full' : ''}`}>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</span>
            <span className="text-sm font-medium text-slate-900 leading-relaxed break-words">{value}</span>
        </div>
    );
};

// --- Sections ---

const HeroSection = (
    {
        restorationData,
        coverPath,
        authors,
        mentors,
        creatorEmail,
        creationDate,
        publicationDate,
        isPublished,
        categories,
        isProfessor,
        isChangingCreator,
        onCreatorChange
    }: any) => {

    const handleChangeOwnerClick = () => {
        const promptMessage = "UPOZORENJE: Promjenom vlasnika projekta trenutni vlasnik će trajno izgubiti pristup i prava uređivanja ovog dokumenta.\n\nUnesite e-mail adresu novog vlasnika dokumenta:";
        const newEmail = window.prompt(promptMessage);

        if (newEmail && newEmail.trim() !== '') {
            onCreatorChange(newEmail);
        }
    };

    const categoryCode = restorationData?.category || 'UNSPECIFIED';
    const categoryName = categories.find((c: any) => c.id === categoryCode)?.name || categoryCode.replace(/_/g, ' ');

    return (
        <div
            className="bg-white rounded-md shadow-sm border border-slate-300 p-8 flex flex-col border-t-4 border-t-blue-900 relative">

            {/* Draft Badge */}
            {!isPublished && (
                <span
                    className="absolute top-0 right-8 -translate-y-1/2 bg-yellow-100 text-yellow-800 border border-yellow-300 text-xs px-3 py-1 uppercase tracking-wider font-bold rounded-sm shadow-sm">
                    U izradi
                </span>
            )}

            {/* FULL WIDTH TITLE */}
            <div className="w-full mb-8 border-b border-slate-100 pb-6">
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight break-words">
                    {restorationData?.name || 'Nepoznat naslov'}
                </h1>
            </div>

            {/* Content Split: Image Left, Data Right */}
            <div className="flex flex-col lg:flex-row gap-8">

                {/* 1. Rectangle Picture */}
                <div className="w-full lg:w-5/12 shrink-0">
                    <div
                        className="aspect-[4/3] w-full bg-slate-100 rounded-md overflow-hidden relative border border-slate-200 shadow-sm">
                        {coverPath ? (
                            <img
                                src={getDownloadUrl(coverPath)}
                                alt={restorationData?.name || "Slika predmeta"}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <IconImagePlaceholder/>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Metadata Next to Picture */}
                <div className="w-full lg:w-7/12 flex flex-col justify-start">

                    {/* Category & Inventory Number Row */}
                    <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                        <div className="truncate">
                            {categoryCode !== 'UNSPECIFIED' && (
                                <span
                                    className="inline-block px-3 py-1 bg-slate-50 text-slate-600 text-[13px] font-bold tracking-wide rounded border border-slate-200 truncate max-w-full"
                                    title={categoryName}
                                >
                                    {categoryName}
                                </span>
                            )}
                        </div>

                        {restorationData?.inventoryNumber && (
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Inv. broj (OKIRU)
                                </span>
                                <span
                                    className="text-sm font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                    {restorationData.inventoryNumber}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* System Dates Row - Visually distinct */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-500 mb-8">
                        {creationDate && (
                            <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
                                Kreirano: <span
                                className="font-semibold text-slate-700">{formatDateObj(creationDate)}</span>
                            </span>
                        )}
                        {isPublished && publicationDate && (
                            <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
                                Objavljeno: <span
                                className="font-semibold text-slate-700">{formatDateObj(publicationDate)}</span>
                            </span>
                        )}
                    </div>

                    {/* Main Meta Grid (No more special category checks!) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 mb-8">
                        <DetailItem label="Autor / Umjetnik" value={restorationData?.author}/>
                        <DetailItem label="Datacija predmeta" value={restorationData?.date}/>
                        <DetailItem label="Zbirka / Grupa" value={restorationData?.group}/>
                        <DetailItem label="Izvorni smještaj / Lokacija" value={restorationData?.location}/>
                        <DetailItem label="Trenutni smještaj / Depo" value={restorationData?.storage}/>
                    </div>

                    <div className="border-t border-slate-100 mb-6"></div>

                    {/* Authors & Mentors Under Data */}
                    <div className="flex flex-col gap-6">

                        {/* Authors List */}
                        {authors.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Autori
                                        projekta</p>
                                    {isProfessor && (
                                        <button
                                            onClick={handleChangeOwnerClick}
                                            disabled={isChangingCreator}
                                            className="text-[10px] uppercase font-bold tracking-wider bg-white border border-slate-300 text-slate-700 px-2.5 py-1 rounded shadow-sm hover:border-blue-400 hover:text-blue-800 transition-all disabled:opacity-50"
                                        >
                                            {isChangingCreator ? 'Spremanje...' : 'Promijeni vlasnika'}
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {authors.map((profile: any) => {
                                        const isOwner = profile.email === creatorEmail;
                                        return (
                                            <a
                                                key={profile.email}
                                                href={`/profil/${encodeURIComponent(profile.email)}`}
                                                className="flex items-center gap-2 border rounded-full pl-1 pr-3 py-1 bg-slate-50 border-slate-200 hover:border-slate-400 transition-colors"
                                                title={isOwner ? 'Vlasnik projekta' : 'Koautor'}
                                            >
                                                <div
                                                    className={`w-6 h-6 flex items-center justify-center text-white rounded-full text-[9px] font-bold shrink-0 ${isOwner ? 'bg-blue-900' : 'bg-slate-600'}`}>
                                                    {getInitials(profile.name, profile.surname)}
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <span className="text-xs font-bold text-slate-800 leading-none">
                                                        {profile.name} {profile.surname}
                                                    </span>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Mentors List */}
                        {mentors.length > 0 && (
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Mentori</p>
                                <div className="flex flex-wrap gap-2.5">
                                    {mentors.map((profile: any) => (
                                        <a
                                            key={profile.email}
                                            href={`/profil/${encodeURIComponent(profile.email)}`}
                                            className="flex items-center gap-2 border rounded-full pl-1 pr-3 py-1 bg-blue-50/50 border-blue-200 hover:border-blue-400 transition-colors"
                                        >
                                            <div
                                                className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full text-[9px] font-bold shrink-0 border border-blue-200">
                                                {getInitials(profile.name, profile.surname)}
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-xs font-bold text-blue-900 leading-none">
                                                    {profile.name} {profile.surname}
                                                </span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Editor-Style Remaining Data Sections ---

const SectionContainer = ({title, children}: { title: string, children: React.ReactNode }) => (
    <div className="bg-white p-8 rounded-md shadow-sm border border-slate-300">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3">
            {title}
        </h2>
        {children}
    </div>
);

export const MaterialDetailsSection = ({restorationData}: { restorationData: any }) => {
    if (!restorationData?.material && !restorationData?.technique && !restorationData?.pigment && !restorationData?.binder && !restorationData?.finishingLayer) return null;

    return (
        <SectionContainer title="Detalji o materijalu i tehnici">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem label="Materijal" value={restorationData?.material}/>
                <DetailItem label="Tehnika" value={restorationData?.technique}/>
                <DetailItem label="Pigmenti" value={restorationData?.pigment}/>
                <DetailItem label="Veziva" value={restorationData?.binder}/>
                <DetailItem label="Završni sloj" value={restorationData?.finishingLayer}/>
            </div>
        </SectionContainer>
    );
};

export const WorksSection = ({restorationData}: { restorationData: any }) => {
    const worksList = restorationData?.works || [];
    if (worksList.length === 0) return null;

    return (
        <SectionContainer title="Provedeni radovi">
            <div className="flex flex-col gap-4">
                {worksList.map((work: any, index: number) => (
                    <div key={index}
                         className="flex flex-col md:flex-row md:items-start gap-4 p-5 rounded-md border border-slate-200 bg-slate-50/50">
                        <div className="flex-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Opis radova</span>
                            <p className="text-sm font-medium text-slate-800 leading-relaxed break-words whitespace-pre-wrap">
                                {work.name}
                            </p>
                        </div>
                        {work.material && (
                            <div
                                className="flex-1 md:border-l md:border-slate-200 md:pl-6 pt-4 md:pt-0  border-slate-200">
                                <span
                                    className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Korišteni materijal</span>
                                <p className="text-sm text-slate-700 break-words whitespace-pre-wrap">
                                    {work.material}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </SectionContainer>
    );
};

export const AnalysisSection = ({restorationData}: { restorationData: any }) => {
    const analysisList = restorationData?.typeOfAnalysis || [];
    if (analysisList.length === 0) return null;

    return (
        <SectionContainer title="Vrste analiza">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisList.map((analysis: any, index: number) => (
                    <div key={index}
                         className="flex flex-col gap-3 p-5 rounded-md border border-slate-200 bg-slate-50/50">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Vrsta analize</span>
                            <p className="text-sm font-bold text-slate-800 leading-relaxed break-words">
                                {analysis.type}
                            </p>
                        </div>
                        {analysis.goal && (
                            <div className="border-t border-slate-100 pt-3">
                                <span
                                    className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Cilj analize</span>
                                <p className="text-sm text-slate-600 break-words whitespace-pre-wrap">
                                    {analysis.goal}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </SectionContainer>
    );
};

export const KeywordsSection = ({restorationData}: { restorationData: any }) => {
    const keywordsList = restorationData?.keywords
        ? restorationData.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
        : [];

    if (keywordsList.length === 0) return null;

    return (
        <SectionContainer title="Ključne riječi">
            <div className="flex flex-wrap gap-2">
                {keywordsList.map((keyword: string, index: number) => (
                    <span
                        key={index}
                        className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded text-xs font-semibold"
                    >
                        {keyword}
                    </span>
                ))}
            </div>
        </SectionContainer>
    );
};

const PdfSection = ({pdfPath}: { pdfPath: string | null | undefined }) => {
    if (!pdfPath) return null;
    return (
        <div>
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-widest mb-4">Dokumentacija</h4>
            <a
                href={getDownloadUrl(pdfPath)}
                target="_blank"
                className="inline-flex items-center gap-3 bg-white hover:bg-slate-50 text-blue-900 border border-slate-300 px-6 py-4 rounded-md font-bold transition-colors shadow-sm"
            >
                <IconPDF/>
                Preuzmi cjeloviti PDF dokument
            </a>
        </div>
    );
};

const PhotoGallerySection = ({projectPhotos}: { projectPhotos: any[] }) => {
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
        setFailedImages(prev => ({...prev, [index]: true}));
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
                Fotografije zahvata <span
                className="text-sm font-medium text-slate-500 normal-case ml-2">({projectPhotos.length})</span>
            </h4>

            <div className="w-full overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{transform: `translateX(-${photoPage * 100}%)`}}
                >
                    {projectPhotos.map((photo: any, index: number) => (
                        <div key={index} className="w-full md:w-1/2 flex-shrink-0 px-3">
                            <div
                                className="flex flex-col bg-white border border-slate-200 rounded shadow-sm h-full overflow-hidden">
                                <div
                                    className="relative group cursor-pointer aspect-[4/3] bg-slate-50 overflow-hidden"
                                    onClick={() => !failedImages[index] && setLightboxIndex(index)}
                                >
                                    {/* Placeholder is always rendered underneath */}
                                    <div
                                        className="absolute w-full h-full flex flex-col items-center justify-center text-slate-400">
                                        <IconImagePlaceholder/>
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

const ModelSection = ({models3d}: { models3d: any[] }) => {
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
                Interaktivni 3D Modeli <span
                className="text-sm font-medium text-slate-500 normal-case ml-2">({totalModels})</span>
            </h4>
            <div className="w-full rounded-md overflow-hidden border border-slate-300 shadow-sm bg-slate-50">
                <div className="w-full h-[500px] relative border-b border-slate-200 bg-slate-200">
                    {isModelSupported ? (
                        <model-viewer
                            src={getDownloadUrl(currentModel.path)}
                            alt={currentModel.name}
                            auto-rotate="true"
                            camera-controls="true"
                            style={{width: '100%', height: '100%', cursor: 'grab', backgroundColor: '#f1f5f9'}}
                        ></model-viewer>
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center text-slate-500 w-full h-full text-center p-6 bg-slate-50">
                            <IconCube/>
                            <p className="font-semibold text-lg text-slate-700 mt-4">Format nije podržan za pregled</p>
                            <p className="text-sm mt-1">Samo .glb i .gltf formati mogu biti prikazani u pregledniku.</p>
                            <p className="text-xs mt-3 bg-white px-3 py-1.5 rounded border border-slate-300 font-mono text-slate-600 break-words">
                                {currentModel.path.split('/').pop()}
                            </p>
                        </div>
                    )}
                </div>
                <div
                    className="bg-white p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="w-full md:w-auto text-center md:text-left">
                        <p className="font-bold text-lg text-slate-900 leading-relaxed whitespace-pre-wrap break-words">{currentModel.name}</p>
                        {isModelSupported && (
                            <p className="text-sm text-slate-600 mt-1">Lijevi klik za rotaciju, pomicanje kotačića za
                                zumiranje.</p>
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

const VideoSection = ({video}: { video: any }) => {
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