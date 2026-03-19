import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a3820', color: '#fff', border: '1px solid #265529' },
          success: { iconTheme: { primary: '#F59E0B', secondary: '#0d1f12' } },
        }}
      />
    </>
  );
}
