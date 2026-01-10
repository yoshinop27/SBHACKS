import { useEffect, useState } from 'react'
import type { ProjectInsert } from '../../types/project'

type Props = {
  submitLabel: string
  initialValue?: ProjectInsert
  onCancel: () => void
  onSubmit: (value: ProjectInsert) => Promise<void> | void
}

export function ProjectForm({ submitLabel, initialValue, onCancel, onSubmit }: Props) {
  const [title, setTitle] = useState(initialValue?.title ?? '')
  const [description, setDescription] = useState(initialValue?.description ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTitle(initialValue?.title ?? '')
    setDescription(initialValue?.description ?? '')
  }, [initialValue?.title, initialValue?.description])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ title: title.trim(), description: description.trim() || null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      <label style={{ display: 'grid', gap: 6 }}>
        <span>Title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>

      <label style={{ display: 'grid', gap: 6 }}>
        <span>Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Optional"
        />
      </label>

      {error ? (
        <div role="alert" style={{ color: 'crimson' }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}


