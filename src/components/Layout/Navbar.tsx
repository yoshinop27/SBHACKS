import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function onLogout() {
    await signOut()
    navigate('/login', { replace: true })
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
      <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/" style={{ fontWeight: 800 }}>
          SBHACKS
        </Link>
        <div style={{ flex: 1 }} />
        {user?.email ? <span style={{ opacity: 0.8, fontSize: 14 }}>{user.email}</span> : null}
        <button onClick={() => void onLogout()}>Log out</button>
      </div>
    </header>
  )
}


