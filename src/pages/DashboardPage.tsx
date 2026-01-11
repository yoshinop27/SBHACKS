import { Dialog } from '@reach/dialog'
import { useEffect, useState, useRef, useCallback } from 'react'
import { fetchRawVideos, type RawVideo } from '../lib/videos'
import { Navbar } from '../components/Layout/Navbar'
import { VideoModal } from '../components/Video/VideoModal'
import { PiPPlayer } from '../components/Video/PiPPlayer'
import QuizDisplay from '../components/QuizDisplay'

export default function DashboardPage() {
  // Raw videos from storage
  const [rawVideos, setRawVideos] = useState<RawVideo[]>([])
  const [rawVideosLoading, setRawVideosLoading] = useState(false)
  const [rawVideosError, setRawVideosError] = useState<string | null>(null)

  // TwelveLabs / Quiz State
  const [quizData, setQuizData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isQuizOpen, setIsQuizOpen] = useState(false)

  // Video playback state
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isPiPMode, setIsPiPMode] = useState(false)
  const [videoCurrentTime] = useState(0)

  // Ref to track mounted state
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  // Load raw videos from storage
  useEffect(() => {
    let mounted = true
    async function loadRawVideos() {
      setRawVideosLoading(true)
      setRawVideosError(null)
      try {
        const data = await fetchRawVideos()
        if (!mounted) return
        setRawVideos(data)
      } catch (err) {
        if (!mounted) return
        setRawVideosError(err instanceof Error ? err.message : 'Failed to load raw videos.')
      } finally {
        if (!mounted) return
        setRawVideosLoading(false)
      }
    }
    loadRawVideos()
    return () => { mounted = false }
  }, [])

  const handleRawVideoClick = async (video: RawVideo) => {
    setCurrentVideoUrl(video.url)
    setIsVideoModalOpen(true)
    setIsPiPMode(false)
    setQuizData(null)
    setIsProcessing(true)

    try {
      const payload = new FormData()
      payload.append('url', video.url)

      const response = await fetch('http://127.0.0.1:8000/upload-url', {
        method: 'POST',
        body: payload,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to process video: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      if (mountedRef.current) {
        setQuizData(data)
      }
    } catch (err) {
      console.error('Error processing raw video:', err)
      if (mountedRef.current) {
        alert(err instanceof Error ? err.message : 'Failed to process video')
        setIsVideoModalOpen(false)
      }
    } finally {
      if (mountedRef.current) {
        setIsProcessing(false)
      }
    }
  }

  const handleQuizReady = useCallback(() => {
    setIsVideoModalOpen(false)
    setIsPiPMode(true)
    setIsQuizOpen(true)
  }, [])

  const handleExpandPiP = useCallback(() => {
    setIsPiPMode(false)
    setIsVideoModalOpen(true)
  }, [])

  const handleClosePiP = useCallback(() => {
    setIsPiPMode(false)
    setCurrentVideoUrl(null)
  }, [])

  const handleCloseVideoModal = useCallback(() => {
    setIsVideoModalOpen(false)
    if (quizData) {
      setIsPiPMode(true)
      setIsQuizOpen(true)
    } else {
      setCurrentVideoUrl(null)
    }
  }, [quizData])

  const handleCloseQuiz = useCallback(() => {
    setIsQuizOpen(false)
    setIsPiPMode(false)
    setCurrentVideoUrl(null)
    setQuizData(null)
  }, [])

  const languageColors: Record<string, { bg: string, text: string, emoji: string }> = {
    'Spanish': { bg: '#fff3cd', text: '#856404', emoji: '🇪🇸' },
    'French': { bg: '#cce5ff', text: '#004085', emoji: '🇫🇷' },
    'German': { bg: '#f8d7da', text: '#721c24', emoji: '🇩🇪' },
    'Japanese': { bg: '#ffe5ec', text: '#c71f37', emoji: '🇯🇵' },
    'Korean': { bg: '#e2e3ff', text: '#4a4e69', emoji: '🇰🇷' },
    'Italian': { bg: '#d4edda', text: '#155724', emoji: '🇮🇹' },
    'Portuguese': { bg: '#d1ecf1', text: '#0c5460', emoji: '🇧🇷' },
    'Chinese': { bg: '#ffeaa7', text: '#d63031', emoji: '🇨🇳' },
    'Unknown': { bg: '#e9ecef', text: '#495057', emoji: '🌍' },
  }

  return (
    <div style={{ background: '#f7f7f7', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '2rem',
          textAlign: 'center',
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '0.5rem',
            color: '#3c3c3c',
          }}>
            <span style={{ marginRight: '12px' }}>📺</span>
            Start Learning
          </h1>
          <p style={{ 
            color: '#777', 
            fontSize: '1.1rem',
            margin: 0,
          }}>
            Pick a video and test your language skills with an AI-powered quiz!
          </p>
        </div>

        {/* Loading State */}
        {rawVideosLoading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            background: 'white',
            borderRadius: '20px',
            border: '2px solid #e5e5e5',
          }}>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '1rem',
              animation: 'bounce 1s infinite',
            }}>🎬</div>
            <p style={{ color: '#777', fontWeight: 600 }}>Loading videos...</p>
          </div>
        )}

        {/* Error State */}
        {rawVideosError && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 2rem',
            background: '#fff5f5',
            borderRadius: '20px',
            border: '2px solid #ff4b4b',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😰</div>
            <p style={{ color: '#ff4b4b', fontWeight: 700 }}>{rawVideosError}</p>
          </div>
        )}

        {/* Empty State */}
        {!rawVideosLoading && !rawVideosError && rawVideos.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            background: 'white',
            borderRadius: '20px',
            border: '2px dashed #e5e5e5',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
            <h2 style={{ color: '#3c3c3c', marginBottom: '0.5rem' }}>No videos yet!</h2>
            <p style={{ color: '#777' }}>Upload some videos to get started with learning.</p>
          </div>
        )}

        {/* Video Grid */}
        {!rawVideosLoading && !rawVideosError && rawVideos.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {rawVideos.map((video, index) => {
              const langConfig = languageColors[video.language] || languageColors['Unknown']
              return (
                <button
                  key={video.name}
                  onClick={() => handleRawVideoClick(video)}
                  disabled={isProcessing}
                  style={{
                    padding: 0,
                    background: 'white',
                    border: '2px solid #e5e5e5',
                    borderRadius: '20px',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.6 : 1,
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                    boxShadow: '0 4px 0 #e5e5e5',
                    animation: `slideUp 0.3s ease-out ${index * 0.05}s both`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isProcessing) {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 8px 0 #e5e5e5'
                      e.currentTarget.style.borderColor = '#1cb0f6'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 0 #e5e5e5'
                    e.currentTarget.style.borderColor = '#e5e5e5'
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <video
                      src={video.url}
                      style={{
                        width: '100%',
                        aspectRatio: '16 / 9',
                        objectFit: 'cover',
                        display: 'block',
                        pointerEvents: 'none',
                        background: '#f0f0f0',
                      }}
                      preload="metadata"
                      muted
                    />
                    {/* Play overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.3)',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                      className="play-overlay"
                    >
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      }}>
                        <span style={{ fontSize: '1.5rem', marginLeft: '4px' }}>▶</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <span style={{
                      display: 'block',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#3c3c3c',
                      marginBottom: '0.75rem',
                      wordBreak: 'break-word',
                    }}>
                      {video.displayName}
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8rem',
                      background: langConfig.bg,
                      color: langConfig.text,
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontWeight: 700,
                    }}>
                      {langConfig.emoji} {video.language}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Video Modal */}
        {currentVideoUrl && (
          <VideoModal
            videoUrl={currentVideoUrl}
            isOpen={isVideoModalOpen}
            onClose={handleCloseVideoModal}
            isLoading={isProcessing}
            quizReady={!!quizData}
            onQuizReady={handleQuizReady}
          />
        )}

        {/* PiP Player */}
        {currentVideoUrl && (
          <PiPPlayer
            videoUrl={currentVideoUrl}
            isVisible={isPiPMode}
            onExpand={handleExpandPiP}
            onClose={handleClosePiP}
            currentTime={videoCurrentTime}
          />
        )}

        {/* Quiz Dialog */}
        <Dialog
          isOpen={isQuizOpen}
          onDismiss={handleCloseQuiz}
          aria-label="Language Quiz"
        >
          <button
            onClick={handleCloseQuiz}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: '#f7f7f7',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: '#777',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ff4b4b'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f7f7f7'
              e.currentTarget.style.color = '#777'
            }}
          >
            ✕
          </button>
          {quizData && (
            <>
              {quizData.title && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ 
                    margin: 0, 
                    color: '#3c3c3c',
                    fontSize: '1.5rem',
                  }}>
                    🎯 {quizData.title}
                  </h2>
                  {quizData.topics && quizData.topics.length > 0 && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {quizData.topics.map((topic: string) => (
                        <span key={topic} style={{ 
                          fontSize: '0.8rem', 
                          background: '#e2e3ff',
                          color: '#4a4e69',
                          padding: '6px 12px', 
                          borderRadius: '20px',
                          fontWeight: 600,
                        }}>
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {quizData.quiz && Array.isArray(quizData.quiz) && quizData.quiz.length > 0 && (
                <QuizDisplay quiz={quizData.quiz} videoId={quizData.video_id} />
              )}
            </>
          )}
        </Dialog>
      </main>

      <style>{`
        button:hover .play-overlay {
          opacity: 1 !important;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
