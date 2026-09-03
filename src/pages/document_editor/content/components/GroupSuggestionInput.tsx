import {useEffect, useRef, useState} from "preact/hooks";
import {useGroupReference} from "../../../../data/reference/ReferenceData.ts";

interface GroupSuggestionInputProps {
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function GroupSuggestionInput({ name, value, onChange }: GroupSuggestionInputProps) {
    const { groups } = useGroupReference();
    const [isOpen, setIsOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null); // Added ref for the input

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredGroups = groups.filter(g =>
        g.toLowerCase().includes((value || '').toLowerCase()) &&
        g.toLowerCase() !== (value || '').toLowerCase()
    );

    const handleSuggestionClick = (group: string) => {
        if (inputRef.current) {
            // Safely bypass React's internal value tracker to trigger a real change
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
            nativeInputValueSetter?.call(inputRef.current, group);

            // Dispatch a native 'input' event that React listens for
            const event = new Event('input', { bubbles: true });
            inputRef.current.dispatchEvent(event);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <input
                ref={inputRef}
                type="text"
                name={name}
                value={value || ''}
                onChange={(e) => {
                    onChange(e); // Passes the real typing event normally
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Npr. Muzej za umjetnost i obrt"
                className="border border-slate-300 rounded-md p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all w-full"
            />

            {isOpen && filteredGroups.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-md shadow-lg border border-slate-200 z-50 max-h-60 overflow-y-auto">
                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
                        Prijedlozi iz postojećih dokumenata
                    </div>
                    {filteredGroups.map((group) => (
                        <button
                            key={group}
                            type="button"
                            onClick={() => handleSuggestionClick(group)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                        >
                            {group}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}