import { TopBar } from './TopBar';
import { AccountBanner } from './AccountBanner';

export function Header() {
    return (
        <header className="w-full flex flex-col">
            <TopBar />
            <AccountBanner />
        </header>
    );
}