// TypeScript types for Video entity and 12 Labs API response

export type VideoInsert = {
  video_link: string
  response_data?: BackendAPIResponse | null
}

export type BackendAPIResponse = {
  summary: string
  title: string
  topics: string[]
  hashtags: string[]
}

// Legacy type for backward compatibility
export type TwelveLabsResponse = {
  text: string
  questions: string[]
}

