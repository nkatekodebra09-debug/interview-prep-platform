import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, Clock3, RefreshCw, Trophy } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { token, user } = useAuth();
  const [sets, setSets] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [availableSets, ownAttempts] = await Promise.all([
        api.getSets(token),
        api.myAttempts(token),
      ]);
      setSets(availableSets);
      setAttempts(ownAttempts);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load your practice data.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const average = attempts.length
    ? Math.round(
        attempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / attempts.length,
      )
    : 0;

  return (
    <main className="workspace-shell">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Student practice area</p>
          <h1>Welcome, {user?.username || 'Candidate'}</h1>
          <p className="workspace-subtitle">
            Choose a real interview set, submit your answers, and track your progress.
          </p>
        </div>
        <button className="secondary-btn workspace-refresh" onClick={loadData} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <section className="student-stats">
        <article className="student-stat">
          <BookOpenCheck size={20} />
          <div>
            <strong>{sets.length}</strong>
            <span>practice sets available</span>
          </div>
        </article>
        <article className="student-stat">
          <Trophy size={20} />
          <div>
            <strong>{attempts.length}</strong>
            <span>completed attempts</span>
          </div>
        </article>
        <article className="student-stat">
          <Trophy size={20} />
          <div>
            <strong>{average}%</strong>
            <span>average auto score</span>
          </div>
        </article>
      </section>

      {error && (
        <div className="workspace-alert error" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="workspace-empty">Loading practice sets…</div>
      ) : (
        <>
          <section className="workspace-section">
            <div className="workspace-section-heading">
              <div>
                <h2>Interview question sets</h2>
                <p>Start a timed or untimed practice session.</p>
              </div>
            </div>
            {error ? (
              <div className="workspace-empty">
                Question sets could not be loaded. Refresh to try again.
              </div>
            ) : sets.length === 0 ? (
              <div className="workspace-empty">
                No approved interview sets are available yet. Check back when an instructor or admin
                publishes one.
              </div>
            ) : (
              <div className="practice-grid">
                {sets.map((set) => (
                  <article className="practice-card" key={set._id}>
                    <div className="practice-tags">
                      <span>{set.category}</span>
                      <span>{set.difficulty}</span>
                    </div>
                    <h3>{set.title}</h3>
                    <p>
                      {set.description || 'Practice interview questions and review your results.'}
                    </p>
                    <div className="practice-meta">
                      <span>
                        <BookOpenCheck size={15} /> {set.questionCount || 0} questions
                      </span>
                      <span>
                        <Clock3 size={15} />{' '}
                        {set.timeLimitMinutes ? `${set.timeLimitMinutes} min` : 'No time limit'}
                      </span>
                    </div>
                    <Link className="primary-btn practice-start" to={`/attempt/${set._id}`}>
                      Start practice <ArrowRight size={17} />
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="workspace-section">
            <div className="workspace-section-heading">
              <div>
                <h2>Your recent attempts</h2>
                <p>Open an attempt to see answers and instructor feedback.</p>
              </div>
            </div>
            {attempts.length === 0 ? (
              <div className="workspace-empty">
                Your completed practice attempts will show here.
              </div>
            ) : (
              <div className="attempt-list">
                {attempts.map((attempt) => (
                  <article className="attempt-row" key={attempt._id}>
                    <div>
                      <strong>{attempt.questionSet?.title || 'Interview practice'}</strong>
                      <p>
                        {new Date(attempt.createdAt).toLocaleString()} · Attempt{' '}
                        {attempt.attemptNumber || 1}
                      </p>
                    </div>
                    <div className="attempt-result">
                      <strong>{attempt.percentage ?? 0}%</strong>
                      {attempt.instructorRating && (
                        <span>Instructor rating: {attempt.instructorRating}/5</span>
                      )}
                      <Link to={`/review/${attempt._id}`}>
                        View results <ArrowRight size={15} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
