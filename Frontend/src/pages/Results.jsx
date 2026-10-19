import { useNavigate } from 'react-router-dom';

const ScoreCircle = ({ score }) => <div className="score-circle">{score}%</div>;

const FeedbackBox = ({ feedback }) => (
  <div className="feedback-box" style={{ textAlign: 'left' }}>
    <strong>Instructor Feedback:</strong>
    <p>{feedback}</p>
  </div>
);

const ResultsPage = ({ score = 85, feedback }) => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/attempt/new');
  };

  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <ScoreCircle score={score} />
        <h2>{score >= 80 ? 'Great Performance!' : 'Keep Practicing!'}</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          {score >= 80
            ? 'You have a strong grasp of situational questions.'
            : 'Review your answers and try again to improve.'}
        </p>

        <FeedbackBox
          feedback={
            feedback ||
            'Your answer was structured well using the STAR method, but try to quantify your results more (e.g., "increased efficiency by 20%").'
          }
        />

        <button
          className="btn btn-primary"
          style={{ marginTop: '2rem', width: '100%' }}
          onClick={handleRetry}
        >
          Retry Quiz
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
