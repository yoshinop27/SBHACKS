import { Dialog } from '@reach/dialog'
import { useEffect, useMemo, useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import '@reach/menu-button/styles.css'
import { useAuth } from '../contexts/AuthContext'
import { createProject, deleteProject, fetchProjects, updateProject } from '../lib/projects'
import type { Project } from '../types/project'
import { DeleteProjectDialog } from '../components/Project/DeleteProjectDialog'
import { ProjectForm } from '../components/Project/ProjectForm'
import { ProjectGallery } from '../components/Project/ProjectGallery'
import { Navbar } from '../components/Layout/Navbar'

type EditState =
  | { mode: 'create' }
  | { mode: 'edit'; project: Project }
  | { mode: null }

export default function HomePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])

  const [editState, setEditState] = useState<EditState>({ mode: null })
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const isDialogOpen = editState.mode !== null
  const dialogTitle = editState.mode === 'create' ? 'New project' : editState.mode === 'edit' ? 'Edit project' : ''

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchProjects()
        if (!mounted) return
        setProjects(data)
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : 'Failed to load projects.')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const canCreate = Boolean(user?.id)

  const formInitialValue = useMemo(() => {
    if (editState.mode === 'edit') {
      return { title: editState.project.title, description: editState.project.description ?? '' }
    }
    return undefined
  }, [editState])

  async function handleCreateOrUpdate(value: { title: string; description?: string | null }) {
    if (!user?.id) throw new Error('Not signed in.')

    if (editState.mode === 'create') {
      const created = await createProject(user.id, value)
      setProjects((prev) => [created, ...prev])
      setEditState({ mode: null })
      return
    }

    if (editState.mode === 'edit') {
      const updated = await updateProject(editState.project.id, value)
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setEditState({ mode: null })
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    const target = deleteTarget
    setDeleteTarget(null)
    await deleteProject(target.id)
    setProjects((prev) => prev.filter((p) => p.id !== target.id))
  }

  return (
    <div>
      <Navbar />
      <main style={{ padding: 16, maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <div>
            <h1 style={{ marginBottom: 4 }}>Your Projects</h1>
            <p style={{ marginTop: 0, opacity: 0.8 }}>A gallery of your projects (private to your account).</p>
          </div>
          <button onClick={() => setEditState({ mode: 'create' })} disabled={!canCreate}>
            New project
          </button>
        </div>

      {loading ? <p>Loading…</p> : null}
      {error ? (
        <div role="alert" style={{ color: 'crimson' }}>
          {error}
        </div>
      ) : null}

      {!loading ? (
        <ProjectGallery
          projects={projects}
          renderActions={(p) => (
            <Menu>
              <MenuButton>
                Actions <span aria-hidden>▾</span>
              </MenuButton>
              <MenuList>
                <MenuItem onSelect={() => setEditState({ mode: 'edit', project: p })}>Edit</MenuItem>
                <MenuItem onSelect={() => setDeleteTarget(p)}>Delete</MenuItem>
              </MenuList>
            </Menu>
          )}
        />
      ) : null}

        <Dialog isOpen={isDialogOpen} onDismiss={() => setEditState({ mode: null })} aria-label={dialogTitle}>
          <div style={{ display: 'grid', gap: 12 }}>
            <h2 style={{ margin: 0 }}>{dialogTitle}</h2>
            <ProjectForm
              submitLabel={editState.mode === 'create' ? 'Create' : 'Save'}
              initialValue={formInitialValue}
              onCancel={() => setEditState({ mode: null })}
              onSubmit={handleCreateOrUpdate}
            />
          </div>
        </Dialog>

        <DeleteProjectDialog
          isOpen={Boolean(deleteTarget)}
          title={deleteTarget?.title ?? 'this project'}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      </main>
    </div>
  )
}


