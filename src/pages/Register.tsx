import { useState } from 'preact/hooks';
import { registerUser } from '../api/AuthApi';

export function Register() {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await registerUser({ name, surname, email, password });
            window.location.href = '/prijava'; // Redirect to Login upon success
        } catch (err) {
            setError('Pogreška prilikom registracije. Pokušajte ponovno.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-10">
            <div className="w-full max-w-md bg-white p-8 border border-blue-900 shadow-sm">
                <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Registracija</h2>

                {error && <div className="bg-red-100 text-red-700 p-3 mb-4 text-sm border border-red-200">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ime</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onInput={(e) => setName((e.target as HTMLInputElement).value)}
                            className="w-full border border-gray-400 p-2 focus:outline-none focus:border-blue-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prezime</label>
                        <input
                            type="text"
                            required
                            value={surname}
                            onInput={(e) => setSurname((e.target as HTMLInputElement).value)}
                            className="w-full border border-gray-400 p-2 focus:outline-none focus:border-blue-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                            className="w-full border border-gray-400 p-2 focus:outline-none focus:border-blue-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lozinka</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                            className="w-full border border-gray-400 p-2 focus:outline-none focus:border-blue-900"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-900 text-white font-medium py-2 mt-4 hover:bg-blue-800 disabled:opacity-50"
                    >
                        {isLoading ? 'Registracija...' : 'Registriraj se'}
                    </button>
                </form>
            </div>
        </div>
    );
}