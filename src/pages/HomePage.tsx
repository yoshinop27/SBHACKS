import { Dialog } from '@reach/dialog'
import { useMemo, useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import '@reach/menu-button/styles.css'
import { useAuth } from '../contexts/AuthContext'
import { deleteProject, updateProject } from '../lib/projects'
import type { Project } from '../types/project'
import { DeleteProjectDialog } from '../components/Project/DeleteProjectDialog'
import { ProjectForm } from '../components/Project/ProjectForm'
import { ProjectGallery } from '../components/Project/ProjectGallery'
import { Navbar } from '../components/Layout/Navbar'
import { VideoUploadForm } from '../components/Video/VideoUploadForm'

type EditState =
  | { mode: 'edit'; project: Project }
  | { mode: null }

export default function HomePage() {
  const { user } = useAuth()
  
  // Dummy projects for now - will be replaced with actual fetching logic later
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      user_id: user?.id || '',
      title: 'Sample Project 1',
      description: 'This is a sample project description.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: user?.id || '',
      title: 'Sample Project 2',
      description: 'Another sample project for demonstration.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ])

  const [editState, setEditState] = useState<EditState>({ mode: null })
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false)

  const isEditDialogOpen = editState.mode !== null

  const canCreate = Boolean(user?.id)

  const formInitialValue = useMemo(() => {
    if (editState.mode === 'edit') {
      return { title: editState.project.title, description: editState.project.description ?? '' }
    }
    return undefined
  }, [editState])

  async function handleUpdate(value: { title: string; description?: string | null }) {
    if (!user?.id) throw new Error('Not signed in.')

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
          <button onClick={() => setIsVideoUploadOpen(true)} disabled={!canCreate}>
            Upload Video
          </button>
        </div>

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

        <Dialog
          isOpen={isVideoUploadOpen}
          onDismiss={() => setIsVideoUploadOpen(false)}
          aria-label="Upload Video"
        >
          <div style={{ display: 'grid', gap: 12 }}>
            <h2 style={{ margin: 0 }}>Upload Video</h2>
            <VideoUploadForm
              onSuccess={() => {
                setIsVideoUploadOpen(false)
                // Optionally refresh projects list or show success message
              }}
            />
          </div>
        </Dialog>

        <Dialog
          isOpen={isEditDialogOpen}
          onDismiss={() => setEditState({ mode: null })}
          aria-label="Edit project"
        >
          <div style={{ display: 'grid', gap: 12 }}>
            <h2 style={{ margin: 0 }}>Edit project</h2>
            <ProjectForm
              submitLabel="Save"
              initialValue={formInitialValue}
              onCancel={() => setEditState({ mode: null })}
              onSubmit={handleUpdate}
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


