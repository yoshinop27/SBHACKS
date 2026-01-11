import { supabase } from './supabase'
import type { Video, VideoInsert } from '../types/video'

export async function fetchVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Video[]
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

