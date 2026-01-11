import { supabase } from './supabase'
import type { Project, ProjectInsert, ProjectUpdate } from '../types/project'

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    // Convert Supabase error to Error object with detailed message
    const errorMsg = error.message || error.code || 'Unknown database error'
    throw new Error(`Database error: ${errorMsg}${error.details ? ` (${error.details})` : ''}`)
  }
  return (data ?? []) as Project[]
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return (data ?? null) as Project | null
}

export async function createProject(userId: string, project: ProjectInsert): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      title: project.title,
      description: project.description ?? null,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as Project
}

export async function updateProject(id: string, updates: ProjectUpdate): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...(updates.title !== undefined ? { title: updates.title } : {}),
      ...(updates.description !== undefined ? { description: updates.description } : {}),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data as Project
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}


