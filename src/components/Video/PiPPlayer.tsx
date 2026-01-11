import { useRef, useEffect } from 'react'
import './PiPPlayer.css'

interface PiPPlayerProps {
  videoUrl: string
  isVisible: boolean
  onExpand: () => void
  onClose: () => void
  currentTime?: number
}

export function PiPPlayer({ 
  videoUrl, 
  isVisible, 
  onExpand, 
  onClose,
  currentTime = 0
}: PiPPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isVisible && videoRef.current && currentTime > 0) {
      videoRef.current.currentTime = currentTime
    }
  }, [isVisible, currentTime])

  if (!isVisible) return null

  return (
    <div className="pip-container">
      <div className="pip-header">
        <span className="pip-label">Now Playing</span>
        <div className="pip-actions">
          <button 
            className="pip-btn pip-expand" 
            onClick={onExpand}
            title="Expand to fullscreen"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          </button>
          <button 
            className="pip-btn pip-close" 
            onClick={onClose}
            title="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      <video
        ref={videoRef}
        src={videoUrl}
        className="pip-video"
        controls
        autoPlay
      />
    </div>
  )
}

