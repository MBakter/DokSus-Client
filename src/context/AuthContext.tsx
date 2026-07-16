import { createContext } from 'preact';
import { useState, type ReactNode } from 'preact/compat';
import {useEffect} from "preact/hooks";

export interface User {
    id: string;
    name: string;
    surname: string;
    email: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    login: () => {},
    logout: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    // Check for existing session on application load
    useEffect(() => {
        const storedUser = localStorage.getItem('user_data');
        const token = localStorage.getItem('jwt_token');

        if (storedUser && token) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error("Corrupted local storage data. Clearing session.");
                localStorage.removeItem('user_data');
                localStorage.removeItem('jwt_token');
            }
        }
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
        setUser(null);
        window.location.href = '/prijava'; // Redirect to login page
    };

    return (
        <AuthContext.Provider value={{isAuthenticated: !!user, user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}