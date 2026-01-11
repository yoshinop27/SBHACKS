import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { createVideo, processVideoLink } from '../../lib/videos'
import type { TwelveLabsResponse } from '../../types/video'

type Props = {
  onSuccess?: () => void
}

export function VideoUploadForm({ onSuccess }: Props) {
  const { user } = useAuth()
  const [videoLink, setVideoLink] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to upload videos.')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      // Step 1: Call Edge Function to process video link with 12 Labs
      const response = await processVideoLink(videoLink.trim())

      // Step 2: Save to Videos table with response data
      const responseData: TwelveLabsResponse = {
        text: response.text,
        questions: response.questions,
      }

      await createVideo(user.id, {
        video_link: videoLink.trim(),
        response_data: responseData,
      })

      // Reset form and call success callback
      setVideoLink('')
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process video link.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
      <label style={{ display: 'grid', gap: 6 }}>
        <span>Video Link</span>
        <input
          type="url"
          autoComplete="off"
          required
          value={videoLink}
          onChange={(e) => setVideoLink(e.target.value)}
          placeholder="https://..."
          disabled={submitting}
        />
      </label>

      {error ? (
        <div role="alert" style={{ color: 'crimson' }}>
          {error}
        </div>
      ) : null}

      <button type="submit" disabled={submitting || !videoLink.trim()}>
        {submitting ? 'Processing video…' : 'Process Video'}
      </button>
    </form>
  )
}

