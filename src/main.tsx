import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initAnalytics } from '@/utils/analytics'

initAnalytics(import.meta.env.VITE_GA_MEASUREMENT_ID)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
