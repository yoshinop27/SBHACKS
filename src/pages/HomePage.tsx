import { Dialog } from '@reach/dialog'
import { useMemo, useState, useEffect } from 'react'
import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import '@reach/menu-button/styles.css'
import { useAuth } from '../contexts/AuthContext'
import { deleteProject, updateProject, fetchProjects } from '../lib/projects'
import type { Project } from '../types/project'
import { DeleteProjectDialog } from '../components/Project/DeleteProjectDialog'
import { ProjectForm } from '../components/Project/ProjectForm'
import { ProjectGallery } from '../components/Project/ProjectGallery'
import { Navbar } from '../components/Layout/Navbar'
import { VideoUploadForm } from '../components/Video/VideoUploadForm'
import VideoUploader from '../components/VideoUploader'
import SummaryDisplay from '../components/SummaryDisplay'

type EditState =
  | { mode: 'create' }
  | { mode: 'edit'; project: Project }
  | { mode: null }

export default function HomePage() {
  const { user } = useAuth()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editState, setEditState] = useState<EditState>({ mode: null })
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false)

  // TwelveLabs State
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isEditDialogOpen = editState.mode !== null
  // We handle dialogs separately now
  const isDialogOpen = editState.mode !== null
  const dialogTitle = editState.mode === 'create' ? 'New project' : editState.mode === 'edit' ? 'Edit project' : ''

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        if (user) {
          const data = await fetchProjects()
          if (!mounted) return
          setProjects(data)
        } else {
          // Not logged in, valid state for demo
          setProjects([])
        }
      } catch (err) {
        if (!mounted) return
        console.error("Project load error:", err);
        // Only show error if we expected to load them
        if (user) setError(err instanceof Error ? err.message : 'Failed to load projects.')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [user])

  const canCreate = Boolean(user?.id)

  const formInitialValue = useMemo(() => {
    if (editState.mode === 'edit') {
      return { title: editState.project.title, description: editState.project.description ?? '' }
    }
    return undefined
  }, [editState])

  async function handleCreateOrUpdate(value: { title: string; description?: string | null }) {
    // Re-implementing create logic that might have been lost or checking if handled locally
    // The partner code removed create logic from handleUpdate, but we might need it?
    // For now, I'll stick to update only as per partner's change, or restore if needed.
    // Partner code has `handleUpdate`. My code had `handleCreateOrUpdate`.
    // I'll keep `handleUpdate` for edit, and rely on `VideoUploadForm` for creation in their flow?
    // Actually, let's restore the generic handler to be safe for existing calls.
    if (!user?.id) throw new Error('Not signed in.')

    if (editState.mode === 'edit') {
      const updated = await updateProject(editState.project.id, value)
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setEditState({ mode: null })
    }
    // If create mode existed
    // if (editState.mode === 'create') { ... }
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

        {/* TwelveLabs Integrations - My Work */}
        <section style={{ marginBottom: '4rem' }}>
          <h1>Video Summarizer</h1>
          <p style={{ opacity: 0.8, marginBottom: '2rem' }}>Upload a video or provide a YouTube link to generate a summary and translation.</p>

          <VideoUploader
            onUploadSuccess={setSummaryData}
            onLoading={setIsProcessing}
          />

          {isProcessing && (
            <div style={{ textAlign: 'center', margin: '20px 0', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <p>Processing video... This may take a minute.</p>
            </div>
          )}

          {summaryData && (
            <SummaryDisplay
              summary={summaryData.summary}
              title={summaryData.title}
              topics={summaryData.topics}
              hashtags={summaryData.hashtags}
            />
          )}

          <hr style={{ opacity: 0.1, margin: '4rem 0' }} />
        </section>


        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <div>
            <h1 style={{ marginBottom: 4 }}>Your Projects</h1>
            <p style={{ marginTop: 0, opacity: 0.8 }}>A gallery of your projects (private to your account).</p>
          </div>
          {/* Partner's Upload Button */}
          <button onClick={() => setIsVideoUploadOpen(true)} disabled={!canCreate}>
            Upload Video (Project)
          </button>
        </div>

        {loading ? <p>Loading projects…</p> : null}
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

        {/* Partner's Dialog for Video Upload */}
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
                // Refresh projects if needed
              }}
            />
          </div>
        </Dialog>

        {/* Edit Dialog */}
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
