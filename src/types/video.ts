// TypeScript types for Video entity and 12 Labs API response

export type Video = {
  id: number
  user_id: string
  video_link: string
  response_data: TwelveLabsResponse | null
  created_at: string
}

export type VideoInsert = {
  video_link: string
  response_data?: TwelveLabsResponse | null
}

export type TwelveLabsResponse = {
  text: string
  questions: string[]
  // Add other fields as needed based on actual 12 Labs API response
}

