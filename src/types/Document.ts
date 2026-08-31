import type {UserProfile} from "./UserProfile.ts";

export interface Document {
    id: string;
    isPublished: boolean;
    ownerEmail: string;
    visibility: Visibility;
    coAuthorEmails: string[];
    creationDate: string;
    publicationDate: string;
    content: DocumentContent;
    pdfPath: string;
    coverPath: string;
    model3dPath: string;
    ownerProfile?: UserProfile;
    authorProfiles?: UserProfile[];
}

export enum Visibility {
    PUBLIC = 'PUBLIC',
    OKIRU = 'OKIRU'
}

export interface DocumentContent {
    category: string;
    student: string;
    professor: string;
    invNumber: string;
    name: string;
    author: string;
    material: string;
    technique: string;
    keywords: string;
    location: string;
    storage: string;
    typeOfAnalysis: string;
    goalOfAnalysis: string;
    works: string;
    materialsUsed: string;
    pigment: string;
    binder: string;
    finishingLayer: string;
    date: string;
}

export interface PaginatedResponse<T> {
    content: T[]; // Spring Boot Pagination payload array (do not rename)
    totalPages: number;
    totalElements: number;
    number: number;
}