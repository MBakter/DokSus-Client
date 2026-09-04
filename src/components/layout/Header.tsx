import {useContext, useEffect, useState} from 'preact/hooks';
import {route} from 'preact-router';
import {AuthContext} from "../../context/AuthContext.tsx";
import {IconPlus, IconSearch, IconSignIn, IconSignOut} from "../../assets/Icons.tsx";
import {TemplateDropdown} from "../feature/TemplateDropdown.tsx";

export function Header() {
    return (
        <header className="w-full flex flex-col">
            <TopBar />
            <AccountBanner />
        </header>
    );
}

export function AccountBanner() {
    const { user, isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated || !user) {
        return null;
    }

    const initials = `${user.name?.charAt(0) || ''}${user.surname?.charAt(0) || ''}`.toUpperCase();
    const fullName = `${user.name} ${user.surname}`;

    return (
        <div className="flex items-center justify-between px-8 py-3 bg-slate-100 border-b border-slate-200">
            <nav className="flex items-center gap-6">

                {/* Shared background track grouping the primary and secondary actions */}
                <div className="flex items-center bg-slate-200/60 p-1 rounded-lg border border-slate-200">

                    {/* Elevated white button for the main action */}
                    <a
                        href="/novo"
                        className="flex items-center gap-1.5 px-3.5 mr-1.5 py-1.5 bg-white text-slate-700 hover:text-blue-900 font-semibold text-sm rounded-md shadow-sm border border-slate-200/60 transition-all"
                    >
                        <IconPlus className="w-4 h-4 text-slate-700 hover:text-blue-900" />
                        <span>Novi dokument</span>
                    </a>

                    <TemplateDropdown />
                </div>

                <div className="w-px h-6 bg-slate-300" />

                <a href="/racun" className="text-slate-600 font-medium text-sm hover:text-blue-900 transition-colors">
                    Moji projekti
                </a>

                <a href="/katalog" className="text-slate-600 font-medium text-sm hover:text-blue-900 transition-colors">
                    Katalog oštećenja
                </a>
            </nav>

            <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500 font-medium">Prijavljeni ste kao {fullName}</span>
                <a
                    href="/racun"
                    className="w-9 h-9 flex items-center justify-center bg-blue-900 text-white rounded-full text-sm font-bold ring-2 ring-white shadow-sm hover:bg-blue-800 hover:scale-105 transition-all cursor-pointer"
                    title="Otvori moj račun"
                >
                    {initials}
                </a>
            </div>
        </div>
    );
}

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
                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => route('/')}>
                    <img src="/src/assets/logo.svg" alt="Doksus OKIRU" className="h-12 w-auto" />
                </div>

                {/* Primary Navigation */}
                <nav className="flex items-center gap-6">
                    <a href="/" className="text-slate-600 font-medium hover:text-blue-900 transition-colors text-base">
                        Početna
                    </a>
                </nav>

                {/* Modernized Search Bar */}
                <div className="relative flex items-center ml-4">
                    <input
                        type="text"
                        placeholder="Pretraži..."
                        value={localInput}
                        onInput={(e) => setLocalInput((e.target as HTMLInputElement).value)}
                        onKeyDown={handleKeyDown}
                        className="w-80 bg-slate-50 border border-slate-300 text-slate-800 text-base rounded-md pl-4 pr-10 py-2.5 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 placeholder:text-slate-400"
                    />
                    <button
                        onClick={executeSearch}
                        className="absolute right-3 text-slate-400 hover:text-blue-900 transition-colors p-1"
                        title="Pretraži"
                    >
                        <IconSearch/>
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
                <a href="/kontakt" className="text-slate-600 font-medium hover:text-blue-900 transition-colors text-base">
                    Kontakt
                </a>

                {isAuthenticated ? (
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 font-semibold px-4 py-2.5 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors shadow-sm text-base"
                    >
                        <IconSignOut />
                        Odjava
                    </button>
                ) : (
                    <a
                        href="/prijava"
                        className="flex items-center gap-2 bg-blue-900 text-white font-semibold px-4 py-2.5 rounded-md hover:bg-blue-800 transition-colors shadow-sm text-base"
                    >
                        Prijava
                        <IconSignIn />
                    </a>
                )}
            </div>
        </div>
    );
}