import {createContext} from 'preact';
import {type ReactNode, useState} from 'preact/compat';

interface SearchContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

/**
 * Shared search text state. Currently not mounted in the app: search is passed through the URL
 * (`/?search=...`) instead.
 */
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