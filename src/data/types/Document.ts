import type {UserProfile} from "./UserProfile.ts";

export interface Document {
    // Metadata
    id: string;
    isPublished: boolean;
    visibility: Visibility;
    creatorEmail: string;
    coCreatorEmails: string[];
    mentorEmails: string[];
    creationDate: string;
    publicationDate: string;

    restorationData: RestorationData;
    files: DocumentFiles
    profiles: DocumentProfiles
}

export const Visibility = {
    PUBLIC: 'PUBLIC',
    OKIRU: 'OKIRU'
} as const;

export type Visibility = typeof Visibility[keyof typeof Visibility];

export interface NamedFile {
    file: File;
    name: string;
    previewUrl: string;
}

export interface ServerNamedFile {
    path: string;
    name: string;
}

export interface DocumentFiles {
    coverPath?: string;
    pdfPath?: string;
    video?: NamedFile | null;
    projectPhotos: NamedFile[];
    models3d: NamedFile[];
}

export interface DocumentProfiles {
    creatorProfile?: UserProfile;
    coCreatorProfiles?: UserProfile[];
    mentorProfiles?: UserProfile[];
}

//todo change labels in UI according to comments
export interface RestorationData {
    category: string;
    inventoryNumber: string;        // Invenatarni broj OKIRU
    name: string;                   // Naslov/Naziv todo: rename to title
    group: string;                  // Zbirka/grupa todo: the logic behind it. Decide type
    author: string;                 // Autor
    date: string;                   // Datacija
    material: string;               // Materijal
    technique: string;              // Teknika
    location: string;               // Izvorni smještaj/lokacija
    storage: string;                // Trenutni smještaj/lokacija

    typeOfAnalysis: Analysis[];     // Vrsta analize

    works: Work[];                  // Provedeni radovi

    pigment: string;                // Pigmenti
    binder: string;                 // Veziva
    finishingLayer: string;         // Završni sloj

    keywords: string;               // Ključne riječi
}

export interface Analysis {
    type: string,
    goal: string,
}

export interface Work {
    name: string,
    material: string,
}

export interface PaginatedResponse<T> {
    content: T[]; // Spring Boot Pagination payload array (do not rename)
    totalPages: number;
    totalElements: number;
    number: number;
}