import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AttemptReview() {
  const { id } = useParams();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAttempt = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.attempt(token, id));
    } catch (loadError) {
      setError(loadError.message || 'Could not load attempt results.');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    loadAttempt();
  }, [loadAttempt]);
  if (loading)
    return (
      <main className="workspace-shell">
        <div className="workspace-empty">Loading your results…</div>
      </main>
    );
  if (!data)
    return (
      <main className="workspace-shell">
        <div className="workspace-alert error">{error}</div>
        <Link to="/student" className="secondary-btn">
          <ArrowLeft size={16} /> Back to practice
        </Link>
      </main>
    );

  const { submission, review } = data;
  return (
    <main className="workspace-shell narrow-shell">
      <Link className="back-link" to="/student">
        <ArrowLeft size={16} /> Back to student dashboard
      </Link>
      <header className="results-hero">
        <p className="eyebrow">Practice results</p>
        <h1>{submission.questionSet?.title || 'Interview practice'}</h1>
        <div className="results-score">
          {submission.percentage ?? 0}%<span>automatic score for multiple-choice answers</span>
        </div>
        <p>
          <Clock3 size={15} /> Completed {new Date(submission.createdAt).toLocaleString()}
        </p>
      </header>
      {submission.instructorRating && (
        <section className="workspace-card instructor-feedback">
          <p className="eyebrow">Instructor feedback</p>
          <h2>Progress rating: {submission.instructorRating}/5</h2>
          <p>{submission.instructorFeedback}</p>
        </section>
      )}
      <section className="workspace-section">
        <div className="workspace-section-heading">
          <div>
            <h2>Answer review</h2>
            <p>
              Written responses are reviewed by your instructor and are not included in the
              automatic score.
            </p>
          </div>
        </div>
        <div className="answer-review-list">
          {review.map((item, index) => (
            <article className="question-card" key={item.question}>
              <div className="question-number">
                Question {index + 1}
                {item.isCorrect === null ? (
                  <span>Written response</span>
                ) : item.isCorrect ? (
                  <span className="correct-label">
                    <CheckCircle2 size={14} /> Correct
                  </span>
                ) : (
                  <span className="wrong-label">
                    <XCircle size={14} /> Review answer
                  </span>
                )}
              </div>
              <h3>{item.text}</h3>
              <p className="review-answer">
                <strong>Your answer:</strong> {item.yourAnswer || 'No answer submitted'}
              </p>
              {item.correctAnswer && (
                <p className="review-answer">
                  <strong>Expected answer:</strong> {item.correctAnswer}
                </p>
              )}
              {item.instructorFeedback && (
                <div className="existing-review">
                  <strong>Instructor feedback</strong>
                  <p>{item.instructorFeedback}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
