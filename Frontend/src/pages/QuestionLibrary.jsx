import React, { useState } from 'react';

const questionsData = [
  {
    id: 1,
    text: 'Tell me about a time you faced a challenge...',
    cat: 'Behavioral',
    diff: 'Medium',
  },
  { id: 2, text: 'How would you design a scalable web app?', cat: 'Technical', diff: 'Hard' },
  { id: 3, text: 'What are your strengths and weaknesses?', cat: 'Situational', diff: 'Easy' },
];

const QuestionCard = ({ q }) => (
  <div className="q-card">
    <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '600' }}>{q.cat}</span>
    <h3 style={{ margin: '1rem 0', fontSize: '1.1rem' }}>{q.text}</h3>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className={`badge badge-${q.diff.toLowerCase()}`}>{q.diff}</span>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>5 min</span>
    </div>
  </div>
);

const QuestionLibrary = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [difficulty, setDifficulty] = useState('All Difficulty');

  const filteredQuestions = questionsData.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All Categories' || q.cat === category;
    const matchesDifficulty = difficulty === 'All Difficulty' || q.diff === difficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Question Library</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Explore a wide range of interview questions across categories.
        </p>
      </header>

      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="search-input"
          style={{ width: '150px' }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>All Categories</option>
          <option>Behavioral</option>
          <option>Technical</option>
          <option>Situational</option>
        </select>
        <select
          className="search-input"
          style={{ width: '150px' }}
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option>All Difficulty</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>

      <div className="q-grid">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => <QuestionCard key={q.id} q={q} />)
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No questions found.</p>
        )}
      </div>
    </div>
  );
};

export default QuestionLibrary;
