import React, { useState } from 'react';
import './VideoUploader.css';

interface VideoUploaderProps {
    onUploadSuccess: (data: any) => void;
    onLoading: (isLoading: boolean) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onUploadSuccess, onLoading }) => {
    const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
    const [file, setFile] = useState<File | null>(null);
    const [url, setUrl] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        setError(null);
        onLoading(true);
        try {
            const formData = new FormData();
            if (activeTab === 'file' && file) {
                formData.append('file', file);
                const response = await fetch('http://127.0.0.1:8000/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) throw new Error('File upload failed');
                const data = await response.json();
                onUploadSuccess(data);
            } else if (activeTab === 'url' && url) {
                const response = await fetch('http://127.0.0.1:8000/upload-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url }),
                });
                if (!response.ok) throw new Error('URL upload failed');
                const data = await response.json();
                onUploadSuccess(data);
            } else {
                setError("Please select a file or enter a URL");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            onLoading(false);
        }
    };

    return (
        <div className="video-uploader-container">
            <div className="tabs">
                <button
                    className={activeTab === 'file' ? 'active' : ''}
                    onClick={() => setActiveTab('file')}
                >
                    File Upload
                </button>
                <button
                    className={activeTab === 'url' ? 'active' : ''}
                    onClick={() => setActiveTab('url')}
                >
                    YouTube Link
                </button>
            </div>

            <div className="upload-content">
                {activeTab === 'file' ? (
                    <div className="file-input-wrapper">
                        <input type="file" onChange={handleFileChange} accept="video/*" />
                        {file && <p>Selected: {file.name}</p>}
                    </div>
                ) : (
                    <input
                        type="text"
                        placeholder="Paste YouTube URL here..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="url-input"
                    />
                )}

                <button onClick={handleUpload} className="upload-button" disabled={!file && !url}>
                    Upload Video
                </button>

                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default VideoUploader;
