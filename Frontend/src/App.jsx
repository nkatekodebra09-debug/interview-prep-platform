import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminPanel from './pages/AdminPanel';
import QuizAttempt from './pages/QuizAttempt';
import AttemptReview from './pages/AttemptReview';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'instructor':
        return <Navigate to="/instructor" replace />;
      default:
        return <Navigate to="/student" replace />;
    }
  }

  const roles = [
    {
      name: 'Student',
      description:
        'Practice mock interviews, sharpen your communication, and track growth over time.',
      icon: BriefcaseBusiness,
    },
    {
      name: 'Instructor',
      description:
        'Create structured question sets, review submissions, and guide candidates with confidence.',
      icon: BarChart3,
    },
    {
      name: 'Admin',
      description:
        'Manage approvals, monitor activity, and control the platform with real analytics.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="landing-page-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={16} />
            Career-ready interview preparation
          </div>
          <h1>Practice smarter. Perform better. Get hired faster.</h1>
          <p>
            A full interview prep platform for students, instructors, and administrators to train,
            review, and improve interview performance with real-world mock practice.
          </p>

          <div className="hero-actions">
            <button className="primary-btn" onClick={() => navigate('/register')}>
              Get started <ArrowRight size={18} />
            </button>
            <button className="secondary-btn" onClick={() => navigate('/login')}>
              Login
            </button>
          </div>

          <div className="hero-meta">
            <div>
              <strong>Practice</strong>
              <span>answer questions published by instructors</span>
            </div>
            <div>
              <strong>Review</strong>
              <span>get feedback on your completed attempts</span>
            </div>
            <div>
              <strong>Progress</strong>
              <span>track your real practice history</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-card">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
              alt="Professionals preparing for interviews at a modern desk"
            />
            <div className="floating-panel">
              <div className="mini-stat">
                <BookOpenCheck size={16} />
                <span>Instructor question sets</span>
              </div>
              <div className="mini-stat">
                <CheckCircle2 size={16} />
                <span>Answer, submit, and get reviewed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="role-section">
        <div className="section-heading">
          <p>Built for every stage of the hiring journey</p>
          <h2>Choose your path</h2>
        </div>

        <div className="role-grid">
          {roles.map(({ name, description, icon: Icon }) => (
            <article key={name} className="role-card">
              <div className="role-icon">
                <Icon size={22} />
              </div>
              <h3>{name}</h3>
              <p>{description}</p>
              <button
                onClick={() =>
                  name === 'Admin'
                    ? navigate('/login')
                    : navigate('/register', { state: { role: name.toLowerCase() } })
                }
              >
                {name === 'Admin' ? 'Admin login' : `Register as ${name}`}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />

        <Route
          path="/student"
          element={
            <ProtectedRoute roles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attempt/:id"
          element={
            <ProtectedRoute roles={['student']}>
              <QuizAttempt />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review/:id"
          element={
            <ProtectedRoute roles={['student']}>
              <AttemptReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor"
          element={
            <ProtectedRoute roles={['instructor', 'admin']}>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
      </Routes>
    </>
  );
}
