import React, { useState } from 'react';
import './QuizDisplay.css';
import { saveFeedback } from '../lib/feedback';

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}

interface Feedback {
    strengths: string[];
    areas_to_improve: string[];
    tips: string[];
    encouragement: string;
}

interface QuizDisplayProps {
    quiz: QuizQuestion[];
    videoId: string;
}

const QuizDisplay: React.FC<QuizDisplayProps> = ({ quiz, videoId }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
        if (submitted) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }));
    };

    const handleSubmit = async () => {
        // Calculate score
        let correctCount = 0;
        const correctAnswers: { question: string; userAnswer: string; correctAnswer: string }[] = [];
        const wrongAnswers: { question: string; userAnswer: string; correctAnswer: string }[] = [];

        quiz.forEach((q, index) => {
            const userAnswerIndex = selectedAnswers[index];
            const isCorrect = userAnswerIndex === q.correctAnswer;
            
            const answerData = {
                question: q.question,
                userAnswer: q.options[userAnswerIndex],
                correctAnswer: q.options[q.correctAnswer]
            };

            if (isCorrect) {
                correctCount++;
                correctAnswers.push(answerData);
            } else {
                wrongAnswers.push(answerData);
            }
        });

        setScore(correctCount);
        setSubmitted(true);

        // Fetch feedback from backend
        setFeedbackLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    video_id: videoId,
                    correct_answers: correctAnswers,
                    wrong_answers: wrongAnswers,
                }),
            });

            if (response.ok) {
                const feedbackData = await response.json();
                setFeedback(feedbackData);
                
                // Save feedback to Supabase
                const saveResult = await saveFeedback(feedbackData);
                
                if (!saveResult.success) {
                    console.warn('Failed to save feedback to database:', saveResult.error);
                }
            } else {
                console.error('Failed to fetch feedback');
            }
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setFeedbackLoading(false);
        }
    };

    const handleRetry = () => {
        setSelectedAnswers({});
        setSubmitted(false);
        setScore(0);
        setFeedback(null);
    };

    const allAnswered = Object.keys(selectedAnswers).length === quiz.length;

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <h3>Language Quiz</h3>
                {submitted && (
                    <div className={`quiz-score ${score === quiz.length ? 'perfect' : score >= quiz.length / 2 ? 'good' : 'needs-work'}`}>
                        Score: {score}/{quiz.length}
                    </div>
                )}
            </div>

            <div className="quiz-questions">
                {quiz.map((q, questionIndex) => (
                    <div key={questionIndex} className="quiz-question">
                        <p className="question-text">
                            <span className="question-number">{questionIndex + 1}.</span>
                            {q.question}
                        </p>
                        <div className="options-list">
                            {q.options.map((option, optionIndex) => {
                                const isSelected = selectedAnswers[questionIndex] === optionIndex;
                                const isCorrect = q.correctAnswer === optionIndex;
                                const showResult = submitted;
                                
                                let optionClass = 'option';
                                if (isSelected) optionClass += ' selected';
                                if (showResult && isCorrect) optionClass += ' correct';
                                if (showResult && isSelected && !isCorrect) optionClass += ' incorrect';
                                
                                return (
                                    <button
                                        key={optionIndex}
                                        className={optionClass}
                                        onClick={() => handleOptionSelect(questionIndex, optionIndex)}
                                        disabled={submitted}
                                    >
                                        <span className="option-letter">
                                            {String.fromCharCode(65 + optionIndex)}
                                        </span>
                                        <span className="option-text">{option}</span>
                                        {showResult && isCorrect && <span className="result-icon">✓</span>}
                                        {showResult && isSelected && !isCorrect && <span className="result-icon">✗</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="quiz-actions">
                {!submitted ? (
                    <button 
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={!allAnswered}
                    >
                        {allAnswered ? 'Submit Quiz' : `Answer all questions (${Object.keys(selectedAnswers).length}/${quiz.length})`}
                    </button>
                ) : (
                    <button className="retry-btn" onClick={handleRetry}>
                        Try Again
                    </button>
                )}
            </div>

            {/* Feedback Section */}
            {submitted && (
                <div className="feedback-section">
                    {feedbackLoading ? (
                        <div className="feedback-loading">
                            <p>Analyzing your answers...</p>
                        </div>
                    ) : feedback ? (
                        <>
                            <div className="feedback-encouragement">
                                <p>{feedback.encouragement}</p>
                            </div>

                            <div className="feedback-grid">
                                <div className="feedback-card strengths">
                                    <h4>💪 Your Strengths</h4>
                                    <ul>
                                        {feedback.strengths.map((strength, i) => (
                                            <li key={i}>{strength}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="feedback-card improvements">
                                    <h4>📚 Areas to Improve</h4>
                                    <ul>
                                        {feedback.areas_to_improve.map((area, i) => (
                                            <li key={i}>{area}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="feedback-tips">
                                <h4>💡 Tips for Improvement</h4>
                                <ul>
                                    {feedback.tips.map((tip, i) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default QuizDisplay;
