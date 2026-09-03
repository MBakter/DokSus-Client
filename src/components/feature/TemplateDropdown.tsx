import {useEffect, useRef, useState} from "preact/hooks";
import {IconChevronDown, IconDownload} from "../../assets/Icons.tsx";
import {useCategoryReference} from "../../data/reference/ReferenceData.ts";

const NO_TEMPLATE_CATEGORIES = [
    'UNSPECIFIED',
    'DIPLOMSKI_I_SEMINARSKI_RADOVI',
];

export function TemplateDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { categories, isLoading } = useCategoryReference();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const templates = categories.filter(cat => !NO_TEMPLATE_CATEGORIES.includes(cat.id));

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Styled to sit flat on the shared background with a hover effect */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-blue-900 hover:bg-slate-300/40 font-medium text-sm rounded-md transition-colors cursor-pointer"
            >
                <IconDownload className="w-4 h-4 text-inherit" />
                <span>Obrasci</span>
                <IconChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full z-50 left-0 mt-3 w-72 bg-white rounded-md shadow-lg border border-slate-200 py-2">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preuzmi obrazac</span>
                    </div>

                    {isLoading ? (
                        <div className="px-4 py-3 text-sm text-slate-400 italic">
                            Učitavanje...
                        </div>
                    ) : templates.length > 0 ? (
                        templates.map((t) => (
                            <a
                                key={t.id}
                                href={`/api/files/template/${t.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-900 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {t.name}
                            </a>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-slate-400 italic">
                            Nema dostupnih predložaka
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}