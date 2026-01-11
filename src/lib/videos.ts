import { supabase } from './supabase'
import type { Video, VideoInsert } from '../types/video'
import type { VideoWithScore } from '../types/score'

export async function fetchVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Video[]
}

/**
 * Fetches videos with their scores using a LEFT JOIN.
 * Equivalent SQL: SELECT video_link, created_at, score, feedback 
 * FROM videos LEFT JOIN scores ON videos.id = scores.video_id
 * WHERE videos.user_id = userId
 */
export async function fetchVideosWithScores(userId: string): Promise<VideoWithScore[]> {
  // Supabase uses nested select syntax for joins
  // This creates a LEFT JOIN when the foreign key relationship exists
  const { data, error } = await supabase
    .from('videos')
    .select(`
      video_link,
      created_at,
      scores!left (
        score,
        feedback
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  
  // Transform the nested structure to flat VideoWithScore type
  // If a video has multiple scores, we'll get multiple rows (one per score)
  // If a video has no scores, scores will be an empty array
  const result: VideoWithScore[] = []
  
  for (const row of data ?? []) {
    const scores = row.scores as Array<{ score: number; feedback: string | null }> | null
    
    if (!scores || scores.length === 0) {
      // Video with no scores - LEFT JOIN returns null
      result.push({
        video_link: row.video_link,
        created_at: row.created_at,
        score: null,
        feedback: null,
      })
    } else {
      // Video with scores - create one row per score
      for (const scoreRow of scores) {
        result.push({
          video_link: row.video_link,
          created_at: row.created_at,
          score: scoreRow.score,
          feedback: scoreRow.feedback,
        })
      }
    }
  }
  
  return result
}

export async function fetchVideoById(id: number): Promise<Video | null> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return (data ?? null) as Video | null
}

export async function createVideo(userId: string, video: VideoInsert): Promise<Video> {
  const { data, error } = await supabase
    .from('videos')
    .insert({
      user_id: userId,
      video_link: video.video_link,
      response_data: video.response_data ?? null,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as Video
}

export async function processVideoLink(videoLink: string): Promise<{ text: string; questions: string[] }> {
  const { data, error } = await supabase.functions.invoke('process-video', {
    body: { video_link: videoLink },
  })

  if (error) throw error
  return data as { text: string; questions: string[] }
}

