import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Navbar } from '../components/Layout/Navbar'
import { fetchAllFeedback, type QuizFeedbackRow } from '../lib/feedback'
import './LearningGoalsPage.css'

interface LearningPlan {
  top_strengths: string[]
  top_areas_to_improve: string[]
  learning_recommendations: string[]
  next_steps: string
  overall_assessment: string
}

export default function LearningGoalsPage() {
  const { user } = useAuth()
  const [feedbackHistory, setFeedbackHistory] = useState<QuizFeedbackRow[]>([])
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [planLoading, setPlanLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadFeedback() {
      try {
        const feedback = await fetchAllFeedback()
        setFeedbackHistory(feedback)
      } catch (err) {
        console.error('Error loading feedback:', err)
        setError('Failed to load your learning history')
      } finally {
        setLoading(false)
      }
    }

    loadFeedback()
  }, [user])

  const generatePlan = async () => {
    if (feedbackHistory.length === 0) return

    setPlanLoading(true)
    setError(null)

    try {
      // Extract feedback data from each row
      const feedbackList = feedbackHistory.map(row => row.feedback)
      
      const response = await fetch('http://127.0.0.1:8000/learning-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback_history: feedbackList,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate learning plan')
      }

      const plan = await response.json()
      setLearningPlan(plan)
    } catch (err) {
      console.error('Error generating plan:', err)
      setError('Failed to generate learning plan. Please try again.')
    } finally {
      setPlanLoading(false)
    }
  }

  // Auto-generate plan when feedback loads
  useEffect(() => {
    if (feedbackHistory.length > 0 && !learningPlan && !planLoading) {
      generatePlan()
    }
  }, [feedbackHistory])

  const totalQuizzes = feedbackHistory.length

  return (
    <div>
      <Navbar />
      <main className="learning-goals-page">
        <div className="learning-goals-header">
          <h1>Your Learning Goals</h1>
          <p>Track your progress and get personalized recommendations</p>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading your learning history...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={generatePlan}>Try Again</button>
          </div>
        )}

        {!loading && feedbackHistory.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h2>No Learning History Yet</h2>
            <p>Complete some quizzes to start building your personalized learning plan!</p>
            <a href="/dashboard" className="cta-button">Go to Dashboard</a>
          </div>
        )}

        {!loading && feedbackHistory.length > 0 && (
          <>
            {/* Stats Overview */}
            <div className="stats-overview">
              <div className="stat-card highlight">
                <span className="stat-value">{totalQuizzes}</span>
                <span className="stat-label">Quizzes Completed</span>
              </div>
            </div>

            {planLoading && (
              <div className="plan-loading">
                <div className="spinner" />
                <p>Analyzing your progress with AI...</p>
              </div>
            )}

            {learningPlan && !planLoading && (
              <div className="learning-plan">
                {/* Overall Assessment */}
                <div className="assessment-banner">
                  <p>{learningPlan.overall_assessment}</p>
                </div>

                {/* Strengths & Areas to Improve */}
                <div className="plan-grid">
                  <div className="plan-card strengths">
                    <h3>💪 Top Strengths</h3>
                    <ul>
                      {learningPlan.top_strengths.map((strength, i) => (
                        <li key={i}>{strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="plan-card improvements">
                    <h3>🎯 Areas to Focus On</h3>
                    <ul>
                      {learningPlan.top_areas_to_improve.map((area, i) => (
                        <li key={i}>{area}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="recommendations-section">
                  <h3>📋 Personalized Recommendations</h3>
                  <div className="recommendations-list">
                    {learningPlan.learning_recommendations.map((rec, i) => (
                      <div key={i} className="recommendation-item">
                        <span className="rec-number">{i + 1}</span>
                        <p>{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="next-steps-section">
                  <h3>🚀 Next Steps</h3>
                  <p>{learningPlan.next_steps}</p>
                </div>

                <button className="refresh-btn" onClick={generatePlan} disabled={planLoading}>
                  {planLoading ? 'Updating...' : 'Refresh Learning Plan'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
