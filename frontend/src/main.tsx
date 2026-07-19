import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './Layout'
import { App } from './App'
import { Integrations } from './pages/Integrations'
import { Console } from './pages/Console'
import { AgentDetails } from './pages/AgentDetails'
import './styles/globals.css'

if (localStorage.getItem('theme') === 'light') {
  document.documentElement.classList.add('light')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<App />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/console" element={<Console />} />
          <Route path="/agents/:agentId" element={<AgentDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
