export type Project = {
  id: string
  user_id: string
  title: string
  description: string | null
  created_at: string
  updated_at: string
}

export type ProjectInsert = {
  title: string
  description?: string | null
}

export type ProjectUpdate = {
  title?: string
  description?: string | null
}


