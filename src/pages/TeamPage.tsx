import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'

export default function TeamPage() {
    const containerRef = useRef<HTMLDivElement>(null)
    const handshakeRef = useRef<SVGGElement>(null)
    const sproutRef = useRef<SVGGElement>(null)
    const chartRef = useRef<SVGGElement>(null)

    // Animation setup
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Fade in container
            gsap.from(containerRef.current, {
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            })

            // Handshake Animation (Top)
            if (handshakeRef.current) {
                const tl = gsap.timeline({ repeat: -1, repeatDelay: 2, yoyo: true })
                tl.fromTo(handshakeRef.current.querySelector('.hand-left'),
                    { x: -20, opacity: 0 },
                    { x: 0, opacity: 1, duration: 1, ease: 'power2.out' }
                )
                    .fromTo(handshakeRef.current.querySelector('.hand-right'),
                        { x: 20, opacity: 0 },
                        { x: 0, opacity: 1, duration: 1, ease: 'power2.out' },
                        "<"
                    )
                    .to(handshakeRef.current.querySelectorAll('.shake-lines'), {
                        opacity: 1,
                        scale: 1.2,
                        stagger: 0.1,
                        duration: 0.5
                    })
            }

            // Sprout Animation (Bottom Left)
            if (sproutRef.current) {
                const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 })
                tl.fromTo(sproutRef.current.querySelector('.stem'),
                    { scaleY: 0, transformOrigin: 'bottom center' },
                    { scaleY: 1, duration: 1.5, ease: 'power2.out' }
                )
                    .fromTo(sproutRef.current.querySelectorAll('.leaf'),
                        { scale: 0, opacity: 0, transformOrigin: 'bottom left' },
                        { scale: 1, opacity: 1, stagger: 0.3, duration: 0.8, ease: 'back.out(1.7)' }
                    )
            }

            // Chart Animation (Bottom Right)
            if (chartRef.current) {
                const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 })
                tl.fromTo(chartRef.current.querySelector('.chart-line'),
                    { strokeDashoffset: 100 },
                    { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' }
                )
                    .fromTo(chartRef.current.querySelectorAll('.chart-dot'),
                        { scale: 0, opacity: 0 },
                        { scale: 1, opacity: 1, stagger: 0.4, duration: 0.4, ease: 'back.out(2)' },
                        "-=1.5"
                    )
            }
        }, containerRef)

        return () => ctx.revert()
    }, [])

    const TeamMember = ({ name, university, image }: { name: string, university: string, image: string }) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
                width: '180px',
                height: '180px',
                background: '#e5e5e5',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                <img 
                    src={image} 
                    alt={name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            </div>
            <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#3c3c3c' }}>{name}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>{university}</p>
            </div>
        </div>
    )

    return (
        <div ref={containerRef} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header - Reused style */}
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

                <div style={{ display: 'flex', gap: '32px' }}>
                    <Link
                        to="/team"
                        style={{
                            textDecoration: 'none',
                            color: '#646cff',
                            fontWeight: 700,
                            fontSize: '1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
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
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#646cff' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#3c3c3c' }}
                    >
                        About
                    </Link>
                </div>
            </header>

            {/* Main Content Split */}
            <main style={{ flex: 1, display: 'flex', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Left Side (60%) - Team Grid */}
                <section style={{
                    flex: '60%',
                    padding: '60px 40px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRight: '1px solid #f0f0f0'
                }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        color: '#3c3c3c',
                        marginBottom: '60px',
                        fontWeight: 800
                    }}>Meet Our Team</h1>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '60px',
                        width: '100%',
                        maxWidth: '600px'
                    }}>
                        <TeamMember name="Colin Kermode" university="UC Santa Barbara" image="/team/colin.jpg" />
                        <TeamMember name="Marisol Morales" university="CSU Long Beach" image="/team/mar.jpg" />
                        <TeamMember name="Winston Ta" university="CSU Long Beach" image="/team/winston.jpg" />
                        <TeamMember name="Preston Yoshino" university="Grinnell College" image="/team/preston.jpg" />
                    </div>
                </section>

                {/* Right Side (40%) - GSAP Visuals */}
                <section style={{
                    flex: '40%',
                    padding: '40px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #f9f9ff 0%, #ffffff 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        {/* Circular Gradient Background */}
                        <div style={{
                            position: 'absolute',
                            width: '400px',
                            height: '400px',
                            background: 'radial-gradient(circle, rgba(100,108,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                            borderRadius: '50%',
                            zIndex: 0
                        }} />

                        {/* Triangle Arrangement Container */}
                        <div style={{
                            position: 'relative',
                            width: '300px',
                            height: '300px',
                            zIndex: 1
                        }}>
                            {/* Top - Handshake (Teamwork) */}
                            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}>
                                <svg width="100" height="100" viewBox="0 0 100 100">
                                    <g ref={handshakeRef}>
                                        <path className="hand-left" d="M10,50 Q30,40 50,50" stroke="#646cff" strokeWidth="5" fill="none" strokeLinecap="round" />
                                        <path className="hand-right" d="M90,50 Q70,40 50,50" stroke="#646cff" strokeWidth="5" fill="none" strokeLinecap="round" />
                                        <path className="shake-lines" d="M45,30 L45,20" stroke="#ff9600" strokeWidth="2" opacity="0" />
                                        <path className="shake-lines" d="M55,30 L55,20" stroke="#ff9600" strokeWidth="2" opacity="0" />
                                    </g>
                                    <text x="50" y="80" textAnchor="middle" fill="#646cff" fontSize="12" fontWeight="bold">Teamwork</text>
                                </svg>
                            </div>

                            {/* Bottom Left - Sprout (Growth) */}
                            <div style={{ position: 'absolute', bottom: 20, left: 0 }}>
                                <svg width="100" height="100" viewBox="0 0 100 100">
                                    <g ref={sproutRef}>
                                        {/* Pot */}
                                        <path d="M30,80 L70,80 L65,95 L35,95 Z" fill="#e5e5e5" />
                                        {/* Stem */}
                                        <path className="stem" d="M50,80 L50,40" stroke="#535bf2" strokeWidth="4" strokeLinecap="round" />
                                        {/* Leaves */}
                                        <path className="leaf" d="M50,60 Q70,50 70,30 Q50,40 50,60" fill="#646cff" />
                                        <path className="leaf" d="M50,50 Q30,40 30,20 Q50,30 50,50" fill="#646cff" />
                                    </g>
                                    <text x="50" y="98" textAnchor="middle" fill="#646cff" fontSize="12" fontWeight="bold">Growth</text>
                                </svg>
                            </div>

                            {/* Bottom Right - Chart (Possibility) */}
                            <div style={{ position: 'absolute', bottom: 20, right: 0 }}>
                                <svg width="100" height="100" viewBox="0 0 100 100">
                                    <g ref={chartRef}>
                                        {/* Axes */}
                                        <line x1="20" y1="80" x2="90" y2="80" stroke="#e5e5e5" strokeWidth="2" />
                                        <line x1="20" y1="80" x2="20" y2="20" stroke="#e5e5e5" strokeWidth="2" />

                                        {/* Chart Line */}
                                        <path className="chart-line" d="M20,80 L40,60 L60,70 L80,30" fill="none" stroke="#646cff" strokeWidth="3" strokeLinecap="round" strokeDasharray="100" />

                                        {/* Dots */}
                                        <circle className="chart-dot" cx="40" cy="60" r="3" fill="#ff9600" />
                                        <circle className="chart-dot" cx="60" cy="70" r="3" fill="#ff9600" />
                                        <circle className="chart-dot" cx="80" cy="30" r="3" fill="#ff9600" />
                                    </g>
                                    <text x="50" y="98" textAnchor="middle" fill="#646cff" fontSize="12" fontWeight="bold">Possibility</text>
                                </svg>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Mission Section */}
            <section style={{
                padding: '80px 40px',
                background: '#f7f7f7',
                textAlign: 'center',
                borderTop: '1px solid #e5e5e5'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: '2rem',
                        color: '#646cff',
                        marginBottom: '24px',
                        fontWeight: 800
                    }}>Our Mission</h2>
                    <p style={{
                        fontSize: '1.2rem',
                        color: '#555',
                        lineHeight: 1.8
                    }}>
                        We are dedicated to creating a language learning app that democratizes language learning improvement for all.
                        Our team brings together diverse perspectives and expertise to build tools that make language acquisition 
                        accessible, engaging, and effective. Through innovative AI-powered features and personalized learning paths,
                        we're breaking down barriers and opening up a world of possibilities for learners everywhere.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '40px',
                textAlign: 'center',
                background: '#fff',
                color: '#999',
                fontSize: '14px',
                borderTop: '1px solid #f0f0f0'
            }}>
                <p style={{ margin: 0 }}>© 2026 LanGain. All rights reserved.</p>
            </footer>
        </div>
    )
}