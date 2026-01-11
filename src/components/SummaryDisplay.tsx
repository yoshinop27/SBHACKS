import React, { useState } from 'react';
import './SummaryDisplay.css';

interface SummaryDisplayProps {
    summary: string;
    title?: string;
    topics?: string[];
    hashtags?: string[];
}

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh-cn', name: 'Chinese (Simplified)' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'hi', name: 'Hindi' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'it', name: 'Italian' },
    // Add more as needed to reach 100+
];

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, title, topics, hashtags }) => {
    const [currentSummary, setCurrentSummary] = useState(summary);
    const [selectedLang, setSelectedLang] = useState('en');
    const [loading, setLoading] = useState(false);

    // Update local state if prop changes (new upload)
    React.useEffect(() => {
        setCurrentSummary(summary);
    }, [summary]);

    const handleTranslate = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: currentSummary,
                    target_language: selectedLang,
                }),
            });

            if (!response.ok) throw new Error('Translation failed');

            const data = await response.json();
            setCurrentSummary(data.translated_text);
        } catch (error) {
            console.error(error);
            alert("Translation failed. See console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="summary-container">
            {title && <h2>{title}</h2>}

            <div className="meta-tags">
                {topics && topics.map(t => <span key={t} className="tag topic">{t}</span>)}
                {hashtags && hashtags.map(h => <span key={h} className="tag hashtag">#{h}</span>)}
            </div>

            <div className="summary-box">
                <h3>Summary</h3>
                <p>{currentSummary}</p>
            </div>

            <div className="translation-controls">
                <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    disabled={loading}
                >
                    {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                </select>
                <button onClick={handleTranslate} disabled={loading}>
                    {loading ? 'Translating...' : 'Translate'}
                </button>
            </div>
        </div>
    );
};

export default SummaryDisplay;
