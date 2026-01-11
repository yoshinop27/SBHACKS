export type QuizQuestion = {
  question: string
  options: string[]
  correctAnswer: number
}

export type BackendAPIResponse = {
  video_id: string
  quiz: QuizQuestion[]
  title: string
  topics: string[]
  hashtags: string[]
}
