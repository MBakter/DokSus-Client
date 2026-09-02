import {Category, type RestorationData} from "../../../types/Document.ts";

interface RestorationDataProps {
    restorationData: RestorationData;
    onChange: (e: Event) => void;
}

export function RestorationDataFields({ restorationData, handleRestorationDataChange }: any) {
    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-2">Podaci o predmetu i restauraciji</h2>

            <BasicDataSection
                restorationData={restorationData}
                onChange={handleRestorationDataChange}
            />

            <MaterialDetailsSection
                restorationData={restorationData}
                onChange={handleRestorationDataChange}
            />

            <WorksSectionPlaceholder />

            <AnalysisSectionPlaceholder />

            <KeywordsSection
                restorationData={restorationData}
                onChange={handleRestorationDataChange}
            />
        </div>
    );
}

export function BasicDataSection({ restorationData, onChange }: RestorationDataProps) {
    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">
                Osnovni podaci o predmetu
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Kategorija</label>
                    <select
                        name="category"
                        value={restorationData.category}
                        onChange={onChange}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all bg-white"
                    >
                        <option value={Category.UNSPECIFIED}>Odaberite kategoriju...</option>
                        <option value={Category.DRVENI_PREDMETI}>Drveni predmeti</option>
                        <option value={Category.SLIKE_NA_PLATNU}>Slike na platnu</option>
                        <option value={Category.ZIDNE_SLIKE}>Zidne slike</option>
                        <option value={Category.KAMENA_I_ARHITEKTONSKA_PLASTIKA}>Kamena i arhitektonska plastika</option>
                        <option value={Category.OSTALI_MATERIJALI}>Ostali materijali</option>
                        <option value={Category.ISTRAZIVACKI_RADOVI_I_REFERENTNI_MATERIJALI}>Istraživački radovi i referentni materijali</option>
                        <option value={Category.DIPLOMSKI_I_SEMINARSKI_RADOVI}>Diplomski i seminarski radovi</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Inventarni broj (OKIRU)</label>
                    <input
                        type="text" name="inventoryNumber"
                        value={restorationData.inventoryNumber} onChange={onChange}
                        placeholder="npr. OKIRU-2023-01"
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Naslov / Naziv</label>
                    <input
                        type="text" name="name"
                        value={restorationData.name} onChange={onChange}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all font-medium"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Autor</label>
                    <input
                        type="text" name="author"
                        value={restorationData.author} onChange={onChange}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Datacija</label>
                    <input
                        type="text" name="date"
                        value={restorationData.date} onChange={onChange}
                        placeholder="npr. 19. stoljeće"
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Materijal</label>
                    <input
                        type="text" name="material"
                        value={restorationData.material} onChange={onChange}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Tehnika</label>
                    <input
                        type="text" name="technique"
                        value={restorationData.technique} onChange={onChange}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Izvorni smještaj / lokacija</label>
                    <input
                        type="text" name="location"
                        value={restorationData.location} onChange={onChange}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Trenutni smještaj / lokacija</label>
                    <input
                        type="text" name="storage"
                        value={restorationData.storage} onChange={onChange}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>
            </div>
        </div>
    );
}

export function MaterialDetailsSection({ restorationData, onChange }: RestorationDataProps) {
    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">
                Detalji izrade
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Pigmenti</label>
                    <input
                        type="text" name="pigment"
                        value={restorationData.pigment} onChange={onChange}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Veziva</label>
                    <input
                        type="text" name="binder"
                        value={restorationData.binder} onChange={onChange}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Završni sloj</label>
                    <input
                        type="text" name="finishingLayer"
                        value={restorationData.finishingLayer} onChange={onChange}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>
            </div>
        </div>
    );
}

import { useState } from 'preact/hooks';
import {IconPlus, IconX} from "../../../assets/Icons.tsx";

export function KeywordsSection({ restorationData, onChange }: RestorationDataProps) {
    const [inputValue, setInputValue] = useState("");

    const tags = restorationData.keywords
        ? restorationData.keywords.split(',').map((t: string) => t.trim()).filter(Boolean)
        : [];

    const handleAddTag = () => {
        const newTag = inputValue.trim();

        if (newTag && !tags.includes(newTag)) {
            const newTagsList = [...tags, newTag];
            onChange({
                target: { name: 'keywords', value: newTagsList.join(', ') }
            } as unknown as Event);
        }
        setInputValue("");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const removeTag = (tagToRemove: string) => {
        const newTagsList = tags.filter((tag: string) => tag !== tagToRemove);
        onChange({
            target: { name: 'keywords', value: newTagsList.join(', ') }
        } as unknown as Event);
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">
                Ključne riječi
            </h3>

            <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue((e.target as HTMLInputElement).value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Unesite ključnu riječ i pritisnite Enter..."
                        className="flex-grow border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />

                    <button
                        type="button"
                        onClick={handleAddTag}
                        disabled={!inputValue.trim()}
                        className="flex items-center justify-center bg-white hover:bg-blue-50 text-slate-500 hover:text-blue-700 border border-slate-300 hover:border-blue-300 px-4 py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed shadow-sm"
                        title="Dodaj ključnu riječ"
                    >
                        <IconPlus className="w-5 h-5" />
                    </button>
                </div>

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag: string, index: number) => (
                            <span
                                key={index}
                                className="flex items-center gap-2 bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-md text-sm font-semibold shadow-sm"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="text-blue-400 hover:text-red-600 focus:outline-none transition-colors flex items-center justify-center"
                                    title="Ukloni"
                                >
                                    <IconX className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

//// TODO!

export function AnalysisSectionPlaceholder() {
    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-dashed border-slate-300 flex flex-col items-center justify-center py-12 text-slate-400">
            <h3 className="text-lg font-bold text-slate-600 mb-2">Vrste analiza</h3>
            <p className="text-sm">Ovdje će biti smještena složena komponenta za odabir vrsta analiza.</p>
            <span className="mt-4 px-3 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">U izradi / Čeka dizajn</span>
        </div>
    );
}

export function WorksSectionPlaceholder() {
    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-dashed border-slate-300 flex flex-col items-center justify-center py-12 text-slate-400">
            <h3 className="text-lg font-bold text-slate-600 mb-2">Provedeni radovi</h3>
            <p className="text-sm">Ovdje će biti smještena složena komponenta za unos provedenih radova.</p>
            <span className="mt-4 px-3 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">U izradi / Čeka dizajn</span>
        </div>
    );
}