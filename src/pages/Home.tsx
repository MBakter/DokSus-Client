import { useContext } from 'preact/hooks';
import { AuthContext } from '../context/AuthContext';

export function Home() {
    const { isAuthenticated, user } = useContext(AuthContext);

    return (
        <div className="bg-white p-8 border border-gray-200 rounded shadow-sm">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">
                Početna stranica
            </h1>

            {isAuthenticated ? (
                <p className="text-gray-600">
                    Dobrodošli, <strong>{user?.fullName}</strong>. Odaberite opciju iz izbornika kako biste započeli s radom.
                </p>
            ) : (
                <p className="text-gray-600">
                    Ovo je sustav za izradu i pohranu konzervatorsko-restauratorske dokumentacije. Molimo prijavite se za pristup vašim dokumentima.
                </p>
            )}
        </div>
    );
}