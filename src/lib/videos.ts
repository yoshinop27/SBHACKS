import { supabase } from './supabase'
import type { VideoInsert } from '../types/video'
import type { VideoWithScore } from '../types/score'

export async function fetchVideosWithScores(): Promise<VideoWithScore[]> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    throw new Error(`Failed to get session: ${sessionError.message}`)
  }
  
  const userId = sessionData.session?.user?.id
  if (!userId) {
    throw new Error('No authenticated user session found')
  }

  const { data, error } = await supabase
    .from('Scores')
    .select(`
      Score,
      Feedback,
      Date,
      Videos!inner (
        url
      )
    `)
    .eq('UserId', userId)
    .order('Date', { ascending: false })

  if (error) throw error
  
  const result: VideoWithScore[] = []
  for (const row of data ?? []) {
    const video = (row as any).Videos as { url: string } | null
    if (video?.url) {
      result.push({
        url: video.url,
        Score: row.Score,
        Feedback: row.Feedback,
        Date: row.Date,
      })
    }
  }
  
  return result
}

export async function createVideo(video: VideoInsert): Promise<void> {
  const { error } = await supabase
    .from('Videos')
    .insert({
      url: video.video_link,
      KeyPoints: video.response_data ?? null,
    })

  if (error) throw error
}

export async function processVideoLink(videoLink: string): Promise<{ text: string; questions: string[] }> {
  const { data, error } = await supabase.functions.invoke('process-video', {
    body: { video_link: videoLink },
  })

  if (error) throw error
  return data as { text: string; questions: string[] }
}
