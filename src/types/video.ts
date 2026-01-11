export type QuizQuestion = {
  question: string
  options: string[]
  correctAnswer: number
}

export type BackendAPIResponse = {
  summary: string
  quiz: QuizQuestion[]
  title: string
  topics: string[]
  hashtags: string[]
}
