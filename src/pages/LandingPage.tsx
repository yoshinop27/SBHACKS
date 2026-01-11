import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const videoRef = useRef<SVGSVGElement>(null)
  const chatRef = useRef<SVGSVGElement>(null)
  const roadmapRef = useRef<SVGSVGElement>(null)

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Video Animation
      if (videoRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: videoRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        })

        tl.from(".video-frame", { scale: 0.8, opacity: 0, duration: 0.8, ease: "back.out(1.7)" })
          .from(".play-btn", { scale: 0, opacity: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" }, "-=0.4")
          .from(".transcription-line", { width: 0, opacity: 0, stagger: 0.2, duration: 0.6, ease: "power2.out" }, "-=0.2")
      }

      // Chat Animation
      if (chatRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: chatRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        })

        tl.from(".chat-bubble", { y: 20, opacity: 0, scale: 0.8, stagger: 0.3, duration: 0.6, ease: "back.out(1.5)" })
          .to(".typing-dot", { y: -5, stagger: 0.1, repeat: -1, yoyo: true, duration: 0.4 })
      }

      // Roadmap Animation
      if (roadmapRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: roadmapRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        })

        tl.from(".path-line", { strokeDashoffset: 1000, duration: 1.5, ease: "power2.inOut" })
          .from(".roadmap-node", { scale: 0, opacity: 0, stagger: 0.3, duration: 0.5, ease: "back.out(2)" }, "-=1")
          .from(".node-check", { opacity: 0, scale: 0, stagger: 0.3, duration: 0.3 }, "-=0.8")
      }
    })

    return () => ctx.revert()
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '2px solid #e5e5e5'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '2rem',
          fontWeight: 800,
          color: '#646cff',
          letterSpacing: '-1px'
        }}>
          LanGain
        </h2>

        <div style={{ display: 'flex', gap: '32px' }}>
          <Link
            to="/team"
            style={{
              textDecoration: 'none',
              color: '#3c3c3c',
              fontWeight: 700,
              fontSize: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#646cff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#3c3c3c'
            }}
          >
            Team
          </Link>
          <Link
            to="/about"
            style={{
              textDecoration: 'none',
              color: '#3c3c3c',
              fontWeight: 700,
              fontSize: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#646cff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#3c3c3c'
            }}
          >
            About
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        padding: '60px 40px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f7f7f7 100%)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          maxWidth: '1200px',
          width: '100%',
          alignItems: 'center'
        }}
          className="hero-grid">
          {/* Left side - Illustration */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg
              style={{ width: '100%', maxWidth: '450px', animation: 'float 3s ease-in-out infinite' }}
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Video Player */}
              <rect x="50" y="80" width="300" height="180" rx="12" fill="#646cff" />
              <rect x="60" y="90" width="280" height="140" rx="8" fill="#535bf2" />

              {/* Play Button */}
              <circle cx="200" cy="160" r="30" fill="white" opacity="0.9" />
              <path d="M190 145 L220 160 L190 175 Z" fill="#535bf2" />

              {/* Subtitles */}
              <rect x="80" y="200" width="240" height="20" rx="4" fill="white" opacity="0.8" />

              {/* Characters */}
              <circle cx="120" cy="320" r="35" fill="#ff9600" />
              <circle cx="120" cy="310" r="20" fill="#ffc800" />

              <circle cx="200" cy="330" r="40" fill="#646cff" />
              <circle cx="200" cy="318" r="22" fill="#535bf2" />
              <circle cx="195" cy="315" r="5" fill="#3c3c3c" />
              <circle cx="205" cy="315" r="5" fill="#3c3c3c" />

              <circle cx="280" cy="320" r="35" fill="#ce82ff" />
              <circle cx="280" cy="310" r="20" fill="#e5b8ff" />
            </svg>
          </div>

          {/* Right side - Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }} className="hero-content">
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#3c3c3c',
              lineHeight: 1.2,
              margin: 0,
              textAlign: 'center'
            }}>
              The free, fun, and effective way to learn a language!
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '400px' }}>
              <Link to="/signup" style={{ textDecoration: 'none', width: '100%' }}>
                <button style={{
                  padding: '16px 32px',
                  fontSize: '17px',
                  width: '100%',
                  borderRadius: '16px',
                  border: 'none',
                  background: '#646cff',
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 0 #535bf2',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 0 #535bf2'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 0 #535bf2'
                  }}>
                  GET STARTED
                </button>
              </Link>

              <Link to="/login" style={{ textDecoration: 'none', width: '100%' }}>
                <button style={{
                  padding: '16px 32px',
                  fontSize: '17px',
                  width: '100%',
                  borderRadius: '16px',
                  background: 'white',
                  color: '#646cff',
                  border: '2px solid #e5e5e5',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#646cff'
                    e.currentTarget.style.background = '#f7f7f7'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e5e5'
                    e.currentTarget.style.background = 'white'
                  }}>
                  I ALREADY HAVE AN ACCOUNT
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Language Strip */}
      <section style={{
        padding: '40px',
        background: 'white',
        borderTop: '2px solid #e5e5e5',
        overflowX: 'auto'
      }}>
        <div style={{
          display: 'flex',
          gap: '32px',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {[
            { code: 'us', name: 'ENGLISH' },
            { code: 'es', name: 'SPANISH' },
            { code: 'fr', name: 'FRENCH' },
            { code: 'de', name: 'GERMAN' },
            { code: 'it', name: 'ITALIAN' },
            { code: 'br', name: 'PORTUGUESE' },
            { code: 'jp', name: 'JAPANESE' },
            { code: 'kr', name: 'KOREAN' }
          ].map((lang) => (
            <div key={lang.name} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: 700,
              color: '#777'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f7f7f7'
                e.currentTarget.style.color = '#3c3c3c'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#777'
              }}>
              <img
                src={`https://flagcdn.com/${lang.code}.svg`}
                alt={`${lang.name} flag`}
                style={{
                  width: '28px',
                  height: '21px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <span>{lang.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 40px', background: 'white' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '48px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Feature 1 */}
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ height: '200px', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg ref={videoRef} viewBox="0 0 200 150" style={{ width: '100%', height: '100%' }}>
                <rect className="video-frame" x="20" y="20" width="160" height="100" rx="8" fill="#646cff" />
                <rect className="video-frame" x="30" y="30" width="140" height="80" rx="4" fill="#535bf2" />
                <circle className="play-btn" cx="100" cy="70" r="15" fill="white" />
                <path className="play-btn" d="M96 64 L106 70 L96 76 Z" fill="#646cff" />
                <rect className="transcription-line" x="40" y="130" width="120" height="4" rx="2" fill="#e5e5e5" />
                <rect className="transcription-line" x="40" y="140" width="80" height="4" rx="2" fill="#e5e5e5" />
              </svg>
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '12px',
              color: '#3c3c3c',
              fontWeight: 800
            }}>
              Video-Powered Learning
            </h3>
            <p style={{ color: '#777', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Upload any video and get AI-powered transcriptions. Learn from real content you love.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ height: '200px', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg ref={chatRef} viewBox="0 0 200 150" style={{ width: '100%', height: '100%' }}>
                <path className="chat-bubble" d="M30 40 Q30 30 40 30 L110 30 Q120 30 120 40 L120 70 Q120 80 110 80 L40 80 Q30 80 30 70 L30 85 L50 70 Z" fill="#e5e5e5" />
                <path className="chat-bubble" d="M170 80 Q170 70 160 70 L90 70 Q80 70 80 80 L80 110 Q80 120 90 120 L160 120 Q170 120 170 110 L170 125 L150 110 Z" fill="#646cff" />

                {/* Typing dots */}
                <circle className="typing-dot" cx="55" cy="55" r="3" fill="#999" />
                <circle className="typing-dot" cx="75" cy="55" r="3" fill="#999" />
                <circle className="typing-dot" cx="95" cy="55" r="3" fill="#999" />
              </svg>
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '12px',
              color: '#3c3c3c',
              fontWeight: 800
            }}>
              AI Chat Practice
            </h3>
            <p style={{ color: '#777', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Practice conversations with our AI chatbot and get instant feedback on your progress.
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ height: '200px', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg ref={roadmapRef} viewBox="0 0 200 150" style={{ width: '100%', height: '100%' }}>
                <path className="path-line" d="M30 120 C60 120 60 80 100 80 C140 80 140 30 170 30" fill="none" stroke="#e5e5e5" strokeWidth="4" strokeDasharray="1000" strokeLinecap="round" />
                <path className="path-line" d="M30 120 C60 120 60 80 100 80 C140 80 140 30 170 30" fill="none" stroke="#646cff" strokeWidth="4" strokeDasharray="1000" strokeLinecap="round" opacity="0.5" />

                <circle className="roadmap-node" cx="30" cy="120" r="10" fill="#646cff" />
                <path className="node-check" d="M26 120 L29 123 L34 118" stroke="white" strokeWidth="2" fill="none" />

                <circle className="roadmap-node" cx="100" cy="80" r="10" fill="#ce82ff" />
                <path className="node-check" d="M96 80 L99 83 L104 78" stroke="white" strokeWidth="2" fill="none" />

                <circle className="roadmap-node" cx="170" cy="30" r="10" fill="#ff9600" />
                <path className="node-check" d="M166 30 L169 33 L174 28" stroke="white" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '12px',
              color: '#3c3c3c',
              fontWeight: 800
            }}>
              Personalized Roadmaps
            </h3>
            <p style={{ color: '#777', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Get custom learning paths designed specifically for your goals and skill level.
            </p>
          </div>
        </div>
      </section>

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

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }

          @media (max-width: 1024px) {
            .hero-grid {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
            }
            
            .hero-content {
              align-items: center;
              text-align: center;
            }
          }

          @media (max-width: 768px) {
            .hero-grid {
              padding: 40px 20px;
            }
          }
        `}
      </style>
    </div>
  )
}