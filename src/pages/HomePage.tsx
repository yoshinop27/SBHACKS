import { Dialog } from '@reach/dialog'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchVideosWithScores, fetchRawVideos, type RawVideo } from '../lib/videos'
import type { VideoWithScore } from '../types/score'
import { Navbar } from '../components/Layout/Navbar'
import { UnifiedVideoUpload } from '../components/Video/UnifiedVideoUpload'
import { VideoScoreGallery } from '../components/Video/VideoScoreGallery'
import SummaryDisplay from '../components/SummaryDisplay'

export default function HomePage() {
  const { user } = useAuth()
  const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false)
  
  // Videos with scores state
  const [videosWithScores, setVideosWithScores] = useState<VideoWithScore[]>([])
  const [videosLoading, setVideosLoading] = useState(false)
  const [videosError, setVideosError] = useState<string | null>(null)

  // Raw videos from storage
  const [rawVideos, setRawVideos] = useState<RawVideo[]>([])
  const [rawVideosLoading, setRawVideosLoading] = useState(false)
  const [rawVideosError, setRawVideosError] = useState<string | null>(null)

  // TwelveLabs State
  const [summaryData, setSummaryData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

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
    setIsProcessing(true)
    setSummaryData(null)
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
      setSummaryData(data)
    } catch (err) {
      console.error('Error processing raw video:', err)
      alert(err instanceof Error ? err.message : 'Failed to process video')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div>
      <Navbar />
      <main style={{ padding: 16, maxWidth: 980, margin: '0 auto' }}>
        {/* TwelveLabs Integrations */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: '2rem' }}>
            <div>
              <h1 style={{ marginBottom: 4 }}>Video Summarizer</h1>
              <p style={{ marginTop: 0, opacity: 0.8 }}>Upload a video file to generate a summary and translation.</p>
            </div>
            <button onClick={() => setIsVideoUploadOpen(true)}>
              Upload Video
            </button>
          </div>

          {isProcessing && (
            <div style={{ 
              textAlign: 'center', 
              margin: '24px 0', 
              padding: '24px', 
              background: 'rgba(100, 108, 255, 0.1)', 
              borderRadius: '8px',
              border: '1px solid rgba(100, 108, 255, 0.2)'
            }}>
              <p style={{ margin: 0, fontSize: '1rem', color: '#646cff' }}>
                Processing video... This may take a minute.
              </p>
            </div>
          )}

          {summaryData ? (
            <SummaryDisplay
              summary={summaryData.summary}
              title={summaryData.title}
              topics={summaryData.topics}
              hashtags={summaryData.hashtags}
            />
          ) : null}

          <hr style={{ opacity: 0.1, margin: '4rem 0' }} />
        </section>

        {/* Raw Videos Gallery */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ marginBottom: 4 }}>Raw Videos</h1>
            <p style={{ marginTop: 0, opacity: 0.8 }}>Click a video to generate a summary with 12 Labs.</p>
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem',
            }}>
              {rawVideos.map((video) => (
                <button
                  key={video.name}
                  onClick={() => handleRawVideoClick(video)}
                  disabled={isProcessing}
                  style={{
                    padding: '1rem',
                    background: 'rgba(100, 108, 255, 0.1)',
                    border: '1px solid rgba(100, 108, 255, 0.3)',
                    borderRadius: '8px',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.6 : 1,
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ 
                    display: 'block', 
                    fontSize: '0.9rem',
                    wordBreak: 'break-word',
                  }}>
                    {video.name}
                  </span>
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

        <Dialog
          isOpen={isVideoUploadOpen}
          onDismiss={() => setIsVideoUploadOpen(false)}
          aria-label="Upload Video"
        >
          <UnifiedVideoUpload
            onUploadSuccess={(data) => setSummaryData(data)}
            onLoading={(isLoading) => {
              setIsProcessing(isLoading)
              if (!isLoading) setIsVideoUploadOpen(false)
            }}
          />
        </Dialog>
      </main>
    </div>
  )
}
