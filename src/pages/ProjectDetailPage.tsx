import { Dialog } from '@reach/dialog'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@reach/tabs'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Project } from '../types/project'
import { deleteProject, fetchProjectById, updateProject } from '../lib/projects'
import { ProjectForm } from '../components/Project/ProjectForm'
import { DeleteProjectDialog } from '../components/Project/DeleteProjectDialog'
import { Navbar } from '../components/Layout/Navbar'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [project, setProject] = useState<Project | null>(null)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!id) {
        setError('Missing project id.')
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const data = await fetchProjectById(id)
        if (!mounted) return
        setProject(data)
        if (!data) setError('Project not found.')
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : 'Failed to load project.')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [id])

  const formInitial = useMemo(() => {
    if (!project) return undefined
    return { title: project.title, description: project.description ?? '' }
  }, [project])

  async function onSave(value: { title: string; description?: string | null }) {
    if (!project) throw new Error('Project not loaded.')
    const updated = await updateProject(project.id, value)
    setProject(updated)
    setIsEditOpen(false)
  }

  async function onConfirmDelete() {
    if (!project) return
    const projectId = project.id
    setIsDeleteOpen(false)
    await deleteProject(projectId)
    navigate('/', { replace: true })
  }

  return (
    <div>
      <Navbar />
      <main style={{ padding: 16, maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <div>
            <p style={{ marginTop: 0, marginBottom: 8 }}>
              <Link to="/">← Back to projects</Link>
            </p>
            <h1 style={{ margin: 0 }}>{project?.title ?? 'Project'}</h1>
            {project?.description ? <p style={{ opacity: 0.85 }}>{project.description}</p> : null}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setIsEditOpen(true)} disabled={!project}>
              Edit
            </button>
            <button onClick={() => setIsDeleteOpen(true)} disabled={!project}>
              Delete
            </button>
          </div>
        </div>

      {loading ? <p>Loading…</p> : null}
      {error ? (
        <div role="alert" style={{ color: 'crimson' }}>
          {error}
        </div>
      ) : null}

      {!loading && project ? (
        <Tabs>
          <TabList>
            <Tab>Chatbot</Tab>
            <Tab>Roadmap</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div style={{ padding: 12 }}>
                <h2 style={{ marginTop: 0 }}>Chatbot</h2>
                <p style={{ opacity: 0.85 }}>Placeholder UI — chatbot coming soon.</p>
              </div>
            </TabPanel>
            <TabPanel>
              <div style={{ padding: 12 }}>
                <h2 style={{ marginTop: 0 }}>Roadmap</h2>
                <p style={{ opacity: 0.85 }}>
                  Placeholder UI — roadmap/whiteboard (Google Draw style) coming soon.
                </p>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : null}

        <Dialog isOpen={isEditOpen} onDismiss={() => setIsEditOpen(false)} aria-label="Edit project">
          <div style={{ display: 'grid', gap: 12 }}>
            <h2 style={{ margin: 0 }}>Edit project</h2>
            <ProjectForm
              submitLabel="Save"
              initialValue={formInitial}
              onCancel={() => setIsEditOpen(false)}
              onSubmit={onSave}
            />
          </div>
        </Dialog>

        <DeleteProjectDialog
          isOpen={isDeleteOpen}
          title={project?.title ?? 'this project'}
          onCancel={() => setIsDeleteOpen(false)}
          onConfirm={onConfirmDelete}
        />
      </main>
    </div>
  )
}


