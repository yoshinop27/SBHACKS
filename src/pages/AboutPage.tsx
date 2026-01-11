import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function AboutPage() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null)
  const worldRef = useRef<SVGSVGElement>(null)
  const meridiansRef = useRef<SVGGElement>(null)
  const particlesRef = useRef<SVGGElement>(null)
  const connectionsRef = useRef<SVGGElement>(null)
  const symbolsRef = useRef<SVGGElement>(null)
  const pulsePointsRef = useRef<SVGGElement>(null)
  const glowRef = useRef<SVGCircleElement>(null)
  const accordionRefs = useRef<(HTMLDivElement | null)[]>([])

  const accordionItems = [
    {
      title: 'AI-powered personalized learning paths',
      content: 'Our advanced AI analyzes your learning style, progress, and goals to create a custom curriculum just for you. Every lesson adapts to help you learn faster and retain more.'
    },
    {
      title: 'Learn from content you actually enjoy',
      content: 'Upload your favorite videos, movies, or shows and learn from real-world content. No more boring textbooks—immerse yourself in the language through media you love.'
    },
    {
      title: 'Real-time feedback and progress tracking',
      content: 'Get instant corrections and suggestions as you practice. Track your progress with detailed analytics and celebrate milestones as you master new vocabulary and grammar.'
    },
    {
      title: 'Community of global language learners',
      content: 'Connect with thousands of learners worldwide. Practice with native speakers, join study groups, and participate in language challenges to stay motivated on your journey.'
    }
  ]

  const toggleAccordion = (index: number) => {
    if (openAccordion === index) {
      const content = accordionRefs.current[index]
      if (content) {
        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power2.inOut",
          onComplete: () => setOpenAccordion(null)
        })
      }
    } else {
      if (openAccordion !== null) {
        const prevContent = accordionRefs.current[openAccordion]
        if (prevContent) {
          gsap.to(prevContent, {
            height: 0,
            opacity: 0,
            duration: 0.3,
            ease: "power2.inOut"
          })
        }
      }
      
      setOpenAccordion(index)
      const content = accordionRefs.current[index]
      if (content) {
        gsap.fromTo(content, 
          { height: 0, opacity: 0 },
          { 
            height: "auto", 
            opacity: 1,
            duration: 0.4,
            ease: "power2.out"
          }
        )
      }
    }
  }

  useEffect(() => {
    if (!worldRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(worldRef.current, {
        scale: 0,
        opacity: 0,
        duration: 1.2,
        ease: "back.out(1.7)"
      })

      const globeBase = worldRef.current?.querySelector('#globe-base')
      if (globeBase) {
        gsap.to(globeBase, {
          rotation: 360,
          transformOrigin: "center center",
          duration: 60,
          repeat: -1,
          ease: "none"
        })
      }

      if (meridiansRef.current) {
        gsap.to(meridiansRef.current, {
          rotation: -360,
          transformOrigin: "center center",
          duration: 80,
          repeat: -1,
          ease: "none"
        })
      }

      if (particlesRef.current) {
        const particles = particlesRef.current.children
        Array.from(particles).forEach((particle, i) => {
          gsap.to(particle, {
            y: `+=${Math.random() * 40 - 20}`,
            x: `+=${Math.random() * 40 - 20}`,
            duration: Math.random() * 3 + 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.1
          })
          
          gsap.to(particle, {
            opacity: Math.random() * 0.4 + 0.3,
            duration: Math.random() * 2 + 1,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          })
        })
      }

      if (symbolsRef.current) {
        const symbols = symbolsRef.current.children
        Array.from(symbols).forEach((symbol, i) => {
          gsap.to(symbol, {
            y: `+=${Math.random() * 30 - 15}`,
            duration: Math.random() * 3 + 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.2
          })
          
          gsap.to(symbol, {
            rotation: Math.random() * 20 - 10,
            duration: Math.random() * 4 + 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          })

          gsap.to(symbol, {
            scale: 1.1,
            duration: Math.random() * 2 + 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            transformOrigin: "center center"
          })
        })
      }

      if (connectionsRef.current) {
        const connections = connectionsRef.current.children
        Array.from(connections).forEach((line, i) => {
          gsap.fromTo(line, 
            { strokeDashoffset: 1000 },
            {
              strokeDashoffset: 0,
              duration: 3,
              repeat: -1,
              ease: "none",
              delay: i * 0.5
            }
          )
        })
      }

      if (pulsePointsRef.current) {
        const points = pulsePointsRef.current.children
        Array.from(points).forEach((point, i) => {
          gsap.to(point, {
            scale: 1.5,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.3,
            transformOrigin: "center center"
          })
          
          gsap.to(point, {
            opacity: 0.3,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.3
          })
        })
      }

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.15,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        })
      }

    }, worldRef)

    return () => ctx.revert()
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
        <a href="/" style={{ textDecoration: 'none' }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '2rem', 
            fontWeight: 800, 
            color: '#646cff',
            letterSpacing: '-1px',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}>
            LanGain
          </h2>
        </a>
        
        <a 
          href="/about"
          style={{ 
            textDecoration: 'none', 
            color: '#646cff',
            fontWeight: 700,
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'color 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#535bf2'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#646cff'
          }}
        >
          About
        </a>
      </header>

      <main style={{ 
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        padding: '40px 40px 80px 40px',
        alignItems: 'center',
        background: 'linear-gradient(180deg, #ffffff 0%, #f7f7f7 100%)'
      }}
      className="about-grid">
        <div style={{ 
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 800,
            color: '#3c3c3c',
            letterSpacing: '-1px',
            marginBottom: '8px',
            lineHeight: 1.1
          }}>
            Our Mission
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            color: '#646cff',
            fontWeight: 600,
            lineHeight: 1.4,
            margin: 0
          }}>
            Breaking down language barriers, one learner at a time.
          </p>

          <p style={{
            fontSize: '1.1rem',
            color: '#555',
            lineHeight: 1.8,
            margin: 0
          }}>
            At LanGain, we believe that language learning should be accessible, engaging, and effective for everyone. 
            Our platform harnesses the power of AI and real-world content to create personalized learning experiences 
            that adapt to your unique goals and interests.
          </p>

          <p style={{
            fontSize: '1.1rem',
            color: '#555',
            lineHeight: 1.8,
            margin: 0
          }}>
            Whether you're learning for travel, career advancement, or personal enrichment, we're here to support 
            your journey every step of the way. Join thousands of learners worldwide who are discovering the joy 
            of mastering new languages with LanGain.
          </p>

          <div style={{
            marginTop: '24px',
            padding: '32px',
            background: 'white',
            borderRadius: '16px',
            border: '2px solid #e5e5e5',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#3c3c3c',
              marginBottom: '24px'
            }}>
              Why Choose LanGain?
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {accordionItems.map((item, i) => (
                <div 
                  key={i}
                  style={{
                    borderRadius: '12px',
                    border: '2px solid #e5e5e5',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    background: openAccordion === i ? '#f7f7ff' : 'white'
                  }}
                >
                  <button
                    onClick={() => toggleAccordion(i)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (openAccordion !== i) {
                        e.currentTarget.style.background = '#f7f7f7'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <span style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: openAccordion === i ? '#646cff' : '#e5e5e5',
                        color: openAccordion === i ? 'white' : '#999',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        flexShrink: 0,
                        transition: 'all 0.3s'
                      }}>✓</span>
                      <span style={{
                        fontSize: '1rem',
                        color: openAccordion === i ? '#646cff' : '#555',
                        fontWeight: openAccordion === i ? 700 : 600,
                        transition: 'all 0.3s'
                      }}>
                        {item.title}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '1.5rem',
                      color: '#646cff',
                      transform: openAccordion === i ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                      display: 'inline-block'
                    }}>
                      ▼
                    </span>
                  </button>
                  <div
                    ref={(el) => { accordionRefs.current[i] = el }}
                    style={{
                      height: 0,
                      opacity: 0,
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      padding: '0 20px 20px 60px',
                      fontSize: '0.95rem',
                      color: '#666',
                      lineHeight: 1.7
                    }}>
                      {item.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px'
        }}>
          <svg 
            ref={worldRef}
            viewBox="0 0 600 600" 
            style={{ width: '100%', maxWidth: '600px', height: 'auto' }}
          >
            <defs>
              <radialGradient id="globeGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#646cff" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#535bf2" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#3c3c3c" stopOpacity="0.3" />
              </radialGradient>
              
              <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#646cff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#646cff" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#646cff" stopOpacity="0" />
                <stop offset="50%" stopColor="#646cff" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ce82ff" stopOpacity="0" />
              </linearGradient>
            </defs>

            <circle 
              ref={glowRef}
              cx="300" 
              cy="300" 
              r="200" 
              fill="url(#glowGradient)" 
              opacity="0.2"
            />

            <g ref={particlesRef}>
              {Array.from({ length: 30 }).map((_, i) => {
                const angle = (i / 30) * Math.PI * 2
                const radius = 180 + Math.random() * 100
                const x = 300 + Math.cos(angle) * radius
                const y = 300 + Math.sin(angle) * radius
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={Math.random() * 3 + 1}
                    fill={i % 3 === 0 ? "#ce82ff" : i % 3 === 1 ? "#646cff" : "#ff9600"}
                    opacity={0.6}
                  />
                )
              })}
            </g>

            <g ref={connectionsRef}>
              <line x1="200" y1="200" x2="400" y2="250" stroke="url(#connectionGradient)" strokeWidth="2" strokeDasharray="1000" opacity="0.4"/>
              <line x1="250" y1="380" x2="380" y2="280" stroke="url(#connectionGradient)" strokeWidth="2" strokeDasharray="1000" opacity="0.4"/>
              <line x1="350" y1="200" x2="250" y2="350" stroke="url(#connectionGradient)" strokeWidth="2" strokeDasharray="1000" opacity="0.4"/>
              <line x1="180" y1="300" x2="350" y2="380" stroke="url(#connectionGradient)" strokeWidth="2" strokeDasharray="1000" opacity="0.4"/>
            </g>

            <g>
              <circle id="globe-base" cx="300" cy="300" r="140" fill="url(#globeGradient)" />
              
              <g opacity="0.9">
                <path
                  d="M 230 250 Q 220 230, 240 220 Q 260 210, 270 230 L 280 240 Q 290 260, 270 270 Q 250 280, 240 260 Z"
                  fill="#535bf2"
                />
                
                <path
                  d="M 260 290 Q 250 310, 265 330 Q 275 345, 280 325 Q 285 305, 270 295 Z"
                  fill="#3c3c3c"
                />

                <path
                  d="M 340 230 Q 350 220, 360 225 Q 370 235, 365 245 Q 355 255, 345 250 Z"
                  fill="#535bf2"
                />

                <path
                  d="M 350 270 Q 340 290, 350 320 Q 365 345, 375 330 Q 380 310, 370 290 Q 360 270, 350 270 Z"
                  fill="#3c3c3c"
                />

                <path
                  d="M 390 240 Q 410 230, 430 245 Q 440 270, 425 290 Q 400 305, 390 285 Q 385 260, 390 240 Z"
                  fill="#535bf2"
                />

                <path
                  d="M 420 350 Q 430 345, 440 355 Q 445 365, 435 370 Q 425 370, 420 360 Z"
                  fill="#3c3c3c"
                />
              </g>
            </g>

            <g ref={meridiansRef} opacity="0.3">
              <ellipse cx="300" cy="300" rx="140" ry="40" fill="none" stroke="white" strokeWidth="1.5" />
              <ellipse cx="300" cy="300" rx="140" ry="80" fill="none" stroke="white" strokeWidth="1.5" />
              <ellipse cx="300" cy="300" rx="140" ry="120" fill="none" stroke="white" strokeWidth="1.5" />
              <line x1="160" y1="300" x2="440" y2="300" stroke="white" strokeWidth="1.5" />
              <line x1="300" y1="160" x2="300" y2="440" stroke="white" strokeWidth="1.5" />
            </g>

            <g ref={pulsePointsRef}>
              <circle cx="200" cy="200" r="6" fill="#ff9600" opacity="0.8"/>
              <circle cx="400" cy="250" r="6" fill="#ce82ff" opacity="0.8"/>
              <circle cx="250" cy="380" r="6" fill="#646cff" opacity="0.8"/>
              <circle cx="380" cy="280" r="6" fill="#ff9600" opacity="0.8"/>
              <circle cx="350" cy="200" r="6" fill="#ce82ff" opacity="0.8"/>
              <circle cx="180" cy="300" r="6" fill="#646cff" opacity="0.8"/>
            </g>

            <g ref={symbolsRef}>
              <text x="140" y="160" fontSize="28" fill="#646cff" opacity="0.7" fontWeight="bold">中</text>
              <text x="450" y="200" fontSize="28" fill="#ce82ff" opacity="0.7" fontWeight="bold">مرحبا</text>
              <text x="470" y="360" fontSize="28" fill="#ff9600" opacity="0.7" fontWeight="bold">あ</text>
              <text x="160" y="420" fontSize="28" fill="#646cff" opacity="0.7" fontWeight="bold">హెల్లో</text>
              <text x="420" y="440" fontSize="28" fill="#ce82ff" opacity="0.7" fontWeight="bold">한</text>
              <text x="120" y="340" fontSize="28" fill="#ff9600" opacity="0.7" fontWeight="bold">ह</text>
            </g>
          </svg>
        </div>
      </main>

      <footer style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#f7f7f7',
        color: '#999',
        fontSize: '14px'
      }}>
        <p style={{ margin: 0 }}>© 2026 LanGain. All rights reserved.</p>
      </footer>

      <style>{`
        @media (max-width: 1024px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  )
}