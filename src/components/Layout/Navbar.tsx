import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function onLogout() {
    await signOut()
    navigate('/', { replace: true })
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <header
      style={{
        borderBottom: '2px solid #e5e5e5',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        background: 'white',
        zIndex: 100,
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link 
          to="/dashboard" 
          style={{ 
            fontWeight: 800, 
            fontSize: '1.5rem',
            color: '#58cc02',
            letterSpacing: '-0.5px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '1.75rem' }}>🌱</span>
          LanGain
        </Link>
        
        <nav style={{ display: 'flex', gap: 4, marginLeft: 32 }}>
          <Link 
            to="/dashboard" 
            style={{ 
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              color: isActive('/dashboard') ? '#1cb0f6' : '#777',
              background: isActive('/dashboard') ? 'rgba(28, 176, 246, 0.1)' : 'transparent',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            📺 Learn
          </Link>
          <Link 
            to="/learning-goals" 
            style={{ 
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              color: isActive('/learning-goals') ? '#58cc02' : '#777',
              background: isActive('/learning-goals') ? 'rgba(88, 204, 2, 0.1)' : 'transparent',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            🎯 Goals
          </Link>
        </nav>
        
        <div style={{ flex: 1 }} />
        
        {user?.email && (
          <span style={{ 
            padding: '8px 16px',
            background: '#f7f7f7',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#777',
          }}>
            {user.email}
          </span>
        )}
        
        <button 
          onClick={() => void onLogout()}
          style={{
            padding: '10px 20px',
            background: 'white',
            border: '2px solid #e5e5e5',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.85rem',
            color: '#777',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textTransform: 'uppercase',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#ff4b4b'
            e.currentTarget.style.color = '#ff4b4b'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e5e5e5'
            e.currentTarget.style.color = '#777'
          }}
        >
          Log out
        </button>
      </div>
    </header>
  )
}
