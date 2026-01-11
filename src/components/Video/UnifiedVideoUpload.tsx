import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import type { BackendAPIResponse } from '../../types/video'
import './UnifiedVideoUpload.css'

type Props = {
  onUploadSuccess: (data: BackendAPIResponse & { title?: string }) => void
  onLoading: (isLoading: boolean) => void
}

export function UnifiedVideoUpload({ onUploadSuccess, onLoading }: Props) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!user) {
      setError('You must be logged in to upload videos.')
      return
    }
    if (!mountedRef.current) return
    
    setError(null)
    onLoading(true)

    try {
      let apiResponse: BackendAPIResponse & { title?: string }

      if (activeTab === 'file') {
        if (!file) {
          setError('Please select a file')
          onLoading(false)
          return
        }

        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('http://127.0.0.1:8000/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`File upload failed: ${response.status} ${errorText}`)
        }
        
        apiResponse = await response.json()
      } else {
        if (!url.trim()) {
          setError('Please paste a video URL')
          onLoading(false)
          return
        }

        const payload = new FormData()
        payload.append('url', url.trim())

        const response = await fetch('http://127.0.0.1:8000/upload-url', {
          method: 'POST',
          body: payload,
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`URL upload failed: ${response.status} ${errorText}`)
        }

        apiResponse = await response.json()
      }
      
      if (!mountedRef.current) return
      onUploadSuccess(apiResponse)

      if (mountedRef.current) {
        setFile(null)
        setUrl('')
      }
    } catch (err) {
      console.error('Upload error:', err)
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to upload video.')
      }
    } finally {
      if (mountedRef.current) {
        onLoading(false)
      }
    }
  }

  return (
    <div className="video-uploader-container">
      <div className="tabs">
        <button
          className={activeTab === 'file' ? 'active' : ''}
          onClick={() => setActiveTab('file')}
        >
          File Upload
        </button>
        <button
          className={activeTab === 'url' ? 'active' : ''}
          onClick={() => setActiveTab('url')}
        >
          URL Upload
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

