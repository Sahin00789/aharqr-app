import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId='269948352456-hol3sa4doss25pnqfcr9gdms1daovcu8.apps.googleusercontent.com'>
    <App />
  </GoogleOAuthProvider>,
)
