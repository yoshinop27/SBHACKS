import React, { useState } from 'react';
import './QuizDisplay.css';

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}

interface QuizDisplayProps {
    quiz: QuizQuestion[];
}

const QuizDisplay: React.FC<QuizDisplayProps> = ({ quiz }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
        if (submitted) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }));
    };

    const handleSubmit = () => {
        let correctCount = 0;
        quiz.forEach((q, index) => {
            if (selectedAnswers[index] === q.correctAnswer) {
                correctCount++;
            }
        });
        setScore(correctCount);
        setSubmitted(true);
    };

    const handleRetry = () => {
        setSelectedAnswers({});
        setSubmitted(false);
        setScore(0);
    };

    const allAnswered = Object.keys(selectedAnswers).length === quiz.length;

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <h3>Quiz</h3>
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
        </div>
    );
};

export default QuizDisplay;
