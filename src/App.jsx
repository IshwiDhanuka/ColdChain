import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ScanPage from './pages/ScanPage'
import BreachPage from './pages/BreachPage'
import ConfirmationPage from './pages/ConfirmationPage'
import AdminPage from './pages/AdminPage'
import GeneratePage from './pages/GeneratePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/breach" element={<BreachPage />} />
      <Route path="/confirmation" element={<ConfirmationPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/generate" element={<GeneratePage />} />
    </Routes>
  )
}
