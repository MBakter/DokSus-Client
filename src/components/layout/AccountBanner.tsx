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
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-400 bg-white">
            <nav className="flex items-center gap-12">
                <a href="/novo" className="text-gray-800 hover:text-black">Novo</a>
                <a href="/moji-dokumenti" className="text-gray-800 hover:text-black">Moji dokumenti</a>
            </nav>
            <div className="flex items-center gap-8">
                <a href="/katalog" className="text-gray-800 hover:text-black">Katalog oštećenja</a>

                {/* Avatar */}
                <a
                    href="/racun"
                    className="w-10 h-10 flex items-center justify-center bg-blue-700 text-white rounded-full font-semibold border-2 border-gray-400 hover:bg-blue-800 transition-colors cursor-pointer"
                    title={`Profil: ${fullName}`}
                >
                    {initials}
                </a>
            </div>
        </div>
    );
}