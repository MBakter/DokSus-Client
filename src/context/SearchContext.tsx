import { createContext } from 'preact';
import { useState, type ReactNode } from 'preact/compat';

interface SearchContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export const SearchContext = createContext<SearchContextType>({
    searchQuery: '',
    setSearchQuery: () => {}
});

export function SearchProvider({ children }: { children: ReactNode }) {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
            {children}
        </SearchContext.Provider>
    );
}