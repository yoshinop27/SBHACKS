import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function SignUpPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await signUp(email.trim(), password)
      // Depending on Supabase settings, email confirmation may be required.
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #ffffff 0%, #f7f7f7 100%)'
    }}>
      {/* Header */}
      <header style={{ 
        padding: '20px 40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'white',
        borderBottom: '2px solid #e5e5e5'
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '2rem', 
            fontWeight: 800, 
            color: '#646cff',
            letterSpacing: '-1px'
          }}>
            LanGain
          </h2>
        </Link>
      </header>

      {/* Main Content */}
      <main style={{ 
        flex: 1,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px 40px',
          borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          maxWidth: '440px',
          width: '100%',
          border: '2px solid #e5e5e5'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '6px',
            color: '#3c3c3c',
            letterSpacing: '-1px',
            textAlign: 'center'
          }}>Start learning today</h1>
          <p style={{
            color: '#777',
            marginBottom: '30px',
            fontSize: '1rem',
            textAlign: 'center'
          }}>Create your free account to get started</p>

          <form onSubmit={onSubmit} style={{ display: 'grid', gap: '18px' }}>
            <label style={{ display: 'grid', gap: '10px' }}>
              <span style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#3c3c3c'
              }}>Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: '16px 18px',
                  borderRadius: '12px',
                  border: '2px solid #e5e5e5',
                  fontSize: '1rem',
                  background: 'white',
                  color: '#3c3c3c',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#646cff'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e5e5'}
              />
            </label>

            <label style={{ display: 'grid', gap: '10px' }}>
              <span style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#3c3c3c'
              }}>Password</span>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  padding: '16px 18px',
                  borderRadius: '12px',
                  border: '2px solid #e5e5e5',
                  fontSize: '1rem',
                  background: 'white',
                  color: '#3c3c3c',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#646cff'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e5e5'}
              />
            </label>

            <label style={{ display: 'grid', gap: '10px' }}>
              <span style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#3c3c3c'
              }}>Confirm password</span>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                style={{
                  padding: '16px 18px',
                  borderRadius: '12px',
                  border: '2px solid #e5e5e5',
                  fontSize: '1rem',
                  background: 'white',
                  color: '#3c3c3c',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#646cff'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e5e5'}
              />
            </label>

            {error ? (
              <div style={{
                color: '#d32f2f',
                fontSize: '0.95rem',
                background: '#ffebee',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '2px solid #ffcdd2',
                fontWeight: 600
              }}>
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '16px 28px',
                fontSize: '1rem',
                width: '100%',
                borderRadius: '16px',
                border: 'none',
                background: '#646cff',
                color: 'white',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 0 #535bf2',
                transition: 'all 0.2s',
                marginTop: '4px',
                opacity: submitting ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 0 #535bf2'
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 0 #535bf2'
                }
              }}
            >
              {submitting ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '2px solid #f7f7f7',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '1rem',
              color: '#777',
              marginBottom: '12px'
            }}>
              Already have an account? <Link to="/login" style={{ color: '#646cff', fontWeight: 700, textDecoration: 'none' }}>Log in</Link>
            </p>

            <p style={{
              fontSize: '0.95rem',
              margin: 0
            }}>
              <Link to="/" style={{ color: '#999', textDecoration: 'none', fontWeight: 600 }}>← Back to home</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#f7f7f7',
        color: '#999',
        fontSize: '14px'
      }}>
        <p style={{ margin: 0 }}>© 2026 LanGain. All rights reserved.</p>
      </footer>
    </div>
  )
}