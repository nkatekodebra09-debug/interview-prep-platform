import { useNavigate } from 'react-router-dom';

const careers = ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer'];

const CareerCard = ({ career, onSelect }) => (
  <div className="card">
    <h3>{career}</h3>
    <p
      style={{
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        margin: '1rem 0',
      }}
    >
      Detailed guides, role-specific questions, and common company patterns.
    </p>
    <button className="btn btn-primary" onClick={() => onSelect(career)}>
      Start Preparing
    </button>
  </div>
);

const CareerPage = () => {
  const navigate = useNavigate();

  const handleSelect = (career) => {
    navigate(`/career/${career.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Choose Your Career Path</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        Select a role to start your tailored interview prep
      </p>

      <div className="career-grid">
        {careers.map((career) => (
          <CareerCard key={career} career={career} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};

export default CareerPage;
