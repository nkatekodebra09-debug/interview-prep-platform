import { useState } from 'react';

const QuestionPage = () => {
  const [answer, setAnswer] = useState('');

  const handleReviewLater = () => {
    console.log('Marked for review later:', answer);
  };

  const handleSubmit = () => {
    if (!answer.trim()) {
      alert('Please type an answer before submitting.');
      return;
    }
    console.log('Submitted answer:', answer);
  };

  return (
    <div className="container">
      <div className="question-container">
        <div className="card">
          <span className="category-tag">Behavioral • Role Specific</span>
          <div style={{ marginBottom: '1rem' }}>
            <span className="difficulty-badge diff-medium">Medium</span>
          </div>

          <h2>"Tell me about a time you failed. How did you handle it?"</h2>

          <label htmlFor="answer" style={{ display: 'none' }}>
            Your Answer
          </label>
          <textarea
            id="answer"
            className="text-area"
            rows="5"
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          ></textarea>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
            }}
          >
            <button className="btn btn-outline" onClick={handleReviewLater}>
              Review Later
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Submit Answer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;
