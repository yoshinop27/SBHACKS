import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function onLogout() {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <header
      style={{
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        padding: '12px 16px',
        position: 'sticky',
        top: 0,
        background: 'Canvas',
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link to="/" style={{ fontWeight: 800 }}>
          LanGain
        </Link>
        <nav style={{ display: 'flex', gap: 16, marginLeft: 24 }}>
          <Link to="/dashboard" style={{ opacity: 0.8, fontSize: 14 }}>Dashboard</Link>
          <Link to="/learning-goals" style={{ opacity: 0.8, fontSize: 14 }}>Learning Goals</Link>
        </nav>
        <div style={{ flex: 1 }} />
        {user?.email ? <span style={{ opacity: 0.8, fontSize: 14 }}>{user.email}</span> : null}
        <button onClick={() => void onLogout()}>Log out</button>
      </div>
    </header>
  )
}


