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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-400 bg-white">
            <div className="flex items-center gap-8">
                {/* Logo Area */}
                <div className="flex items-center gap-2">
                    <div className="font-bold text-xl text-blue-900 tracking-wide">
                        Doksus<br /><span className="text-yellow-600">OKIRU</span>
                    </div>
                </div>

                {/* Navigation & Search */}
                <nav>
                    <a href="/" className="text-gray-800 font-medium hover:text-black">Početna</a>
                </nav>
                <div className="relative ml-4 flex items-center">
                    <input
                        type="text"
                        value={localInput}
                        onInput={(e) => setLocalInput((e.target as HTMLInputElement).value)}
                        onKeyDown={handleKeyDown}
                        className="border border-gray-600 rounded px-3 py-1 text-sm w-64 focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={executeSearch}
                        className="absolute right-2 text-gray-500 cursor-pointer bg-transparent border-none"
                    >
                        ⌕
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
                <a href="/kontakt" className="text-gray-800 font-medium hover:text-black">Kontakt</a>

                {isAuthenticated ? (
                    <button onClick={logout} className="text-gray-800 font-medium hover:text-black">
                        Odjava
                    </button>
                ) : (
                    <a href="/prijava" className="text-gray-800 font-medium hover:text-black">
                        Prijava
                    </a>
                )}
            </div>
        </div>
    );
}