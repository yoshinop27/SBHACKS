import { AlertDialog } from '@reach/alert-dialog'
// import '@reach/alert-dialog/styles.css'
import { useRef } from 'react'

type Props = {
  isOpen: boolean
  title: string
  onCancel: () => void
  onConfirm: () => Promise<void> | void
}

export function DeleteProjectDialog({ isOpen, title, onCancel, onConfirm }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  if (!isOpen) return null

  return (
    <AlertDialog leastDestructiveRef={cancelRef} onDismiss={onCancel}>
      <div style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Delete project?</h2>
        <p style={{ margin: 0, opacity: 0.85 }}>
          This will permanently delete <strong>{title}</strong>.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button ref={cancelRef} onClick={onCancel}>
            Cancel
          </button>
          <button onClick={() => void onConfirm()} style={{ background: 'crimson', color: 'white' }}>
            Delete
          </button>
        </div>
      </div>
    </AlertDialog>
  )
}


