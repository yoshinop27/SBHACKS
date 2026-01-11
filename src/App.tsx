import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/Auth/RequireAuth'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import SignUpPage from './pages/SignUpPage'
import VideoUploadPage from './pages/VideoUploadPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      <Route
        path="/"
        element={<HomePage />}
      />
      <Route
        path="/project/:id"
        element={
          <RequireAuth>
            <ProjectDetailPage />
          </RequireAuth>
        }
      />
      <Route
        path="/upload-video"
        element={
          <RequireAuth>
            <VideoUploadPage />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
