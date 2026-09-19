import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RecruiterDashboard from './pages/RecruiterDashboard'
import CandidateDashboard from './pages/CandidateDashboard'
import JobsPage from './pages/JobsPage'
import CandidatesPage from './pages/CandidatesPage'
import ReportPage from './pages/ReportPage'
import PipelinePage from './pages/PipelinePage'
import CandidateFeedbackPage from './pages/CandidateFeedbackPage'

import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                   element={<LandingPage />} />
        <Route path="/login"              element={<LoginPage />} />
        
        {/* Recruiter & Admin Protected Routes */}
        <Route path="/recruiter"          element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>} />
        <Route path="/recruiter/jobs"     element={<ProtectedRoute allowedRoles={['recruiter']}><JobsPage /></ProtectedRoute>} />
        <Route path="/recruiter/candidates" element={<ProtectedRoute allowedRoles={['recruiter']}><CandidatesPage /></ProtectedRoute>} />
        <Route path="/recruiter/report"   element={<ProtectedRoute allowedRoles={['recruiter']}><ReportPage /></ProtectedRoute>} />
        <Route path="/recruiter/pipeline" element={<ProtectedRoute allowedRoles={['recruiter']}><PipelinePage /></ProtectedRoute>} />
        
        {/* Candidate Protected Routes */}
        <Route path="/candidate"              element={<ProtectedRoute allowedRoles={['candidate']}><CandidateDashboard initialTab="dashboard" /></ProtectedRoute>} />
        <Route path="/candidate/profile"      element={<ProtectedRoute allowedRoles={['candidate']}><CandidateDashboard initialTab="resume" /></ProtectedRoute>} />
        <Route path="/candidate/applications" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateDashboard initialTab="dashboard" /></ProtectedRoute>} />
        <Route path="/candidate/interview"    element={<ProtectedRoute allowedRoles={['candidate']}><CandidateDashboard initialTab="upload" /></ProtectedRoute>} />
        <Route path="/candidate/feedback"     element={<ProtectedRoute allowedRoles={['candidate']}><CandidateDashboard initialTab="feedback" /></ProtectedRoute>} />
        <Route path="/candidate/progress"     element={<ProtectedRoute allowedRoles={['candidate']}><CandidateDashboard initialTab="progress" /></ProtectedRoute>} />
        <Route path="/candidate/feedback-dossier" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateFeedbackPage initialTab="pillars" /></ProtectedRoute>} />
        <Route path="/candidate/settings"     element={<ProtectedRoute allowedRoles={['candidate']}><CandidateDashboard initialTab="resume" /></ProtectedRoute>} />
        
        <Route path="*"                   element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
