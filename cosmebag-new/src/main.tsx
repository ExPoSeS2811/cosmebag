import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppWithPhone from './AppWithPhone'

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    <StrictMode>
      <AppWithPhone />
    </StrictMode>,
  )
} else {
  console.error('Root element not found!')
}
