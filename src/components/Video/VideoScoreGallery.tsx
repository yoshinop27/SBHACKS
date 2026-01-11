import type { VideoWithScore } from '../../types/score'
import { VideoScoreCard } from './VideoScoreCard'

type Props = {
  videos: VideoWithScore[]
}

export function VideoScoreGallery({ videos }: Props) {
  if (videos.length === 0) {
    return <p style={{ opacity: 0.8 }}>No videos with scores yet.</p>
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 12,
        alignItems: 'start',
      }}
    >
      {videos.map((video, index) => (
        <VideoScoreCard key={`${video.url}-${video.Date || index}-${index}`} video={video} index={index} />
      ))}
    </div>
  )
}

