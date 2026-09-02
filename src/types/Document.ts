import type {UserProfile} from "./UserProfile.ts";

export interface Document {
    // Metadata
    id: string;
    isPublished: boolean;
    visibility: Visibility;
    creatorEmail: string; //todo rename everywhere backend too
    coCreatorEmails: string[]; //todo rename everywhere backend too
    mentorEmails: string[];
    creationDate: string;
    publicationDate: string;

    content: RestorationData;
    files: DocumentFiles
    profiles: DocumentProfiles
}

export const Visibility = {
    PUBLIC: 'PUBLIC',
    OKIRU: 'OKIRU'
} as const;

export type Visibility = typeof Visibility[keyof typeof Visibility];

export interface DocumentFiles {
    pdfPath: string;
    coverPath: string;
    model3dPath: string[];
}

export interface DocumentProfiles {
    creatorProfile?: UserProfile; //todo rename everywhere backend too
    coCreatorProfiles?: UserProfile[]; //todo rename everywhere backend too
    mentorProfiles?: UserProfile[];
}

//todo change labels in UI according to comments
export interface RestorationData {
    category: Category;
    inventoryNumber: string;        // Invenatarni broj OKIRU
    name: string;                   // Naslov/Naziv
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

//todo later (NOT NOW) add group:
//  - added as just a text in a document
//  - later documents can see all the groups that are already in a document
//  - so there should be a collection of groups already added to existing documents
//      - if group is removed from every document it should be removed from collection

export const Category = {
    UNSPECIFIED: 0,
    DRVENI_PREDMETI: 1,
    SLIKE_NA_PLATNU: 2,
    ZIDNE_SLIKE: 3,
    KAMENA_I_ARHITEKTONSKA_PLASTIKA: 4,
    OSTALI_MATERIJALI: 5,
    ISTRAZIVACKI_RADOVI_I_REFERENTNI_MATERIJALI: 6,
    DIPLOMSKI_I_SEMINARSKI_RADOVI: 7
} as const;

export type Category = typeof Category[keyof typeof Category];

//This is a dropdown (multiple selection + store int times for item + goal of analysis (written after selection))
export interface Analysis {
    type: AnalysisType,
    times: number,
    goal: string,
}

export interface Work {
    name: string,
    material: string,
}

export const AnalysisType = {
    VIS: 0,      // Visible Light Photography
    GL: 1,       // Grazing Light Photography
    UVF: 2,      // Ultra Violet Fluorescence
    IRP: 3,      // InfraRed Photography / InfraRed Reflectography / InfraRed False Color Photography
    XRR: 4,      // X-Ray Radiography
    XRF: 5,      // X-Ray Fluorescence
    RS: 6,       // Raman Spectroscopy
    FTIR: 7,     // Fourier Transform InfraRed Spectroscopy
    FORS: 8,     // Fiber Optics Reflectance Spectroscopy
    SEM: 9,      // Scanning Electron Microscopy / Scanning Electron Microscopy–Energy Dispersive X-ray Spectroscopy
    OM: 10,      // Optical Microscopy
    PLM: 11,     // Polarized Light Microscopy
    PIXE: 12,    // Particle (Proton) Induced X-ray Emission
    PIGE: 13,    // Particle (Proton) Induced Gamma-ray Emission
    RBS: 14,     // Rutherford Backscattering
    ST: 15,      // * Synchrotron-based Techniques (no abbr)
    AAS: 16,     // Atomic Absorption Spectroscopy
    AES: 17,     // Atomic Emission Spectroscopy
    UVVIS: 18,   // UltraViolet-Visible Light Spectroscopy
    TLC: 19,     // Thin-Layer Chromatography
    GCMS: 20,    // Gas Chromatography–Mass Spectrometry
    TL: 21,      // Thermoluminescence
    OL: 22,      // Optical Luminescence
    C14: 23,     // Radiocarbon Dating
    XRD: 24,     // X-Ray Diffraction
    LIBS: 25,    // Laser-Induced Breakdown Spectroscopy
    TEM: 26,     // Transmission Electron Microscopy
    AFM: 27,     // Atomic Force Microscopy
    HM: 28,      // * Hygroscopic Measurements (no abbr)
    G: 29,       // * Granulometry (no abbr)
    BFR: 30,     // * Binder/Filler Ratio (no abbr)
    DRMS: 31,    // Drilling Resistance Measurement System
    S3D: 32,     // * 3D Scanning (no abbr)
    AS: 33,      // * Analysis of Salts (no abbr)
} as const;

export type AnalysisType = typeof AnalysisType[keyof typeof AnalysisType];

export interface PaginatedResponse<T> {
    content: T[]; // Spring Boot Pagination payload array (do not rename)
    totalPages: number;
    totalElements: number;
    number: number;
}