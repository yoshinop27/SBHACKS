// TypeScript types for Score entity

export type Score = {
  id: string
  user_id: string
  video_id: number
  score: number
  feedback: string | null
  created_at: string
}

export type ScoreInsert = {
  video_id: number
  score: number
  feedback?: string | null
}

// Result type for videos with joined scores
// Represents: SELECT video_link, created_at, score, feedback FROM videos LEFT JOIN scores
export type VideoWithScore = {
  video_link: string  // url
  created_at: string  // date
  score: number | null  // from scores table (null if no score)
  feedback: string | null  // from scores table (null if no score)
}

