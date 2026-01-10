import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <p>Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}


