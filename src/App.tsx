import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import Router, {Route} from "preact-router";
import {Login} from "./pages/Login.tsx";
import {Register} from "./pages/Register.tsx";
import {Account} from "./pages/Account.tsx";
import {PublicProfile} from "./pages/PublicProfile.tsx";
import {DocumentEditor} from "./pages/document_editor/DocumentEditor.tsx";


export function App() {
    return (
        <AuthProvider>
            <Layout>
                <Router>
                    <Route path="/" component={Home} />
                    <Route path="/prijava" component={Login} />
                    <Route path="/registracija" component={Register} />
                    <Route path="/racun" component={Account} />
                    <Route path="/profil/:email" component={PublicProfile} />
                    <Route path="/novo" component={DocumentEditor} />
                    <Route path="/uredi/:id" component={DocumentEditor} />
                </Router>
            </Layout>
        </AuthProvider>
    );
}