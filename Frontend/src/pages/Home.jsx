import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Shield } from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => (
  <div className="card" style={{ textAlign: 'center' }}>
    {icon}
    <h3>{title}</h3>
    <p style={{ color: 'var(--text-muted)' }}>{description}</p>
  </div>
);

const Home = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', color: 'white' }}>
      {/* Navbar */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '2rem 5%',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
          InterviewPrep
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <NavLink to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Home
          </NavLink>
          <Link to="/login" className="btn btn-outline">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '5rem 10%' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>
          Prepare Smarter.
          <br />
          <span style={{ color: 'var(--primary)' }}>Interview Better.</span>
        </h1>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '1.2rem',
            marginBottom: '3rem',
            maxWidth: '700px',
            marginInline: 'auto',
          }}
        >
          Master your next interview with AI-driven practice, professional feedback, and a
          comprehensive question library tailored to your career.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.1rem' }}>
            Start Practicing <ArrowRight size={20} />
          </Link>
          <Link to="/library" className="btn btn-outline" style={{ fontSize: '1.1rem' }}>
            Explore Questions
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          padding: '5rem 10%',
        }}
      >
        <FeatureCard
          icon={<Zap color="var(--primary)" size={40} style={{ marginBottom: '1rem' }} />}
          title="Instant Feedback"
          description="Get real-time analysis of your answers based on the STAR method."
        />
        <FeatureCard
          icon={<Shield color="var(--primary)" size={40} style={{ marginBottom: '1rem' }} />}
          title="Company Specific"
          description="Practice questions from top tech companies and Fortune 500s."
        />
        <FeatureCard
          icon={<CheckCircle color="var(--primary)" size={40} style={{ marginBottom: '1rem' }} />}
          title="Track Progress"
          description="Visualize your growth with detailed analytics and readiness scores."
        />
      </section>
    </div>
  );
};

export default Home;
