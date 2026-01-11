import { supabase } from './supabase'
import type { VideoWithScore } from '../types/score'

export type RawVideo = {
  name: string
  url: string
  displayName: string
  language: string
}

function parseVideoFilename(filename: string): { displayName: string; language: string } {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '')
  // Split by last underscore to get name and language
  const lastUnderscore = nameWithoutExt.lastIndexOf('_')
  if (lastUnderscore > 0) {
    return {
      displayName: nameWithoutExt.slice(0, lastUnderscore),
      language: nameWithoutExt.slice(lastUnderscore + 1),
    }
  }
  return { displayName: nameWithoutExt, language: 'Unknown' }
}

export async function fetchRawVideos(): Promise<RawVideo[]> {
  const { data: files, error } = await supabase.storage.from('rawVideos').list()
  if (error) throw error

  const results: RawVideo[] = []
  for (const file of files ?? []) {
    if (file.id === null) continue
    const { data } = await supabase.storage.from('rawVideos').createSignedUrl(file.name, 3600)
    if (data?.signedUrl) {
      const { displayName, language } = parseVideoFilename(file.name)
      results.push({ name: file.name, url: data.signedUrl, displayName, language })
    }
  }
  return results
}

export async function fetchVideosWithScores(): Promise<VideoWithScore[]> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw new Error(`Failed to get session: ${sessionError.message}`)
  
  const userId = sessionData.session?.user?.id
  if (!userId) throw new Error('No authenticated user session found')

  const { data, error } = await supabase
    .from('Scores')
    .select(`Score, Feedback, Date, Videos!inner (url)`)
    .eq('UserId', userId)
    .order('Date', { ascending: false })

  if (error) throw error
  
  return (data ?? [])
    .map(row => {
      const video = (row as any).Videos as { url: string } | null
      return video?.url ? { url: video.url, Score: row.Score, Feedback: row.Feedback, Date: row.Date } : null
    })
    .filter((v): v is VideoWithScore => v !== null)
}
