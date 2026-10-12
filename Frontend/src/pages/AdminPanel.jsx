import { useCallback, useEffect, useState } from 'react';
import { Check, RefreshCw, ShieldCheck, Trash2, UserRoundCheck, UserRoundX, X } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
  const { token, user } = useAuth();
  const [sets, setSets] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const userQuery = userFilter === 'all' ? '' : `?role=${encodeURIComponent(userFilter)}`;
      const [pendingSets, stats, allUsers] = await Promise.all([
        api.adminSets(token, 'pending'),
        api.analytics(token),
        api.adminUsers(token, userQuery),
      ]);
      setSets(pendingSets);
      setAnalytics(stats);
      setUsers(allUsers);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load administration data.');
    } finally {
      setLoading(false);
    }
  }, [token, userFilter]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const moderateSet = async (setId, status) => {
    setSavingId(setId);
    setError('');
    setNotice('');
    try {
      await api.reviewSet(token, setId, status);
      setNotice(`Question set ${status}.`);
      await loadAdminData();
    } catch (actionError) {
      setError(actionError.message || 'Could not update this question set.');
    } finally {
      setSavingId('');
    }
  };

  const updateUser = async (action, account) => {
    if (
      action === 'delete' &&
      !window.confirm(
        `Delete ${account.username}? This also removes their submissions and, for instructors, their question sets.`,
      )
    )
      return;

    setSavingId(account._id);
    setError('');
    setNotice('');
    try {
      if (action === 'approve') await api.approveUser(token, account._id);
      if (action === 'block') await api.blockUser(token, account._id, !account.isBlocked);
      if (action === 'delete') await api.deleteUser(token, account._id);
      setNotice(
        action === 'approve'
          ? `${account.username} approved.`
          : action === 'delete'
            ? `${account.username} deleted.`
            : `Account ${account.isBlocked ? 'unblocked' : 'blocked'}.`,
      );
      await loadAdminData();
    } catch (actionError) {
      setError(actionError.message || 'Could not update this account.');
    } finally {
      setSavingId('');
    }
  };

  const userCounts = analytics?.users?.byRole || {};
  const setCounts = analytics?.content?.setsByStatus || {};

  return (
    <main className="workspace-shell">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Platform overview</h1>
          <p className="workspace-subtitle">
            Welcome, {user?.username || 'Admin'}. Review content and monitor real platform activity.
          </p>
        </div>
        <button
          className="secondary-btn workspace-refresh"
          onClick={loadAdminData}
          disabled={loading}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

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

      <section className="student-stats">
        <article className="student-stat">
          <ShieldCheck size={20} />
          <div>
            <strong>{userCounts.student || 0}</strong>
            <span>students</span>
          </div>
        </article>
        <article className="student-stat">
          <ShieldCheck size={20} />
          <div>
            <strong>{userCounts.instructor || 0}</strong>
            <span>instructors</span>
          </div>
        </article>
        <article className="student-stat">
          <ShieldCheck size={20} />
          <div>
            <strong>{analytics?.attempts?.total || 0}</strong>
            <span>completed attempts</span>
          </div>
        </article>
        <article className="student-stat">
          <ShieldCheck size={20} />
          <div>
            <strong>{setCounts.pending || 0}</strong>
            <span>sets awaiting review</span>
          </div>
        </article>
      </section>

      <section className="workspace-card admin-users">
        <div className="workspace-card-heading">
          <div className="workspace-icon">
            <UserRoundCheck size={19} />
          </div>
          <div>
            <h2>User management</h2>
            <p>Approve accounts, manage access, or remove users and their associated activity.</p>
          </div>
        </div>
        <label className="admin-filter">
          Filter accounts
          <select value={userFilter} onChange={(event) => setUserFilter(event.target.value)}>
            <option value="all">All users</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Admins</option>
          </select>
        </label>
        {loading ? (
          <div className="workspace-empty compact">Loading user accounts…</div>
        ) : users.length === 0 ? (
          <div className="workspace-empty compact">No accounts match this filter.</div>
        ) : (
          <div className="admin-user-list" role="table" aria-label="User management">
            <div className="admin-user-heading" role="row">
              <span>User</span>
              <span>Role</span>
              <span>Account status</span>
              <span>Actions</span>
            </div>
            {users.map((account) => {
              const needsApproval = account.role === 'instructor' && !account.isApproved;
              return (
                <article className="admin-user-row" role="row" key={account._id}>
                  <div className="admin-user-identity">
                    <strong>{account.username}</strong>
                    <span>{account.email}</span>
                    <small>Joined {new Date(account.createdAt).toLocaleDateString()}</small>
                  </div>
                  <span className="admin-role">{account.role}</span>
                  <span
                    className={`status-pill ${account.isBlocked ? 'rejected' : needsApproval ? 'pending' : 'approved'}`}
                  >
                    {account.isBlocked ? 'Blocked' : needsApproval ? 'Awaiting approval' : 'Active'}
                  </span>
                  <div className="admin-user-actions">
                    {needsApproval && (
                      <button
                        className="primary-btn"
                        disabled={savingId === account._id}
                        onClick={() => updateUser('approve', account)}
                      >
                        <Check size={15} /> Approve
                      </button>
                    )}
                    {account.role !== 'admin' && (
                      <button
                        className="secondary-btn"
                        disabled={savingId === account._id}
                        onClick={() => updateUser('block', account)}
                      >
                        {account.isBlocked ? (
                          <UserRoundCheck size={15} />
                        ) : (
                          <UserRoundX size={15} />
                        )}
                        {account.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    )}
                    {account.role !== 'admin' && (
                      <button
                        className="danger-btn"
                        disabled={savingId === account._id}
                        onClick={() => updateUser('delete', account)}
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="workspace-card">
        <div className="workspace-card-heading">
          <div className="workspace-icon">
            <ShieldCheck size={19} />
          </div>
          <div>
            <h2>Question-set review</h2>
            <p>Approve high-quality sets or reject submissions that need changes.</p>
          </div>
        </div>
        {loading ? (
          <div className="workspace-empty compact">Loading moderation queue…</div>
        ) : sets.length === 0 ? (
          <div className="workspace-empty compact">No question sets are waiting for review.</div>
        ) : (
          <div className="set-list">
            {sets.map((set) => (
              <article className="set-row" key={set._id}>
                <div>
                  <strong>{set.title}</strong>
                  <p>
                    {set.category} · {set.difficulty} · by {set.createdBy?.username || 'Instructor'}
                  </p>
                  <p>{set.description || 'No description provided.'}</p>
                </div>
                <details className="admin-question-preview">
                  <summary>Review questions ({set.questions?.length || 0})</summary>
                  {set.questions?.map((question, index) => (
                    <div className="answer-review-item" key={question._id}>
                      <strong>
                        {index + 1}. {question.text}
                      </strong>
                      {question.type === 'mcq' && (
                        <>
                          <p>Options: {question.options?.join(' · ')}</p>
                          <p>Correct answer: {question.correctAnswer}</p>
                        </>
                      )}
                    </div>
                  ))}
                </details>
                <div className="inline-actions">
                  <button
                    className="primary-btn"
                    disabled={savingId === set._id || !set.questions?.length}
                    onClick={() => moderateSet(set._id, 'approved')}
                  >
                    <Check size={16} /> Approve
                  </button>
                  <button
                    className="secondary-btn"
                    disabled={savingId === set._id}
                    onClick={() => moderateSet(set._id, 'rejected')}
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
