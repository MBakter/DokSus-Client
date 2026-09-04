import {useContext, useState} from 'preact/hooks';
import {AuthContext} from '../context/AuthContext';
import {loginUser} from '../api/AuthApi';
import type {FormEvent} from "preact/compat";

export function useLogin() {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault(); // Now correctly prevents the page refresh
        setError(null);
        setIsLoading(true);

        try {
            const response = await loginUser({ email, password });
            login(response.token, response.user);
            window.location.href = '/';
        } catch (err: any) {
            const message = err.response?.data?.error || 'Neuspješna prijava. Provjerite podatke.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        email, setEmail,
        password, setPassword,
        error, isLoading, handleSubmit
    };
}

export function Login() {
    const { email, setEmail, password, setPassword, error, isLoading, handleSubmit } = useLogin();

    return (
        <div className="flex justify-center items-center py-24 bg-slate-50 min-h-[calc(100vh-140px)]">
            <div className="w-full max-w-md bg-white p-10 rounded-lg border border-slate-200 shadow-sm">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Prijava u sustav</h2>
                    <p className="text-sm text-slate-500 mt-2">
                        Unesite svoje podatke za pristup
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md mb-6 text-sm border border-red-200 font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email adresa</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Lozinka</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-900 text-white font-semibold tracking-wide py-2.5 rounded-md mt-2 hover:bg-blue-800 active:bg-blue-950 transition-colors disabled:opacity-70 shadow-sm cursor-pointer"
                    >
                        {isLoading ? 'Provjera podataka...' : 'Prijavi se'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
                    Nemate otvoren račun? <a href="/registracija" className="text-blue-900 font-semibold hover:underline">Registrirajte se</a>
                </div>
            </div>
        </div>
    );
}