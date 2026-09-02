import {type RestorationData} from "../../../data/types/Document.ts";
import { useState } from 'preact/hooks';
import {IconPlus, IconTrash, IconX} from "../../../assets/Icons.tsx";
import {useCategoryReference} from "../../../data/reference/ReferenceData.ts";

export interface RestorationDataProps {
    restorationData: RestorationData;
    onChange: <K extends keyof RestorationData>(
        field: K,
        value: RestorationData[K] | ((prev: RestorationData[K]) => RestorationData[K])
    ) => void;
}

export const useTextHandler = (onChange: any) => {
    return (field: keyof RestorationData) => (e: Event) => {
        onChange(field, (e.currentTarget as any).value);
    };
};
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

            <WorksSection
                restorationData={restorationData}
                onChange={handleRestorationDataChange}
            />

            <AnalysisSectionPlaceholder />

            <KeywordsSection
                restorationData={restorationData}
                onChange={handleRestorationDataChange}
            />
        </div>
    );
}

export function BasicDataSection({ restorationData, onChange }: RestorationDataProps) {
    const { categories, isLoading } = useCategoryReference();
    const textHandler = useTextHandler(onChange);

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
                        value={restorationData.category || "UNSPECIFIED"}
                        onChange={textHandler('category')}
                        disabled={isLoading}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all w-full disabled:opacity-50"
                    >
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Inventarni broj (OKIRU)</label>
                    <input
                        type="text" name="inventoryNumber"
                        value={restorationData.inventoryNumber}
                        onChange={textHandler('inventoryNumber')}
                        placeholder="npr. OKIRU-2023-01"
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Naslov / Naziv</label>
                    <input
                        type="text" name="name"
                        value={restorationData.name}
                        onChange={textHandler('name')}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all font-medium"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Autor</label>
                    <input
                        type="text" name="author"
                        value={restorationData.author}
                        onChange={textHandler('author')}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Datacija</label>
                    <input
                        type="text" name="date"
                        value={restorationData.date}
                        onChange={textHandler('date')}
                        placeholder="npr. 19. stoljeće"
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Materijal</label>
                    <input
                        type="text" name="material"
                        value={restorationData.material}
                        onChange={textHandler('material')}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Tehnika</label>
                    <input
                        type="text" name="technique"
                        value={restorationData.technique}
                        onChange={textHandler('technique')}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Izvorni smještaj / lokacija</label>
                    <input
                        type="text" name="location"
                        value={restorationData.location}
                        onChange={textHandler('location')}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Trenutni smještaj / lokacija</label>
                    <input
                        type="text" name="storage"
                        value={restorationData.storage}
                        onChange={textHandler('storage')}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>
            </div>
        </div>
    );
}

export function MaterialDetailsSection({ restorationData, onChange }: RestorationDataProps) {
    const textHandler = useTextHandler(onChange);

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
                        value={restorationData.pigment}
                        onChange={textHandler('pigment')}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Veziva</label>
                    <input
                        type="text" name="binder"
                        value={restorationData.binder}
                        onChange={textHandler('binder')}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Završni sloj</label>
                    <input
                        type="text" name="finishingLayer"
                        value={restorationData.finishingLayer}
                        onChange={textHandler('finishingLayer')}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>
            </div>
        </div>
    );
}

export function KeywordsSection({ restorationData, onChange }: any) {
    const [inputValue, setInputValue] = useState("");

    // Safely parse keywords whether they are stored as a string or an array
    const getTagsArray = (keywords: any): string[] => {
        if (Array.isArray(keywords)) return keywords;
        if (typeof keywords === 'string') {
            return keywords.split(',').map(t => t.trim()).filter(Boolean);
        }
        return [];
    };

    const tags = getTagsArray(restorationData.keywords);

    const handleAddTag = () => {
        const newTag = inputValue.trim();
        if (!newTag || tags.includes(newTag)) return;

        // Safely pass the updated string back through onChange
        onChange('keywords', (prev: any) => {
            const current = getTagsArray(prev);
            return [...current, newTag].join(', ');
        });

        setInputValue("");
    };

    const removeTag = (tagToRemove: string) => {
        onChange('keywords', (prev: any) => {
            const current = getTagsArray(prev);
            return current.filter(tag => tag !== tagToRemove).join(', ');
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
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
                        className="relative z-10 flex items-center justify-center gap-2 bg-slate-700 hover:bg-blue-900 text-white border border-slate-800 hover:border-blue-900 px-4 py-2.5 rounded-md transition-all duration-200 disabled:opacity-40 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed shadow-sm text-sm font-semibold shrink-0 cursor-pointer"
                        title="Dodaj ključnu riječ"
                    >
                        <IconPlus className="w-4 h-4 pointer-events-none" />
                        <span className="pointer-events-none">Dodaj</span>
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
                                    className="text-blue-400 hover:text-red-600 focus:outline-none transition-colors flex items-center justify-center cursor-pointer"
                                    title="Ukloni"
                                >
                                    <IconX />
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

export function WorksSection({ restorationData, onChange }: any) {
    const [workName, setWorkName] = useState("");
    const [workMaterial, setWorkMaterial] = useState("");

    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editMaterial, setEditMaterial] = useState("");

    const works = restorationData.works || [];

    const handleAddWork = () => {
        if (!workName.trim() || !workMaterial.trim()) return;

        onChange('works', (prevWorks: any[]) => [
            ...prevWorks,
            { name: workName.trim(), material: workMaterial.trim() }
        ]);

        setWorkName("");
        setWorkMaterial("");
    };

    const handleStartEdit = (index: number, work: { name: string, material: string }) => {
        setEditingIndex(index);
        setEditName(work.name);
        setEditMaterial(work.material);
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditName("");
        setEditMaterial("");
    };

    const handleSaveEdit = (index: number) => {
        if (!editName.trim() || !editMaterial.trim()) return;

        onChange('works', (prevWorks: any[]) => {
            const updated = [...prevWorks];
            updated[index] = { name: editName.trim(), material: editMaterial.trim() };
            return updated;
        });

        setEditingIndex(null);
    };

    const handleRemoveWork = (indexToRemove: number) => {
        onChange('works', (prevWorks: any[]) =>
            prevWorks.filter((_, index) => index !== indexToRemove)
        );
        if (editingIndex === indexToRemove) {
            handleCancelEdit();
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">
                Provedeni radovi
            </h3>

            {/* List of existing works */}
            {works.length > 0 && (
                <div className="flex flex-col gap-4 mb-8">
                    {works.map((work: { name: string, material: string }, index: number) => {

                        // EDIT MODE
                        if (editingIndex === index) {
                            return (
                                <div key={index} className="flex flex-col gap-3 p-5 rounded-md border border-blue-200 bg-blue-50/50 shadow-sm">
                                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Uredi rad</h4>
                                    <textarea
                                        value={editName}
                                        onChange={(e) => setEditName((e.currentTarget as HTMLTextAreaElement).value)}
                                        rows={3}
                                        className="w-full border border-blue-300 rounded-md p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all resize-none bg-white"
                                    />
                                    <input
                                        type="text"
                                        value={editMaterial}
                                        onChange={(e) => setEditMaterial((e.currentTarget as HTMLInputElement).value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveEdit(index); } }}
                                        className="w-full border border-blue-300 rounded-md p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all bg-white"
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-md transition-colors"
                                        >
                                            Odustani
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSaveEdit(index)}
                                            disabled={!editName.trim() || !editMaterial.trim()}
                                            className="px-4 py-2 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-md transition-colors disabled:opacity-50"
                                        >
                                            Spremi promjene
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        // VIEW MODE (Restored subtle blue accent borders and background)
                        return (
                            <div key={index} className="flex justify-between gap-4 p-5 rounded-md border border-blue-100 bg-blue-50/30 group hover:border-blue-200 transition-colors">
                                <div className="flex flex-col gap-2 flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 leading-relaxed break-words">
                                        {work.name}
                                    </p>

                                    <p className="text-sm text-slate-600 break-words border-t border-blue-100 pt-2 mt-1">
                                        <span className="font-semibold text-slate-700">Korišteni materijal:</span> {work.material}
                                    </p>
                                </div>

                                <div className="flex-shrink-0 flex gap-1.5 self-start opacity-15 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() => handleStartEdit(index, work)}
                                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 rounded transition-colors border border-blue-200 bg-white shadow-sm"
                                    >
                                        Uredi
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveWork(index)}
                                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors border border-slate-200 bg-white shadow-sm"
                                        title="Ukloni rad"
                                    >
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Input area for new work */}
            <div className="flex flex-col gap-3 bg-blue-50/20 p-5 rounded-md border border-blue-100 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Dodaj novi rad</h4>

                <textarea
                    value={workName}
                    onChange={(e) => setWorkName((e.currentTarget as HTMLTextAreaElement).value)}
                    placeholder="Opis provedenog rada (npr. Uklanjanje površinske nečistoće)..."
                    rows={3}
                    className="w-full border border-slate-300 rounded-md p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all resize-none bg-white"
                />

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={workMaterial}
                        onChange={(e) => setWorkMaterial((e.currentTarget as HTMLInputElement).value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddWork(); } }}
                        placeholder="Korišteni materijal (npr. Destilirana voda, blagi deterdžent)..."
                        className="flex-grow border border-slate-300 rounded-md p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all bg-white"
                    />

                    {/* Styled to match your preferred button layout */}
                    <button
                        type="button"
                        onClick={handleAddWork}
                        disabled={!workName.trim() || !workMaterial.trim()}
                        className="relative z-10 flex items-center justify-center gap-2 bg-slate-700 hover:bg-blue-900 text-white border border-slate-800 hover:border-blue-900 px-4 py-2.5 rounded-md transition-all duration-200 disabled:opacity-40 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed shadow-sm text-sm font-semibold shrink-0 cursor-pointer"
                    >
                        <IconPlus className="w-4 h-4 pointer-events-none" />
                        <span className="pointer-events-none">Dodaj</span>
                    </button>
                </div>
            </div>
        </div>
    );
}