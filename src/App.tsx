import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import Router, {Route} from "preact-router";
import {Login} from "./pages/Login.tsx";
import {Register} from "./pages/Register.tsx";
import {Account} from "./pages/Account.tsx";


export function App() {
    return (
        <AuthProvider>
            <SearchProvider>
                <Layout>
                    <Router>
                        <Route path="/" component={Home} />
                        <Route path="/prijava" component={Login} />
                        <Route path="/registracija" component={Register} />
                        <Route path="/racun" component={Account} />
                    </Router>
                </Layout>
            </SearchProvider>
        </AuthProvider>
    );
}