import { useContext } from 'preact/hooks';
import { AuthContext } from '../../context/AuthContext';

export function AccountBanner() {
    const { user, isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated || !user) {
        return null; // Component does not render if not logged in
    }

    // Safely calculate initials and full name from the backend user model
    const initials = `${user.name?.charAt(0) || ''}${user.surname?.charAt(0) || ''}`.toUpperCase();
    const fullName = `${user.name} ${user.surname}`;

    return (
        <div className="flex items-center justify-between px-8 py-2.5 bg-slate-50 border-b border-slate-200">
            <nav className="flex items-center gap-8">
                <a href="/novo" className="text-slate-600 font-medium text-sm hover:text-blue-900 transition-colors flex items-center gap-1.5">
                    <span className="text-lg leading-none">+</span> Novi dokument
                </a>
                <a href="/racun" className="text-slate-600 font-medium text-sm hover:text-blue-900 transition-colors">
                    Moji projekti
                </a>
            </nav>

            <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500 font-medium">Prijavljeni ste kao {fullName}</span>
                <a
                    href="/racun"
                    className="w-8 h-8 flex items-center justify-center bg-blue-900 text-white rounded-full text-xs font-bold ring-2 ring-white shadow-sm hover:bg-blue-800 hover:scale-105 transition-all cursor-pointer"
                    title="Otvori moj račun"
                >
                    {initials}
                </a>
            </div>
        </div>
    );
}