import { useContext } from 'preact/hooks';
import { AuthContext } from '../../context/AuthContext';

export function TopBar() {
    const { isAuthenticated, logout, login } = useContext(AuthContext);

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
                <div className="relative ml-4">
                    <input
                        type="text"
                        className="border border-gray-600 rounded px-3 py-1 text-sm w-64 focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-2 top-1 text-gray-500 cursor-pointer">⌕</span>
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
                    <button
                        onClick={() => login({ id: '1', initials: 'AV', fullName: 'Ana Vidović', role: 'Restorer' })}
                        className="text-gray-800 font-medium hover:text-black"
                    >
                        Prijava (Test Login)
                    </button>
                )}
            </div>
        </div>
    );
}