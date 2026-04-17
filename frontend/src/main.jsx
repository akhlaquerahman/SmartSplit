import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
  document.body.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
  document.body.classList.remove('dark');
}

if (!clientId) {
  throw new Error('Missing VITE_GOOGLE_CLIENT_ID. Set this in your Netlify/Vercel environment variables.');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
