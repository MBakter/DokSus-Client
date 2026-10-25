import {createContext} from 'preact';
import {type ReactNode, useState} from 'preact/compat';
import {useEffect} from "preact/hooks";
import {clearSessionCookie, setSessionCookie} from "../util/Utilities.ts";

export interface User {
    id: string;
    name: string;
    surname: string;
    email: string;
    isProfessor: boolean;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
}

/**
 * Global login state available to every component via `useContext(AuthContext)`.
 * Tells whether someone is logged in, who it is, and provides `login`/`logout`.
 */
export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    login: () => {},
    logout: () => {}
});

/**
 * Wraps the whole app and supplies `AuthContext`. The session (JWT token and user data) is kept
 * in the browser's localStorage and in a cookie, so it survives page reloads and is sent
 * with file downloads.
 */
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
                setSessionCookie(token);
            } catch (error) {
                console.error("Corrupted local storage data. Clearing session.");
                localStorage.removeItem('user_data');
                localStorage.removeItem('jwt_token');
                clearSessionCookie();
            }
        }
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setSessionCookie(token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
        clearSessionCookie();
        setUser(null);
        window.location.href = '/prijava'; // Redirect to login page
    };

    return (
        <AuthContext.Provider value={{isAuthenticated: !!user, user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}