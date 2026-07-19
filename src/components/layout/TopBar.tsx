import {useContext, useEffect, useState} from 'preact/hooks';
import { AuthContext } from '../../context/AuthContext';
import {route} from "preact-router";

export function TopBar() {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const [localInput, setLocalInput] = useState('');

    // Synchronize the local input field if the URL changes (e.g., via browser back button)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            setLocalInput(params.get('search') || '');
        }
    }, [typeof window !== 'undefined' ? window.location.search : '']);

    const executeSearch = () => {
        const params = new URLSearchParams(window.location.search);

        if (localInput.trim() !== '') {
            params.set('search', localInput);
        } else {
            params.delete('search');
        }

        params.delete('page'); // Reset to the first page on a new search
        route(`/?${params.toString()}`);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') executeSearch();
    };

    return (
        <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white shadow-sm z-20 relative">
            <div className="flex items-center gap-10">
                {/* Brand Logo */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => route('/')}>
                    <div className="font-extrabold text-xl text-blue-900 tracking-tight leading-none">
                        Doksus<br /><span className="text-yellow-600 text-sm tracking-widest uppercase">OKIRU</span>
                    </div>
                </div>

                {/* Primary Navigation */}
                <nav className="flex items-center gap-6">
                    <a href="/" className="text-slate-600 font-medium hover:text-blue-900 transition-colors text-sm">Početna</a>
                    <a href="/katalog" className="text-slate-600 font-medium hover:text-blue-900 transition-colors text-sm">Katalog oštećenja</a>
                </nav>

                {/* Modernized Search Bar */}
                <div className="relative flex items-center ml-4">
                    <input
                        type="text"
                        placeholder="Pretraži arhivu..."
                        value={localInput}
                        onInput={(e) => setLocalInput((e.target as HTMLInputElement).value)}
                        onKeyDown={handleKeyDown}
                        className="w-72 bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-md pl-4 pr-10 py-2 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 placeholder:text-slate-400"
                    />
                    <button
                        onClick={executeSearch}
                        className="absolute right-2 text-slate-400 hover:text-blue-900 transition-colors p-1"
                        title="Pretraži"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
                <a href="/kontakt" className="text-slate-600 font-medium hover:text-blue-900 transition-colors text-sm">Kontakt</a>

                {isAuthenticated ? (
                    <button
                        onClick={logout}
                        className="text-slate-600 font-medium hover:text-red-700 transition-colors text-sm"
                    >
                        Odjava
                    </button>
                ) : (
                    <a
                        href="/prijava"
                        className="bg-blue-900 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-800 transition-colors shadow-sm text-sm"
                    >
                        Prijava
                    </a>
                )}
            </div>
        </div>
    );
}