import { supabase } from './supabase'

export interface FeedbackData {
  strengths: string[]
  areas_to_improve: string[]
  tips: string[]
  encouragement: string
}

export interface QuizFeedbackRow {
  id?: string
  user_id?: string
  feedback: FeedbackData
  created_at?: string
}

export async function saveFeedback(feedback: FeedbackData): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  
  const userId = user?.id || 'anonymous'

  const { error } = await supabase
    .from('quiz_feedback')
    .insert({
      user_id: userId,
      feedback: feedback,
    })

  if (error) {
    console.error('Error saving feedback:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function fetchAllFeedback(): Promise<QuizFeedbackRow[]> {
  const { data: { user } } = await supabase.auth.getUser()
  
  const userId = user?.id || 'anonymous'

  const { data, error } = await supabase
    .from('quiz_feedback')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching feedback:', error)
    return []
  }

  return data || []
}
