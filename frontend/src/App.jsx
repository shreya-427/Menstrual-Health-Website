import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/layout/NavBar.jsx'
import PageWrapper from './components/layout/PageWrapper.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import LogPage from './pages/LogPage.jsx'
import InsightsPage from './pages/InsightsPage.jsx'
import EducationPage from './pages/EducationPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import { useTheme } from './hooks/useTheme.js'

export default function App() {
  const [theme, toggleTheme] = useTheme()

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-brand-light dark:bg-brand-dark transition-colors duration-200">
        <NavBar theme={theme} onToggleTheme={toggleTheme} />
        <main className="flex-1">
          <PageWrapper>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/log" element={<LogPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/education" element={<EducationPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </PageWrapper>
        </main>
      </div>
    </BrowserRouter>
  )
}
