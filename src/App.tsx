import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';

export function App() {
  return (
      <AuthProvider>
        <Layout>
          <Home />
        </Layout>
      </AuthProvider>
  );
}