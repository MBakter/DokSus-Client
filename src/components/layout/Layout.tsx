import type {ReactNode} from 'preact/compat';
import {Header} from './Header';

/** Common frame of every page: the header on top and the current page below it. */
export function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />
            <main className="flex-1 w-full max-w-7xl mx-auto p-6">
                {children}
            </main>
        </div>
    );
}