import React, { useState, useEffect } from 'react';
import { Timer, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { questions } from '../data/questions';

const MockInterview = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentQ = questions[currentIndex];
  const timerColor = timeLeft < 60 ? 'var(--hard)' : 'var(--medium)';

  const handleAnswerChange = (text) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: text }));
  };

  const handleSkip = () => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: '[Skipped]' }));
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handleSubmit = () => {
    alert(`Answer Submitted:\n${answers[currentIndex] || ''}`);
    // Later: send to backend for storage/feedback
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header with timer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <span
            className="badge"
            style={{
              background: 'var(--primary)',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
            }}
          >
            Question {currentIndex + 1}/{questions.length}
          </span>
        </div>
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
          }}
        >
          <Timer size={18} color={timerColor} />
          <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
            {formatTime(timeLeft)}
          </span>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="btn btn-outline"
            style={{ padding: '2px 8px', fontSize: '0.7rem' }}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      {/* Question card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <span
            className="badge"
            style={{
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.7rem',
            }}
          >
            {currentQ.category}
          </span>
          <span
            className={`badge badge-${currentQ.difficulty.toLowerCase()}`}
            style={{
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.7rem',
            }}
          >
            {currentQ.difficulty}
          </span>
        </div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>{currentQ.text}</h2>
        <textarea
          className="form-input"
          style={{
            height: '250px',
            resize: 'none',
            fontSize: '1.1rem',
            padding: '1.5rem',
          }}
          placeholder="Type your structured answer here..."
          value={answers[currentIndex] || ''}
          onChange={(e) => handleAnswerChange(e.target.value)}
        />
      </div>

      {/* STAR method tip */}
      <div
        className="star-tips"
        style={{
          background: 'var(--bg-main)',
          padding: '1.5rem',
          borderRadius: '12px',
          borderLeft: '4px solid var(--primary)',
          marginBottom: '2rem',
        }}
      >
        <h4 style={{ marginBottom: '0.5rem' }}>💡 STAR Method Tip</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <strong>S</strong>ituation → <strong>T</strong>ask → <strong>A</strong>ction →{' '}
          <strong>R</strong>esult
        </p>
      </div>

      {/* Navigation controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          className="btn btn-outline"
        >
          <ChevronLeft size={20} /> Previous
        </button>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={handleSkip}>
            Skip Question
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            <Send size={20} /> Submit Answer
          </button>
        </div>

        <button
          disabled={currentIndex === questions.length - 1}
          onClick={() => setCurrentIndex((prev) => prev + 1)}
          className="btn btn-outline"
        >
          Next <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default MockInterview;
