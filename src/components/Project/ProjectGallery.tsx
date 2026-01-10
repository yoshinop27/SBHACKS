import type { Project } from '../../types/project'
import { ProjectCard } from './ProjectCard'

type Props = {
  projects: Project[]
  renderActions?: (p: Project) => React.ReactNode
}

export function ProjectGallery({ projects, renderActions }: Props) {
  if (projects.length === 0) {
    return <p style={{ opacity: 0.8 }}>No projects yet.</p>
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 12,
        alignItems: 'start',
      }}
    >
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} actions={renderActions?.(p)} />
      ))}
    </div>
  )
}


