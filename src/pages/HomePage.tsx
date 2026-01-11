import { Dialog } from '@reach/dialog'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchVideosWithScores } from '../lib/videos'
import type { VideoWithScore } from '../types/score'
import { Navbar } from '../components/Layout/Navbar'
import { VideoUploadForm } from '../components/Video/VideoUploadForm'
import { VideoScoreGallery } from '../components/Video/VideoScoreGallery'
import VideoUploader from '../components/VideoUploader'
import SummaryDisplay from '../components/SummaryDisplay'

export default function HomePage() {
  const { user } = useAuth()
  const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false)
  const [isTwelveLabsUploadOpen, setIsTwelveLabsUploadOpen] = useState(false)
  
  // Videos with scores state
  const [videosWithScores, setVideosWithScores] = useState<VideoWithScore[]>([])
  const [videosLoading, setVideosLoading] = useState(false)
  const [videosError, setVideosError] = useState<string | null>(null)

  // TwelveLabs State
  const [summaryData, setSummaryData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const canCreate = Boolean(user?.id)

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

  return (
    <div>
      <Navbar />
      <main style={{ padding: 16, maxWidth: 980, margin: '0 auto' }}>
        {/* TwelveLabs Integrations */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: '2rem' }}>
            <div>
              <h1 style={{ marginBottom: 4 }}>Video Summarizer</h1>
              <p style={{ marginTop: 0, opacity: 0.8 }}>Upload a video or provide a YouTube link to generate a summary and translation.</p>
            </div>
            <button onClick={() => setIsTwelveLabsUploadOpen(true)}>
              Upload Video
            </button>
          </div>

          {isProcessing && (
            <div style={{ textAlign: 'center', margin: '20px 0', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <p>Processing video... This may take a minute.</p>
            </div>
          )}

          {summaryData && (
            <SummaryDisplay
              summary={summaryData.summary}
              title={summaryData.title}
              topics={summaryData.topics}
              hashtags={summaryData.hashtags}
            />
          )}

          <hr style={{ opacity: 0.1, margin: '4rem 0' }} />
        </section>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <div>
            <h1 style={{ marginBottom: 4 }}>Your Videos</h1>
            <p style={{ marginTop: 0, opacity: 0.8 }}>Your videos and their associated scores and feedback.</p>
          </div>
          <button onClick={() => setIsVideoUploadOpen(true)} disabled={!canCreate}>
            Upload Video
          </button>
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
          <div style={{ display: 'grid', gap: 12 }}>
            <h2 style={{ margin: 0 }}>Upload Video</h2>
            <VideoUploadForm
              onSuccess={() => {
                setIsVideoUploadOpen(false)
              }}
            />
          </div>
        </Dialog>

        <Dialog
          isOpen={isTwelveLabsUploadOpen}
          onDismiss={() => setIsTwelveLabsUploadOpen(false)}
          aria-label="Upload Video for Summarization"
        >
          <div style={{ display: 'grid', gap: 12 }}>
            <h2 style={{ margin: 0 }}>Upload Video for Summarization</h2>
            <VideoUploader
              onUploadSuccess={(data) => {
                setSummaryData(data)
                setIsTwelveLabsUploadOpen(false)
              }}
              onLoading={setIsProcessing}
            />
          </div>
        </Dialog>
      </main>
    </div>
  )
}
