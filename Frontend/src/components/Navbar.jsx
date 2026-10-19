import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar">
      <Link to="/" className="brand">
        🧠 Interview Prep
      </Link>
      <div className="links">
        {user ? (
          <>
            <Link
              className="nav-dashboard-link"
              to={
                user.role === 'admin'
                  ? '/admin'
                  : user.role === 'instructor'
                    ? '/instructor'
                    : '/student'
              }
            >
              Dashboard
            </Link>
            <span className="role-badge">{user.role}</span>
            <span className="muted">{user.username}</span>
            <button className="secondary small" onClick={handleLogout} aria-label="Log out">
              Log out
            </button>
          </>
        ) : (
          <Link to="/login" className="muted">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}