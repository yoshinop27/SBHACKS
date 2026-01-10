import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import '@reach/dialog/styles.css'
import '@reach/tabs/styles.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.tsx'

ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root'),
)
