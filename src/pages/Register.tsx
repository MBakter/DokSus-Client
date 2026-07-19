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
        <div className="flex justify-center items-center py-16 bg-slate-50 min-h-[calc(100vh-140px)]">
            <div className="w-full max-w-md bg-white p-10 rounded-lg border border-slate-200 shadow-sm">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Novi račun</h2>
                    <p className="text-sm text-slate-500 mt-2">Registracija za studente i djelatnike</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md mb-6 text-sm border border-red-200 font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ime</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onInput={(e) => setName((e.target as HTMLInputElement).value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prezime</label>
                            <input
                                type="text"
                                required
                                value={surname}
                                onInput={(e) => setSurname((e.target as HTMLInputElement).value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Lozinka</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-900 text-white font-semibold tracking-wide py-2.5 rounded-md mt-2 hover:bg-blue-800 active:bg-blue-950 transition-colors disabled:opacity-70 shadow-sm"
                    >
                        {isLoading ? 'Registracija...' : 'Otvori račun'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
                    Već imate otvoren račun? <a href="/prijava" className="text-blue-900 font-semibold hover:underline">Prijavite se</a>
                </div>
            </div>
        </div>
    );
}