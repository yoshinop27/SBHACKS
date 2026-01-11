import { useState } from 'react'
import { Navbar } from '../components/Layout/Navbar'

export default function FrenzyPage() {
    const [selectedLang, setSelectedLang] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const languages = [
        { name: 'Spanish', code: 'es', bg: '#fff8e1', text: '#ff6f00' },
        { name: 'French', code: 'fr', bg: '#e3f2fd', text: '#0d47a1' },
        { name: 'German', code: 'de', bg: '#fffde7', text: '#f57f17' },
        { name: 'Japanese', code: 'jp', bg: '#ffebee', text: '#b71c1c' },
        { name: 'Korean', code: 'kr', bg: '#e8eaf6', text: '#1a237e' },
        { name: 'Italian', code: 'it', bg: '#e8f5e9', text: '#1b5e20' },
        { name: 'Portuguese', code: 'br', bg: '#e0f2f1', text: '#004d40' },
        { name: 'Chinese', code: 'cn', bg: '#fbe9e7', text: '#bf360c' },
    ]

    const handleFrenzyClick = async () => {
        if (!selectedLang) return
        setIsGenerating(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('language', selectedLang)

            const response = await fetch('http://127.0.0.1:8000/generate-frenzy', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Failed to generate PDF')
            }

            // Convert response to blob and download
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Fourteen_Day_Frenzy_${selectedLang}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            a.remove()

        } catch (err) {
            setError('Something went wrong. Please try again.')
            console.error(err)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div style={{ background: '#f7f7f7', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <Navbar />

            <main style={{ padding: '40px 24px', maxWidth: 1000, margin: '0 auto' }}>
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: 800,
                        color: '#3c3c3c',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem'
                    }}>
                        <span style={{ animation: 'float 3s ease-in-out infinite' }}>✈️</span>
                        Fourteen Day Frenzy
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: '#777',
                        maxWidth: '700px',
                        margin: '0 auto',
                        lineHeight: 1.6
                    }}>
                        Ready to jumpstart your language journey? Select a language below to generate
                        your ultimate <strong style={{ color: '#58cc02' }}>2-week beginner study guide</strong>.
                        Powered by AI, tailored for rapid learning.
                    </p>
                </div>

                {/* Language Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '3rem'
                }}>
                    {languages.map((lang) => (
                        <button
                            key={lang.name}
                            onClick={() => setSelectedLang(lang.name)}
                            disabled={isGenerating}
                            style={{
                                background: selectedLang === lang.name ? lang.bg : 'white',
                                border: `3px solid ${selectedLang === lang.name ? lang.text : '#e5e5e5'}`, // Thicker border for selection
                                borderRadius: '24px',
                                padding: '1.5rem',
                                cursor: isGenerating ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                textAlign: 'center',
                                boxShadow: selectedLang === lang.name
                                    ? `0 10px 20px -5px ${lang.bg}`
                                    : '0 4px 6px rgba(0,0,0,0.05)',
                                transform: selectedLang === lang.name ? 'translateY(-4px)' : 'none',
                                opacity: isGenerating && selectedLang !== lang.name ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!isGenerating && selectedLang !== lang.name) {
                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                    e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(0,0,0,0.1)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedLang !== lang.name) {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'
                                }
                            }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                                <img
                                    src={`https://flagcdn.com/${lang.code}.svg`}
                                    alt={lang.name}
                                    style={{
                                        width: '60px',
                                        height: '45px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                />
                            </div>
                            <div style={{
                                fontWeight: 700,
                                fontSize: '1.2rem',
                                color: selectedLang === lang.name ? lang.text : '#3c3c3c'
                            }}>
                                {lang.name}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Action Area */}
                <div style={{ textAlign: 'center', minHeight: '100px' }}>
                    {error && (
                        <div style={{
                            color: '#ff4b4b',
                            marginBottom: '1rem',
                            fontWeight: 600,
                            background: '#fff5f5',
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            borderRadius: '12px'
                        }}>
                            {error}
                        </div>
                    )}

                    {selectedLang && (
                        <button
                            onClick={handleFrenzyClick}
                            disabled={isGenerating}
                            style={{
                                background: isGenerating ? '#e5e5e5' : '#1cb0f6',
                                color: isGenerating ? '#777' : 'white',
                                border: 'none',
                                padding: '1rem 3rem',
                                fontSize: '1.5rem',
                                fontWeight: 800,
                                borderRadius: '50px',
                                cursor: isGenerating ? 'wait' : 'pointer',
                                boxShadow: isGenerating ? 'none' : '0 8px 0 #1899d6',
                                transition: 'all 0.1s',
                                transform: isGenerating ? 'translateY(4px)' : 'none',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseDown={(e) => !isGenerating && (e.currentTarget.style.transform = 'translateY(4px)', e.currentTarget.style.boxShadow = '0 4px 0 #1899d6')}
                            onMouseUp={(e) => !isGenerating && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 8px 0 #1899d6')}
                        >
                            {isGenerating ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className="sc-spinner">✈️</span> Generating PDF...
                                </span>
                            ) : (
                                "Frenzy!"
                            )}
                        </button>
                    )}

                    {!selectedLang && !isGenerating && (
                        <p style={{ color: '#ccc', fontStyle: 'italic' }}>Select a language to begin</p>
                    )}
                </div>
            </main>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .sc-spinner {
          animation: spin 1s infinite linear;
          display: inline-block;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    )
}
