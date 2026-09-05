import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/styles/core.css'

import { App } from './App'
import './site.css'

const root = document.getElementById('root')
if (root === null) throw new Error('Website root is missing')
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
