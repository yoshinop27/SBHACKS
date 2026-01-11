import type { VideoWithScore } from '../../types/score'

type Props = {
  video: VideoWithScore
  index: number
}

export function VideoScoreCard({ video, index }: Props) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div
      style={{
        border: '1px solid rgba(0,0,0,0.15)',
        borderRadius: 12,
        padding: 12,
        display: 'grid',
        gap: 8,
      }}
    >
      <div style={{ display: 'grid', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Video {index + 1}</div>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#646cff',
                textDecoration: 'none',
                fontSize: '0.9em',
                wordBreak: 'break-all',
                display: 'block',
                marginBottom: 8,
              }}
            >
              {video.url}
            </a>
            {video.Date ? (
              <div style={{ opacity: 0.7, fontSize: '0.85em' }}>Date: {formatDate(video.Date)}</div>
            ) : null}
          </div>
        </div>

        {video.Score !== null ? (
          <div
            style={{
              padding: 8,
              backgroundColor: 'rgba(0,0,0,0.04)',
              borderRadius: 6,
              marginTop: 4,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Score: {video.Score}</div>
            {video.Feedback ? (
              <div style={{ opacity: 0.85, fontSize: '0.9em' }}>{video.Feedback}</div>
            ) : null}
          </div>
        ) : (
          <div style={{ opacity: 0.6, fontSize: '0.9em', fontStyle: 'italic' }}>No score yet</div>
        )}
      </div>
    </div>
  )
}

