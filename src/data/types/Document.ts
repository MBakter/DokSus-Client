import type {UserProfile} from "./UserProfile.ts";

/**
 * Shape of a document as received from the backend. Mirrors the server's `Document.kt`;
 * when a field is added there, it should be added here too.
 */
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

/** A file picked in the browser but not uploaded yet, with its display name and preview URL. */
export interface NamedFile {
    file: File;
    name: string;
    previewUrl: string;
}

/** A file that is already stored on the server, referenced by its path. */
export interface ServerNamedFile {
    path: string;
    name: string;
}

export interface DocumentFiles {
    coverPath?: string;
    pdfPath?: string;
    additionalPdfs: NamedFile[];
    video?: NamedFile | null;
    projectPhotos: NamedFile[];
    models3d: NamedFile[];
}

export interface DocumentProfiles {
    creatorProfile?: UserProfile;
    coCreatorProfiles?: UserProfile[];
    mentorProfiles?: UserProfile[];
}

/** The descriptive fields of a document (the editor form). Mirrors `RestorationData` in `Document.kt`. */
export interface RestorationData {
    category: string;
    inventoryNumber: string;        // Invenatarni broj OKIRU
    name: string;                   // Naslov/Naziv todo: rename to title
    group: string;                  // Zbirka/grupa
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
    content: T[];
    page: {
        size: number;
        totalElements: number;
        totalPages: number;
        number: number;
    };
}