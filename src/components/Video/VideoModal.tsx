import { useEffect, useRef } from 'react'
import './VideoModal.css'

interface VideoModalProps {
  videoUrl: string
  isOpen: boolean
  onClose: () => void
  isLoading: boolean
  onQuizReady: () => void
  quizReady: boolean
}

export function VideoModal({ 
  videoUrl, 
  isOpen, 
  onClose, 
  isLoading, 
  onQuizReady,
  quizReady 
}: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch(console.error)
    }
  }, [isOpen])

  // Auto transition to PiP when quiz is ready
  useEffect(() => {
    if (quizReady && isOpen) {
      onQuizReady()
    }
  }, [quizReady, isOpen, onQuizReady])

  if (!isOpen) return null

  return (
    <div className="video-modal-overlay" onClick={onClose}>
      <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="video-modal-close" onClick={onClose}>
          &times;
        </button>
        
        <video
          ref={videoRef}
          src={videoUrl}
          className="video-modal-player"
          controls
          autoPlay
        />

        {isLoading && (
          <div className="video-modal-loading">
            <div className="loading-spinner" />
            <p>Generating quiz...</p>
          </div>
        )}

        {quizReady && (
          <div className="video-modal-quiz-ready">
            <p>Quiz is ready!</p>
            <button onClick={onQuizReady}>
              Start Quiz →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

