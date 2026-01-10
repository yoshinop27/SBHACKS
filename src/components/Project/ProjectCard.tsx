import { Link } from 'react-router-dom'
import type { Project } from '../../types/project'

type Props = {
  project: Project
  actions?: React.ReactNode
}

export function ProjectCard({ project, actions }: Props) {
  return (
    <div
      style={{
        border: '1px solid rgba(0,0,0,0.15)',
        borderRadius: 12,
        padding: 12,
        display: 'grid',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <Link to={`/project/${project.id}`} style={{ fontWeight: 700 }}>
            {project.title}
          </Link>
          {project.description ? (
            <div style={{ opacity: 0.8, marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {project.description}
            </div>
          ) : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
    </div>
  )
}


