import { VideoUploadForm } from '../components/Video/VideoUploadForm'

export default function VideoUploadPage() {
  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: 16 }}>
      <h1>Upload Video</h1>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        Enter a video link to process it with 12 Labs and save it to your videos.
      </p>
      <VideoUploadForm />
    </main>
  )
}

