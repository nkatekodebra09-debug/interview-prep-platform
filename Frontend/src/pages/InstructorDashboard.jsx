import { useCallback, useEffect, useState } from 'react';
import { BookOpenCheck, ClipboardCheck, Plus, RefreshCw, Send, Users } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const categories = [
  'JavaScript',
  'React',
  'Node.js',
  'Databases',
  'System Design',
  'HR & Behavioural',
  'General',
];

export default function InstructorDashboard() {
  const { token, user } = useAuth();
  const [sets, setSets] = useState([]);
  const [queue, setQueue] = useState([]);
  const [selectedSet, setSelectedSet] = useState('');
  const [tab, setTab] = useState('questions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [reviewingId, setReviewingId] = useState('');
  const [rating, setRating] = useState('5');
  const [feedback, setFeedback] = useState('');
  const [answerFeedback, setAnswerFeedback] = useState({});
  const [setForm, setSetForm] = useState({
    title: '',
    description: '',
    category: 'General',
    difficulty: 'medium',
    timeLimitMinutes: 30,
  });
  const [questionForm, setQuestionForm] = useState({
    text: '',
    type: 'mcq',
    options: '',
    correctAnswer: '',
  });

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ownSets, submissions] = await Promise.all([
        api.getSets(token, '?mine=true'),
        api.reviewQueue(token),
      ]);
      setSets(ownSets);
      setQueue(submissions);
      setSelectedSet((current) => current || ownSets[0]?._id || '');
    } catch (loadError) {
      setError(loadError.message || 'Unable to load instructor workspace.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const addQuestionSet = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    try {
      const created = await api.createSet(token, {
        ...setForm,
        timeLimitMinutes: Number(setForm.timeLimitMinutes) || 0,
      });
      setSetForm({
        title: '',
        description: '',
        category: 'General',
        difficulty: 'medium',
        timeLimitMinutes: 30,
      });
      setSelectedSet(created._id);
      setNotice('Interview set created. Add questions below.');
      await loadWorkspace();
    } catch (saveError) {
      setError(saveError.message || 'Could not create the interview set.');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    try {
      const options =
        questionForm.type === 'mcq'
          ? questionForm.options
              .split('\n')
              .map((option) => option.trim())
              .filter(Boolean)
          : [];
      await api.createQuestion(token, {
        questionSet: selectedSet,
        text: questionForm.text.trim(),
        type: questionForm.type,
        options,
        correctAnswer: questionForm.correctAnswer.trim(),
      });
      setQuestionForm({ text: '', type: 'mcq', options: '', correctAnswer: '' });
      setNotice('Question added to the interview set.');
      await loadWorkspace();
    } catch (saveError) {
      setError(saveError.message || 'Could not add the question.');
    } finally {
      setSaving(false);
    }
  };

  const publishSet = async (setId) => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await api.publishSet(token, setId);
      setNotice(
        'Question set submitted for admin approval. Students can access it after approval.',
      );
      await loadWorkspace();
    } catch (publishError) {
      setError(publishError.message || 'Could not publish this question set.');
    } finally {
      setSaving(false);
    }
  };

  const submitReview = async (event, submissionId) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.reviewSubmission(token, submissionId, {
        rating: Number(rating),
        feedback,
        answerFeedback: Object.entries(answerFeedback).map(([question, writtenFeedback]) => ({
          question,
          feedback: writtenFeedback,
        })),
      });
      setReviewingId('');
      setFeedback('');
      setAnswerFeedback({});
      setNotice('Student progress review saved.');
      await loadWorkspace();
    } catch (reviewError) {
      setError(reviewError.message || 'Could not save this review.');
    } finally {
      setSaving(false);
    }
  };

  const activeSet = sets.find((set) => set._id === selectedSet);

  return (
    <main className="workspace-shell">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Instructor workspace</p>
          <h1>Welcome, {user?.username || 'Instructor'}</h1>
          <p className="workspace-subtitle">
            Build interview practice and give candidates useful, personal feedback.
          </p>
        </div>
        <button
          className="secondary-btn workspace-refresh"
          onClick={loadWorkspace}
          disabled={loading}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <nav className="workspace-tabs" aria-label="Instructor tools">
        <button className={tab === 'questions' ? 'active' : ''} onClick={() => setTab('questions')}>
          <BookOpenCheck size={17} /> Question sets
        </button>
        <button className={tab === 'reviews' ? 'active' : ''} onClick={() => setTab('reviews')}>
          <ClipboardCheck size={17} /> Student reviews <span>{queue.length}</span>
        </button>
      </nav>

      {error && (
        <div className="workspace-alert error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="workspace-alert success" role="status">
          {notice}
        </div>
      )}
      {loading ? (
        <div className="workspace-empty">Loading your instructor workspace…</div>
      ) : tab === 'questions' ? (
        <div className="workspace-columns">
          <section className="workspace-card">
            <div className="workspace-card-heading">
              <div className="workspace-icon">
                <Plus size={19} />
              </div>
              <div>
                <h2>Create interview set</h2>
                <p>Organize questions into a practice track.</p>
              </div>
            </div>
            <form className="workspace-form" onSubmit={addQuestionSet}>
              <label>
                Set title
                <input
                  required
                  maxLength={100}
                  value={setForm.title}
                  onChange={(e) => setSetForm({ ...setForm, title: e.target.value })}
                  placeholder="e.g. Frontend Engineer Screening"
                />
              </label>
              <label>
                Description
                <textarea
                  rows="3"
                  value={setForm.description}
                  onChange={(e) => setSetForm({ ...setForm, description: e.target.value })}
                  placeholder="What should candidates practice?"
                />
              </label>
              <div className="form-row">
                <label>
                  Category
                  <select
                    value={setForm.category}
                    onChange={(e) => setSetForm({ ...setForm, category: e.target.value })}
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Difficulty
                  <select
                    value={setForm.difficulty}
                    onChange={(e) => setSetForm({ ...setForm, difficulty: e.target.value })}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>
              </div>
              <label>
                Time limit (minutes)
                <input
                  type="number"
                  min="0"
                  max="240"
                  value={setForm.timeLimitMinutes}
                  onChange={(e) => setSetForm({ ...setForm, timeLimitMinutes: e.target.value })}
                />
              </label>
              <button className="primary-btn" disabled={saving}>
                <Plus size={17} /> Create set
              </button>
            </form>
          </section>

          <section className="workspace-card">
            <div className="workspace-card-heading">
              <div className="workspace-icon">
                <BookOpenCheck size={19} />
              </div>
              <div>
                <h2>Add interview questions</h2>
                <p>Multiple choice and written-response questions are supported.</p>
              </div>
            </div>
            {sets.length === 0 ? (
              <p className="workspace-empty compact">
                Create a set first, then add questions here.
              </p>
            ) : (
              <form className="workspace-form" onSubmit={addQuestion}>
                <label>
                  Question set
                  <select value={selectedSet} onChange={(e) => setSelectedSet(e.target.value)}>
                    {sets.map((set) => (
                      <option value={set._id} key={set._id}>
                        {set.title} · {set.status}
                      </option>
                    ))}
                  </select>
                </label>
                {activeSet && activeSet.status !== 'approved' && (
                  <div className="workspace-hint">
                    <span>
                      {activeSet.status === 'pending'
                        ? 'Submitted for admin approval. Students can access it once approved.'
                        : 'Add questions, then submit this set for admin approval.'}
                    </span>
                    {activeSet.status !== 'pending' && (
                      <button
                        type="button"
                        className="secondary-btn"
                        disabled={saving || !activeSet.questionCount}
                        onClick={() => publishSet(activeSet._id)}
                      >
                        Submit for approval
                      </button>
                    )}
                  </div>
                )}
                <label>
                  Question
                  <textarea
                    required
                    rows="3"
                    value={questionForm.text}
                    onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                    placeholder="Write a clear interview question"
                  />
                </label>
                <label>
                  Response type
                  <select
                    value={questionForm.type}
                    onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })}
                  >
                    <option value="mcq">Multiple choice (auto-marked)</option>
                    <option value="descriptive">Written response (review manually)</option>
                  </select>
                </label>
                {questionForm.type === 'mcq' && (
                  <>
                    <label>
                      Answer choices
                      <textarea
                        required
                        rows="4"
                        value={questionForm.options}
                        onChange={(e) =>
                          setQuestionForm({ ...questionForm, options: e.target.value })
                        }
                        placeholder={'One answer choice per line\nAt least two choices'}
                      />
                    </label>
                    <label>
                      Correct answer
                      <input
                        required
                        value={questionForm.correctAnswer}
                        onChange={(e) =>
                          setQuestionForm({ ...questionForm, correctAnswer: e.target.value })
                        }
                        placeholder="Must match one choice"
                      />
                    </label>
                  </>
                )}
                <button className="primary-btn" disabled={saving || !selectedSet}>
                  <Plus size={17} /> Add question
                </button>
              </form>
            )}
          </section>

          <section className="workspace-card full-card">
            <div className="workspace-card-heading">
              <div className="workspace-icon">
                <Users size={19} />
              </div>
              <div>
                <h2>Your question sets</h2>
                <p>See which practice tracks are available to students.</p>
              </div>
            </div>
            {sets.length === 0 ? (
              <p className="workspace-empty compact">
                No sets yet. Create your first interview set above.
              </p>
            ) : (
              <div className="set-list">
                {sets.map((set) => (
                  <article className="set-row" key={set._id}>
                    <div>
                      <strong>{set.title}</strong>
                      <p>
                        {set.category} · {set.difficulty} · {set.questionCount || 0} questions
                      </p>
                    </div>
                    <span className={`status-pill ${set.status}`}>{set.status}</span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <section className="workspace-card">
          <div className="workspace-card-heading">
            <div className="workspace-icon">
              <ClipboardCheck size={19} />
            </div>
            <div>
              <h2>Student progress reviews</h2>
              <p>Rate each attempt and leave actionable feedback for the student.</p>
            </div>
          </div>
          {queue.length === 0 ? (
            <div className="workspace-empty compact">
              No student submissions yet. Once students complete one of your approved sets, it will
              appear here.
            </div>
          ) : (
            <div className="review-list">
              {queue.map((submission) => (
                <article className="review-card" key={submission._id}>
                  <div className="review-summary">
                    <div>
                      <h3>
                        {submission.student?.username || 'Student'}{' '}
                        <span className="muted">
                          · {submission.questionSet?.title || 'Interview set'}
                        </span>
                      </h3>
                      <p>
                        {submission.student?.email} ·{' '}
                        {new Date(submission.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="review-score">
                      {submission.percentage ?? 0}%<small>auto score</small>
                    </div>
                  </div>
                  <details className="submission-responses">
                    <summary>Review submitted answers ({submission.answers?.length || 0})</summary>
                    <div className="answer-review-list">
                      {submission.answers?.map((answer, index) => (
                        <div className="answer-review-item" key={`${submission._id}-${index}`}>
                          <strong>
                            {index + 1}. {answer.question?.text || 'Question no longer available'}
                          </strong>
                          <p>
                            <span>Student response:</span> {answer.answer || 'No answer provided'}
                          </p>
                          {answer.question?.type === 'mcq' && (
                            <p>
                              <span>Expected answer:</span> {answer.question.correctAnswer}{' '}
                              {answer.isCorrect ? '· Correct' : '· Incorrect'}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                  {submission.instructorRating ? (
                    <div className="existing-review">
                      <strong>Rated {submission.instructorRating}/5</strong>
                      <p>{submission.instructorFeedback}</p>
                    </div>
                  ) : null}
                  {reviewingId === submission._id ? (
                    <form
                      className="workspace-form review-form"
                      onSubmit={(event) => submitReview(event, submission._id)}
                    >
                      {submission.answers
                        ?.filter((answer) => answer.question?.type === 'descriptive')
                        .map((answer, index) => (
                          <label key={answer.question._id}>
                            Feedback for written answer {index + 1}
                            <textarea
                              maxLength={2000}
                              rows="3"
                              value={answerFeedback[answer.question._id] ?? answer.feedback ?? ''}
                              onChange={(event) =>
                                setAnswerFeedback((current) => ({
                                  ...current,
                                  [answer.question._id]: event.target.value,
                                }))
                              }
                              placeholder="Give specific feedback on this written response"
                            />
                          </label>
                        ))}
                      <label>
                        Progress rating
                        <select value={rating} onChange={(e) => setRating(e.target.value)}>
                          <option value="5">5 — Excellent progress</option>
                          <option value="4">4 — Strong</option>
                          <option value="3">3 — On track</option>
                          <option value="2">2 — Needs practice</option>
                          <option value="1">1 — Needs significant support</option>
                        </select>
                      </label>
                      <label>
                        Feedback
                        <textarea
                          required
                          rows="3"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Mention strengths and one or two next steps"
                        />
                      </label>
                      <div className="inline-actions">
                        <button className="primary-btn" disabled={saving}>
                          <Send size={16} /> Save review
                        </button>
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => setReviewingId('')}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      className="secondary-btn review-action"
                      onClick={() => {
                        setReviewingId(submission._id);
                        setRating(String(submission.instructorRating || 5));
                        setFeedback(submission.instructorFeedback || '');
                        setAnswerFeedback(
                          Object.fromEntries(
                            (submission.answers || [])
                              .filter((answer) => answer.question?.type === 'descriptive')
                              .map((answer) => [answer.question._id, answer.feedback || '']),
                          ),
                        );
                      }}
                    >
                      {submission.instructorRating
                        ? 'Update review'
                        : 'Rate progress & add feedback'}
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
