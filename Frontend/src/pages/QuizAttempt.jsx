import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function QuizAttempt() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [set, setSet] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [startedAt] = useState(Date.now());

  const loadSet = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getSet(token, id);
      setSet(data);
    } catch (loadError) {
      setError(loadError.message || 'This interview set could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    loadSet();
  }, [loadSet]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = await api.submitAttempt(token, {
        questionSet: id,
        answers: Object.entries(answers).map(([question, answer]) => ({ question, answer })),
        timeTakenSeconds: Math.floor((Date.now() - startedAt) / 1000),
      });
      navigate(`/review/${result.submission._id}`, { state: { result } });
    } catch (submitError) {
      setError(submitError.message || 'Could not submit this attempt.');
      setSaving(false);
    }
  };

  if (loading)
    return (
      <main className="workspace-shell">
        <div className="workspace-empty">Loading interview questions…</div>
      </main>
    );
  if (!set)
    return (
      <main className="workspace-shell">
        <div className="workspace-alert error">{error || 'Interview set not found.'}</div>
        <Link className="secondary-btn" to="/student">
          <ArrowLeft size={16} /> Back to practice
        </Link>
      </main>
    );

  return (
    <main className="workspace-shell narrow-shell">
      <Link className="back-link" to="/student">
        <ArrowLeft size={16} /> Back to practice sets
      </Link>
      <header className="workspace-header attempt-header">
        <div>
          <p className="eyebrow">Interview practice · {set.category}</p>
          <h1>{set.title}</h1>
          <p className="workspace-subtitle">{set.description}</p>
        </div>
        <span className="status-pill approved">{set.questions?.length || 0} questions</span>
      </header>
      {error && (
        <div className="workspace-alert error" role="alert">
          {error}
        </div>
      )}
      {set.questions?.length ? (
        <form className="question-form" onSubmit={submit}>
          {set.questions.map((question, index) => (
            <article className="question-card" key={question._id}>
              <div className="question-number">
                Question {index + 1}
                <span>{question.type === 'mcq' ? 'Multiple choice' : 'Written response'}</span>
              </div>
              <h2>{question.text}</h2>
              {question.type === 'mcq' ? (
                <div className="answer-options">
                  {question.options.map((option) => (
                    <label className="answer-option" key={option}>
                      <input
                        type="radio"
                        name={question._id}
                        value={option}
                        checked={answers[question._id] === option}
                        onChange={() =>
                          setAnswers((current) => ({ ...current, [question._id]: option }))
                        }
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  required
                  rows="6"
                  value={answers[question._id] || ''}
                  onChange={(event) =>
                    setAnswers((current) => ({ ...current, [question._id]: event.target.value }))
                  }
                  placeholder="Write your response…"
                />
              )}
            </article>
          ))}
          <button className="primary-btn" disabled={saving}>
            {saving ? 'Submitting…' : 'Submit interview'} <Send size={17} />
          </button>
        </form>
      ) : (
        <div className="workspace-empty">This set has no questions yet.</div>
      )}
    </main>
  );
}
