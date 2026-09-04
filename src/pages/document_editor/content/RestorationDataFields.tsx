import {type RestorationData} from "../../../data/types/Document.ts";
import {useEffect, useRef, useState} from 'preact/hooks';
import {IconChevronDown, IconPlus, IconTrash, IconX} from "../../../assets/Icons.tsx";
import {useAnalysisTypeReference, useCategoryReference} from "../../../data/reference/ReferenceData.ts";
import {GroupSuggestionInput} from "./components/GroupSuggestionInput.tsx";

export interface RestorationDataProps {
    restorationData: RestorationData;
    onChange: <K extends keyof RestorationData>(
        field: K,
        value: RestorationData[K] | ((prev: RestorationData[K]) => RestorationData[K])
    ) => void;
}

const MIN_KEYWORDS = 3;
const MAX_KEYWORDS = 10;

export const useTextHandler = (onChange: any) => {
    return (field: keyof RestorationData) => (e: Event) => {
        onChange(field, (e.currentTarget as any).value);
    };
};

export function RestorationDataFields({restorationData, handleRestorationDataChange, checkRequired}: any) {
    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-2">Podaci o predmetu i
                restauraciji</h2>

            <BasicDataSection
                restorationData={restorationData}
                onChange={handleRestorationDataChange}
                checkRequired={checkRequired}
            />

            <MaterialDetailsSection
                restorationData={restorationData}
                onChange={handleRestorationDataChange}
            />

            <WorksSection
                restorationData={restorationData}
                onChange={handleRestorationDataChange}
            />

            <AnalysisSection
                restorationData={restorationData}
                onChange={handleRestorationDataChange}
                checkRequired={checkRequired}
            />

            <KeywordsSection
                restorationData={restorationData}
                onChange={handleRestorationDataChange}
                checkRequired={checkRequired}
            />
        </div>
    );
}

export function BasicDataSection({restorationData, onChange, checkRequired}: any) {
    const {categories, isLoading} = useCategoryReference();
    const textHandler = useTextHandler(onChange);

    const Label = ({field, label}: { field: string, label: string }) => (
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
            {label}
            {checkRequired && checkRequired(field) && (
                <span className="text-red-500 font-bold" title="Obavezno polje">*</span>
            )}
        </label>
    );

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">
                Osnovni podaci o predmetu
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* COLUMN 1: Category */}
                <div className="flex flex-col gap-1">
                    <Label field="category" label="Kategorija"/>
                    <select
                        name="category"
                        value={restorationData.category || "UNSPECIFIED"}
                        onChange={textHandler('category')}
                        disabled={isLoading}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all w-full disabled:opacity-50"
                    >
                        <option value="UNSPECIFIED" disabled hidden>
                            Odaberite kategoriju...
                        </option>

                        {categories.filter(c => c.id !== 'UNSPECIFIED').map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* COLUMN 2: Group*/}
                <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-2">
                        <Label field="group" label="Grupa / Zbirka"/>

                    </div>
                    <GroupSuggestionInput
                        name="group"
                        value={restorationData.group}
                        onChange={textHandler('group')}
                    />

                    <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                        Dodajte ako je umjetnina dio specifične zbirke, ciklusa ili projekta.
                    </p>
                </div>

                {/* SPAN 2: Name */}
                <div className="flex flex-col gap-1 md:col-span-2">
                    <Label field="name" label="Naslov / Naziv"/>
                    <input
                        type="text" name="name"
                        value={restorationData.name}
                        onChange={textHandler('name')}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all font-medium"
                    />
                </div>

                {/* COLUMN 1: Inventory Number */}
                <div className="flex flex-col gap-1">
                    <Label field="inventoryNumber" label="Inventarni broj (OKIRU)"/>
                    <input
                        type="text" name="inventoryNumber"
                        value={restorationData.inventoryNumber}
                        onChange={textHandler('inventoryNumber')}
                        placeholder="npr. 430"
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                {/* COLUMN 2: Author */}
                <div className="flex flex-col gap-1">
                    <Label field="author" label="Autor"/>
                    <input
                        type="text" name="author"
                        value={restorationData.author}
                        onChange={textHandler('author')}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <Label field="date" label="Datacija"/>
                    <input
                        type="text" name="date"
                        value={restorationData.date}
                        onChange={textHandler('date')}
                        placeholder="npr. 19. stoljeće"
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <Label field="material" label="Materijal"/>
                    <input
                        type="text" name="material"
                        value={restorationData.material}
                        onChange={textHandler('material')}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <Label field="technique" label="Tehnika"/>
                    <input
                        type="text" name="technique"
                        value={restorationData.technique}
                        onChange={textHandler('technique')}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <Label field="location" label="Izvorni smještaj / lokacija"/>
                    <input
                        type="text" name="location"
                        value={restorationData.location}
                        onChange={textHandler('location')}
                        className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <Label field="storage" label="Trenutni smještaj / lokacija"/>
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

export function MaterialDetailsSection({ restorationData, onChange }: any) {

    const InlineListField = ({ label, fieldName }: { label: string, fieldName: string }) => {
        const [inputValue, setInputValue] = useState("");

        // Convert the backend string into an array of trimmed items for display
        const rawValue = restorationData[fieldName] || "";
        const items: string[] = rawValue ? rawValue.split(',').map((t: string) => t.trim()).filter(Boolean) : [];

        const handleAdd = () => {
            const val = inputValue.trim();
            if (val && !items.includes(val)) {
                const updatedItems = [...items, val];
                // Join back into a comma-separated string for the backend string type
                onChange(fieldName, updatedItems.join(', '));
            }
            setInputValue("");
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
            }
        };

        const handleRemove = (indexToRemove: number) => {
            const updatedItems = items.filter((_, idx) => idx !== indexToRemove);
            onChange(fieldName, updatedItems.join(', '));
        };

        return (
            <div className="flex flex-col gap-1 min-w-0">
                <label className="text-sm font-semibold text-slate-700">{label}</label>

                <div className="relative flex items-center w-full">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue((e.target as HTMLInputElement).value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Unesite i pritisnite Enter..."
                        className="w-full border border-slate-300 rounded-md p-2.5 pr-10 text-sm text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                    />

                    {inputValue.trim().length > 0 && (
                        <button
                            type="button"
                            onClick={handleAdd}
                            className="absolute right-2.5 p-1 text-slate-400 hover:text-blue-900 transition-colors cursor-pointer"
                            title="Dodaj"
                        >
                            <IconPlus className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="flex flex-wrap items-center mt-1.5 text-sm text-slate-700 leading-relaxed max-w-full overflow-hidden">
                        {items.map((item, idx) => (
                            <span key={idx} className="inline-flex items-center max-w-full">
                                <span
                                    onClick={() => handleRemove(idx)}
                                    className="font-medium text-slate-800 hover:text-red-600 hover:underline cursor-pointer transition-colors break-words max-w-full"
                                    title="Kliknite za uklanjanje"
                                >
                                    {item}
                                </span>
                                {idx < items.length - 1 && <span className="mr-1.5 text-slate-400 shrink-0">,</span>}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
            <div className="mb-6 border-b border-slate-100 pb-2 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">
                    Detalji izrade
                </h3>
                <span className="text-xs text-slate-400 italic">
                    * Kliknite na unesenu vrijednost za brisanje
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InlineListField label="Pigmenti" fieldName="pigment" />
                <InlineListField label="Veziva" fieldName="binder" />
                <InlineListField label="Završni sloj" fieldName="finishingLayer" />
            </div>
        </div>
    );
}

export function KeywordsSection({ restorationData, onChange, checkRequired }: any) {
    const [inputValue, setInputValue] = useState("");

    const getTagsArray = (keywords: any): string[] => {
        if (Array.isArray(keywords)) return keywords;
        if (typeof keywords === 'string') {
            return keywords.split(',').map(t => t.trim()).filter(Boolean);
        }
        return [];
    };

    const tags = getTagsArray(restorationData.keywords);
    const tagsCount = tags.length;

    // Verify if keywords is required using the passed prop
    const isRequired = checkRequired ? checkRequired('keywords') : true;

    const handleAddTag = () => {
        const newTag = inputValue.trim();
        // Prevent adding if empty, already exists, or max limit is reached
        if (!newTag || tags.includes(newTag) || tagsCount >= MAX_KEYWORDS) return;

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
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-2">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-1">
                    Ključne riječi
                    {isRequired && (
                        <span className="text-red-500 font-bold" title="Obavezno polje">*</span>
                    )}
                </h3>
                {isRequired && (
                    <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagsCount >= MIN_KEYWORDS ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                    >
                        {tagsCount < MIN_KEYWORDS
                            ? `Dodajte još ${MIN_KEYWORDS - tagsCount}`
                            : tagsCount >= MAX_KEYWORDS
                                ? `Maksimum dosegnut (${MAX_KEYWORDS}/${MAX_KEYWORDS})`
                                : `${tagsCount}/${MAX_KEYWORDS}`}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue((e.target as HTMLInputElement).value)}
                        onKeyDown={handleKeyDown}
                        disabled={tagsCount >= MAX_KEYWORDS}
                        placeholder={tagsCount >= MAX_KEYWORDS ? "Dosegnut je maksimalan broj ključnih riječi." : "Unesite ključnu riječ i pritisnite Enter..."}
                        className="flex-grow border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all disabled:opacity-50 disabled:bg-slate-50"
                    />

                    <button
                        type="button"
                        onClick={handleAddTag}
                        disabled={!inputValue.trim() || tagsCount >= MAX_KEYWORDS}
                        className="relative z-10 flex items-center justify-center gap-2 bg-slate-700 hover:bg-blue-900 text-white border border-slate-800 hover:border-blue-900 px-4 py-2.5 rounded-md transition-all duration-200 disabled:opacity-40 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed shadow-sm text-sm font-semibold shrink-0 cursor-pointer"
                        title={tagsCount >= MAX_KEYWORDS ? "Maksimum dosegnut" : "Dodaj ključnu riječ"}
                    >
                        <IconPlus className="w-4 h-4 pointer-events-none"/>
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
                                    <IconX/>
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export function AnalysisSection({ restorationData, onChange, checkRequired }: any) {
    const { analysisTypes, isLoading } = useAnalysisTypeReference();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [language, setLanguage] = useState<'hr' | 'en'>('hr');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const analyses = restorationData.typeOfAnalysis || [];
    const isRequired = checkRequired ? checkRequired('typeOfAnalysis') : false;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddAnalysis = (typeId: string) => {
        // Removed 'times' property
        const newAnalysis = { type: typeId, goal: '' };
        onChange('typeOfAnalysis', [...analyses, newAnalysis]);
        setIsDropdownOpen(false);
    };

    const handleUpdateAnalysis = (index: number, field: string, value: any) => {
        const updated = [...analyses];
        updated[index] = { ...updated[index], [field]: value };
        onChange('typeOfAnalysis', updated);
    };

    const handleRemoveAnalysis = (index: number) => {
        const updated = [...analyses];
        updated.splice(index, 1);
        onChange('typeOfAnalysis', updated);
    };

    const getAnalysisDetails = (typeId: string) => {
        return analysisTypes.find((a: any) => a.id === typeId);
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
            {/* Header Area with Global Language Selector */}
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-2">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-1">
                    Vrste analiza
                    {isRequired && (
                        <span className="text-red-500 font-bold" title="Obavezno polje">*</span>
                    )}
                </h3>

                <div className="flex bg-slate-50 rounded border border-slate-300 overflow-hidden text-xs font-bold shadow-sm">
                    <button
                        type="button"
                        onClick={() => setLanguage('hr')}
                        className={`px-3 py-1.5 cursor-pointer transition-colors ${language === 'hr' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                        HR
                    </button>
                    <button
                        type="button"
                        onClick={() => setLanguage('en')}
                        className={`px-3 py-1.5 cursor-pointer transition-colors ${language === 'en' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                        EN
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-6">

                {analyses.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {analyses.map((analysis: any, index: number) => {
                            const details = getAnalysisDetails(analysis.type);
                            const displayName = details
                                ? (language === 'hr' ? details.nameHr : details.nameEn)
                                : analysis.type;

                            return (
                                <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border border-slate-200 rounded-md bg-slate-50 relative group">

                                    <div className="flex flex-col gap-3 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-900 text-xs font-bold rounded">
                                                    {details?.abbr || 'N/A'}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-800 leading-tight">
                                                {displayName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 md:w-2/3">
                                        <label className="text-sm font-semibold text-slate-700">Cilj analize</label>
                                        <textarea
                                            value={analysis.goal}
                                            onChange={(e) => handleUpdateAnalysis(index, 'goal', (e.currentTarget as HTMLTextAreaElement).value)}
                                            placeholder="Opišite svrhu i cilj provođenja ove analize..."
                                            rows={4}
                                            className="w-full border border-slate-300 rounded-md p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all resize-none overflow-y-auto"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAnalysis(index)}
                                        className="absolute -top-3 -right-3 w-7 h-7 bg-white border border-slate-200 rounded flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 shadow-sm transition-all md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                        title="Ukloni analizu"
                                    >
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 italic">Nisu dodane vrste analiza.</p>
                )}

                <div className="relative w-full md:w-170" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        disabled={isLoading}
                        className="flex items-center justify-between w-full bg-slate-50 border border-slate-300 hover:border-blue-900 text-slate-700 px-4 py-2.5 rounded-md transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:opacity-50 cursor-pointer"
                    >
                        <span className="flex items-center gap-2 font-semibold text-sm">
                            <IconPlus className="w-4 h-4" />
                            Dodaj novu analizu
                        </span>
                        <IconChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute z-20 top-full left-0 mt-2 w-full max-h-80 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-lg flex flex-col">
                            <div className="sticky top-0 bg-slate-100 border-b border-slate-200 px-4 py-2 z-10">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Odabir vrste</span>
                            </div>

                            <div className="flex flex-col py-1">
                                {analysisTypes.map((type: any) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => handleAddAnalysis(type.id)}
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-left transition-colors border-b border-slate-50 last:border-0 cursor-pointer"
                                    >
                                        <div className="w-24 shrink-0 text-center">
                                            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-xs font-bold rounded">
                                                {type.abbr || '-'}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-slate-800">
                                            {language === 'hr' ? type.nameHr : type.nameEn}
                                        </span>
                                    </button>
                                ))}
                                {analysisTypes.length === 0 && !isLoading && (
                                    <div className="px-4 py-3 text-sm text-slate-500 italic text-center">Nema dostupnih analiza</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function WorksSection({ restorationData, onChange, checkRequired }: any) {
    const [workName, setWorkName] = useState("");
    const [workMaterial, setWorkMaterial] = useState("");

    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editMaterial, setEditMaterial] = useState("");

    const works = restorationData.works || [];
    const isRequired = checkRequired ? checkRequired('works') : false;

    const handleAddWork = () => {
        if (!workName.trim() || !workMaterial.trim()) return;

        onChange('works', [
            ...works,
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

        const updated = [...works];
        updated[index] = { name: editName.trim(), material: editMaterial.trim() };
        onChange('works', updated);

        setEditingIndex(null);
    };

    const handleRemoveWork = (indexToRemove: number) => {
        const updated = works.filter((_: any, index: number) => index !== indexToRemove);
        onChange('works', updated);

        if (editingIndex === indexToRemove) {
            handleCancelEdit();
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2 flex items-center gap-1">
                Provedeni radovi
                {isRequired && (
                    <span className="text-red-500 font-bold" title="Obavezno polje">*</span>
                )}
            </h3>

            {/* List of existing works */}
            {works.length > 0 && (
                <div className="flex flex-col gap-4 mb-8">
                    {works.map((work: { name: string, material: string }, index: number) => {

                        // EDIT MODE
                        if (editingIndex === index) {
                            return (
                                <div key={index} className="flex flex-col gap-3 p-5 rounded-md border border-slate-300 bg-white shadow-sm">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-1">Uredi rad</h4>
                                    <textarea
                                        value={editName}
                                        onChange={(e) => setEditName((e.currentTarget as HTMLTextAreaElement).value)}
                                        rows={3}
                                        className="w-full border border-slate-300 rounded-md p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all resize-none bg-white overflow-y-auto"
                                    />
                                    <input
                                        type="text"
                                        value={editMaterial}
                                        onChange={(e) => setEditMaterial((e.currentTarget as HTMLInputElement).value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSaveEdit(index);
                                            }
                                        }}
                                        className="w-full border border-slate-300 rounded-md p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all bg-white"
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-md transition-colors cursor-pointer"
                                        >
                                            Odustani
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSaveEdit(index)}
                                            disabled={!editName.trim() || !editMaterial.trim()}
                                            className="px-4 py-2 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                                        >
                                            Spremi promjene
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        // VIEW MODE
                        return (
                            <div key={index} className="flex justify-between gap-4 p-5 rounded-md border border-slate-200 bg-slate-50 group hover:border-slate-300 transition-colors">
                                <div className="flex flex-col gap-2 flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 leading-relaxed break-words whitespace-pre-wrap">
                                        {work.name}
                                    </p>

                                    <p className="text-sm text-slate-600 break-words border-t border-slate-200 pt-2 mt-1">
                                        <span className="font-semibold text-slate-700">Korišteni materijal:</span> {work.material}
                                    </p>
                                </div>

                                <div className="flex-shrink-0 flex gap-1.5 self-start opacity-15 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() => handleStartEdit(index, work)}
                                        className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors border border-slate-300 bg-white shadow-sm cursor-pointer"
                                    >
                                        Uredi
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveWork(index)}
                                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors border border-slate-300 bg-white shadow-sm cursor-pointer"
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
            <div className="flex flex-col gap-3 bg-slate-50 p-5 rounded-md border border-slate-200 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-700 mb-1">
                    Dodaj postupak
                </h4>

                <textarea
                    value={workName}
                    onChange={(e) => setWorkName((e.currentTarget as HTMLTextAreaElement).value)}
                    placeholder="Naziv provedenog postupka (npr. Uklanjanje površinske nečistoće)..."
                    rows={3}
                    className="w-full border border-slate-300 rounded-md p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all resize-none bg-white overflow-y-auto"
                />

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={workMaterial}
                        onChange={(e) => setWorkMaterial((e.currentTarget as HTMLInputElement).value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddWork();
                            }
                        }}
                        placeholder="Korišteni materijal (npr. Destilirana voda, sapun)..."
                        className="flex-grow border border-slate-300 rounded-md p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all bg-white"
                    />

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