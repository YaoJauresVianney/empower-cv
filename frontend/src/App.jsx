import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import AuthLayout from './layouts/AuthLayout'
import DashboardPage from './pages/DashboardPage'
import CandidatesPage from './pages/CandidatesPage'
import CandidateProfilePage from './pages/CandidateProfilePage'
import JobOffersPage from './pages/JobOffersPage'
import JobOfferDetailPage from './pages/JobOfferDetailPage'
import ShortlistDetailPage from './pages/ShortlistDetailPage'
import Login from './pages/Login'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/candidates"     element={<CandidatesPage />} />
          <Route path="/candidates/:id" element={<CandidateProfilePage />} />
          <Route path="/jobs"       element={<JobOffersPage />} />
          <Route path="/jobs/:id"                        element={<JobOfferDetailPage />} />
          <Route path="/jobs/:jobId/shortlists/:slId"  element={<ShortlistDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
