import { Dialog } from '@reach/dialog'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchVideosWithScores, fetchRawVideos, type RawVideo } from '../lib/videos'
import type { VideoWithScore } from '../types/score'
import { Navbar } from '../components/Layout/Navbar'
import { VideoScoreGallery } from '../components/Video/VideoScoreGallery'
import { VideoModal } from '../components/Video/VideoModal'
import { PiPPlayer } from '../components/Video/PiPPlayer'
import QuizDisplay from '../components/QuizDisplay'

export default function DashboardPage() {
  const { user } = useAuth()

  // Videos with scores state
  const [videosWithScores, setVideosWithScores] = useState<VideoWithScore[]>([])
  const [videosLoading, setVideosLoading] = useState(false)
  const [videosError, setVideosError] = useState<string | null>(null)

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
  const [videoCurrentTime, setVideoCurrentTime] = useState(0)

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

  useEffect(() => {
    if (!user?.id) return

    let mounted = true
    async function loadVideos() {
      setVideosLoading(true)
      setVideosError(null)
      try {
        const data = await fetchVideosWithScores()
        if (!mounted) return
        setVideosWithScores(data)
      } catch (err) {
        if (!mounted) return
        setVideosError(err instanceof Error ? err.message : 'Failed to load videos.')
      } finally {
        if (!mounted) return
        setVideosLoading(false)
      }
    }
    loadVideos()
    return () => {
      mounted = false
    }
  }, [user?.id])

  const handleRawVideoClick = async (video: RawVideo) => {
    // Immediately show video modal
    setCurrentVideoUrl(video.url)
    setIsVideoModalOpen(true)
    setIsPiPMode(false)
    setQuizData(null)
    setIsProcessing(true)

    // Start API call in background
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

  // Handle transition from video modal to PiP + Quiz
  const handleQuizReady = useCallback(() => {
    setIsVideoModalOpen(false)
    setIsPiPMode(true)
    setIsQuizOpen(true)
  }, [])

  // Handle expanding PiP back to fullscreen modal
  const handleExpandPiP = useCallback(() => {
    setIsPiPMode(false)
    setIsVideoModalOpen(true)
  }, [])

  // Handle closing PiP
  const handleClosePiP = useCallback(() => {
    setIsPiPMode(false)
    setCurrentVideoUrl(null)
  }, [])

  // Handle closing video modal
  const handleCloseVideoModal = useCallback(() => {
    setIsVideoModalOpen(false)
    // If quiz is ready, transition to PiP mode
    if (quizData) {
      setIsPiPMode(true)
      setIsQuizOpen(true)
    } else {
      setCurrentVideoUrl(null)
    }
  }, [quizData])

  // Handle closing quiz dialog
  const handleCloseQuiz = useCallback(() => {
    setIsQuizOpen(false)
    setIsPiPMode(false)
    setCurrentVideoUrl(null)
    setQuizData(null)
  }, [])

  return (
    <div>
      <Navbar />
      <main style={{ padding: 16, maxWidth: 980, margin: '0 auto' }}>
        {/* Raw Videos Gallery */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ marginBottom: 4 }}>Raw Videos</h1>
            <p style={{ marginTop: 0, opacity: 0.8 }}>Click a video to watch and take a language comprehension quiz.</p>
          </div>

          {rawVideosLoading && <p>Loading raw videos…</p>}
          {rawVideosError && (
            <div role="alert" style={{ color: 'crimson' }}>{rawVideosError}</div>
          )}

          {!rawVideosLoading && !rawVideosError && rawVideos.length === 0 && (
            <p style={{ opacity: 0.6 }}>No videos found in storage.</p>
          )}

          {!rawVideosLoading && !rawVideosError && rawVideos.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1rem',
            }}>
              {rawVideos.map((video) => (
                <button
                  key={video.name}
                  onClick={() => handleRawVideoClick(video)}
                  disabled={isProcessing}
                  style={{
                    padding: 0,
                    background: '#242424',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.6 : 1,
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                  }}
                >
                  <video
                    src={video.url}
                    style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      objectFit: 'cover',
                      display: 'block',
                      pointerEvents: 'none',
                    }}
                    preload="metadata"
                    muted
                  />
                  <div style={{ padding: '0.75rem', background: '#1a1a1a' }}>
                    <span style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: '#fff',
                      marginBottom: '0.5rem',
                      wordBreak: 'break-word',
                    }}>
                      {video.displayName}
                    </span>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.7rem',
                      background: '#333',
                      color: '#ccc',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {video.language}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <hr style={{ opacity: 0.1, margin: '4rem 0' }} />
        </section>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <div>
            <h1 style={{ marginBottom: 4 }}>Your Videos</h1>
            <p style={{ marginTop: 0, opacity: 0.8 }}>Your videos and their associated scores and feedback.</p>
          </div>
        </div>

        {videosLoading ? <p>Loading videos…</p> : null}
        {videosError ? (
          <div role="alert" style={{ color: 'crimson' }}>
            {videosError}
          </div>
        ) : null}

        {!videosLoading && !videosError ? (
          <VideoScoreGallery videos={videosWithScores} />
        ) : null}

        {/* Video Modal - Fullscreen playback */}
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

        {/* PiP Player - Shows when quiz is active */}
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
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              opacity: 0.6,
            }}
          >
            &times;
          </button>
          {quizData && (
            <>
              {quizData.title && (
                <div style={{ marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0 }}>{quizData.title}</h2>
                  {quizData.topics && quizData.topics.length > 0 && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {quizData.topics.map((topic: string) => (
                        <span key={topic} style={{ 
                          fontSize: '0.75rem', 
                          background: '#333', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px' 
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
    </div>
  )
}
