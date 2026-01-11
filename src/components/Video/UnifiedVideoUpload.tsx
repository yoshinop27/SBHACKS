import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { createVideo, createScore } from '../../lib/videos'
import type { BackendAPIResponse } from '../../types/video'
import './UnifiedVideoUpload.css'

type Props = {
  onUploadSuccess: (data: BackendAPIResponse & { title?: string }) => void
  onLoading: (isLoading: boolean) => void
  onSuccess?: () => void
}

export function UnifiedVideoUpload({ onUploadSuccess, onLoading, onSuccess }: Props) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!user) {
      setError('You must be logged in to upload videos.')
      return
    }

    setError(null)
    onLoading(true)

    try {
      let apiResponse: BackendAPIResponse & { title?: string }

      // Step 1: Call backend API
      if (activeTab === 'file' && file) {
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch('http://127.0.0.1:8000/upload', {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) throw new Error('File upload failed')
        apiResponse = await response.json()
      } else if (activeTab === 'url' && url) {
        const response = await fetch('http://127.0.0.1:8000/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
        if (!response.ok) throw new Error('URL upload failed')
        apiResponse = await response.json()
      } else {
        setError('Please select a file or enter a URL')
        onLoading(false)
        return
      }

      // Step 2: Save to Videos table
      const videoLink = activeTab === 'url' ? url.trim() : `file:${file?.name || 'uploaded'}`
      const videoId = await createVideo({
        video_link: videoLink,
        response_data: apiResponse,
      })

      // Step 3: Save to Scores table with hardcoded score of 5
      await createScore(videoId, 5)

      // Step 4: Return data for SummaryDisplay
      onUploadSuccess(apiResponse)

      // Reset form
      setFile(null)
      setUrl('')
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload video.')
    } finally {
      onLoading(false)
    }
  }

  return (
    <div className="video-uploader-container">
      <div className="tabs">
        <button
          className={activeTab === 'file' ? 'active' : ''}
          onClick={() => setActiveTab('file')}
        >
          File Uploads
        </button>
        <button
          className={activeTab === 'url' ? 'active' : ''}
          onClick={() => setActiveTab('url')}
        >
          URL Uploads
        </button>
      </div>

      <div className="upload-content">
        {activeTab === 'file' ? (
          <div className="file-input-wrapper">
            <input type="file" onChange={handleFileChange} accept="video/*" />
            {file && <p>Selected: {file.name}</p>}
          </div>
        ) : (
          <input
            type="text"
            placeholder="Paste video URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="url-input"
          />
        )}

        <button onClick={handleUpload} className="upload-button" disabled={!file && !url}>
          Upload Video
        </button>

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  )
}

