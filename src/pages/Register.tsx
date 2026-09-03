import { useState } from 'preact/hooks';
import { registerUser } from '../api/AuthApi';
import {ErrorCode} from "../api/types/ErrorCode.ts";

export function useRegister() {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Strongly typed error state
    const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorCode(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            await registerUser({ name, surname, email, password });
            setSuccessMessage('Uspješna registracija! Preusmjeravanje...');
            setTimeout(() => {
                window.location.href = '/prijava';
            }, 1500);
        } catch (err: any) {
            const backendCode = err.response?.data?.errorCode;

            setErrorCode(ErrorCode[backendCode as keyof typeof ErrorCode] || ErrorCode.UNKNOWN_ERROR);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        name, setName,
        surname, setSurname,
        email, setEmail,
        password, setPassword,
        errorCode, successMessage, isLoading, handleSubmit
    };
}

export function Register() {
    const {
        name, setName,
        surname, setSurname,
        email, setEmail,
        password, setPassword,
        errorCode, successMessage, isLoading, handleSubmit
    } = useRegister();

    return (
        <div className="flex justify-center items-center py-16 bg-slate-50 min-h-[calc(100vh-140px)]">
            <div className="w-full max-w-md bg-white p-10 rounded-lg border border-slate-200 shadow-sm">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Novi račun</h2>
                    <p className="text-sm text-slate-500 mt-2">Registracija za studente i djelatnike</p>
                </div>

                {errorCode === ErrorCode.NOT_WHITELISTED && (
                    <div className="bg-red-50 text-red-700 p-3.5 rounded-md mb-6 text-sm border border-red-200 font-medium leading-relaxed">
                        Vaša email adresa nije pronađena na popisu ovlaštenih korisnika. Za odobrenje pristupa, molimo kontaktirajte instituciju. Detalje možete pronaći na <a href="/kontakt" className="underline font-bold hover:text-red-900">kontakt stranici</a>.
                    </div>
                )}

                {errorCode === ErrorCode.ALREADY_REGISTERED && (
                    <div className="bg-red-50 text-red-700 p-3.5 rounded-md mb-6 text-sm border border-red-200 font-medium leading-relaxed">
                        Ova email adresa je već registrirana. Pokušajte se prijaviti.
                    </div>
                )}

                {(errorCode === ErrorCode.INTERNAL_ERROR || errorCode === ErrorCode.UNKNOWN_ERROR) && (
                    <div className="bg-red-50 text-red-700 p-3.5 rounded-md mb-6 text-sm border border-red-200 font-medium leading-relaxed">
                        Dogodila se neočekivana pogreška na poslužitelju. Pokušajte ponovno kasnije.
                    </div>
                )}

                {successMessage && (
                    <div className="bg-emerald-50 text-emerald-800 p-3 rounded-md mb-6 text-sm border border-emerald-200 font-medium">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ime</label>
                            <input type="text" required value={name} onChange={(e) => setName((e.target as HTMLInputElement).value)} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prezime</label>
                            <input type="text" required value={surname} onChange={(e) => setSurname((e.target as HTMLInputElement).value)} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                        <input type="email" required value={email} onChange={(e) => setEmail((e.target as HTMLInputElement).value)} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Lozinka</label>
                        <input type="password" required value={password} onChange={(e) => setPassword((e.target as HTMLInputElement).value)} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-900 text-white font-semibold tracking-wide py-2.5 rounded-md mt-2 hover:bg-blue-800 active:bg-blue-950 transition-colors disabled:opacity-70 shadow-sm cursor-pointer"
                    >
                        {isLoading ? 'Registracija...' : 'Otvori račun'}
                    </button>
                </form>
            </div>
        </div>
    );
}