import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowUpRight, BookOpenCheck, Brain, Clock3, Flame, Trophy } from 'lucide-react';

const readinessScores = [
  { week: 'W1', score: 62 },
  { week: 'W2', score: 68 },
  { week: 'W3', score: 74 },
  { week: 'W4', score: 78 },
  { week: 'W5', score: 82 },
  { week: 'W6', score: 88 },
];

const skillBreakdown = [
  { skill: 'Technical', score: 88 },
  { skill: 'Communication', score: 78 },
  { skill: 'Behavioral', score: 83 },
  { skill: 'Problem Solving', score: 91 },
];

const weeklyFocus = [
  { name: 'Mon', value: 52 },
  { name: 'Tue', value: 68 },
  { name: 'Wed', value: 60 },
  { name: 'Thu', value: 81 },
  { name: 'Fri', value: 74 },
  { name: 'Sat', value: 90 },
  { name: 'Sun', value: 86 },
];

const radarData = [
  { subject: 'Technical', score: 88 },
  { subject: 'Logic', score: 91 },
  { subject: 'Communication', score: 79 },
  { subject: 'Leadership', score: 75 },
  { subject: 'Confidence', score: 86 },
  { subject: 'Problem Solving', score: 92 },
];

const pieData = [
  { name: 'Completed', value: 68, color: '#5eead4' },
  { name: 'In Progress', value: 22, color: '#60a5fa' },
  { name: 'Pending', value: 10, color: '#a78bfa' },
];

const StatCard = ({ label, value, trend, icon: Icon, tone }) => (
  <div className="stat-card">
    <div className="stat-header">
      <span className="stat-label">{label}</span>
      <div className="stat-icon" style={{ background: tone }}>
        <Icon size={18} />
      </div>
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-trend">{trend}</div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Interview progress overview</p>
          <h1>Good afternoon, Nkateko 👋</h1>
        </div>
        <div className="header-chip">+12% this week</div>
      </header>

      <div className="stats-grid">
        <StatCard
          label="Overall Readiness"
          value="82%"
          trend="↑ 12% from last month"
          icon={Trophy}
          tone="rgba(94, 234, 212, 0.18)"
        />
        <StatCard
          label="Practice Sessions"
          value="24"
          trend="7 sessions this week"
          icon={BookOpenCheck}
          tone="rgba(96, 165, 250, 0.18)"
        />
        <StatCard
          label="Current Streak"
          value="7 days"
          trend="Keep the momentum"
          icon={Flame}
          tone="rgba(251, 146, 60, 0.18)"
        />
        <StatCard
          label="Avg. Score"
          value="87%"
          trend="Across all mock rounds"
          icon={Brain}
          tone="rgba(167, 139, 250, 0.18)"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel large-panel">
          <div className="panel-header">
            <h3>Readiness trend</h3>
            <span className="pill">Last 6 weeks</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={readinessScores}>
                <defs>
                  <linearGradient id="readyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.15)"
                  vertical={false}
                />
                <XAxis dataKey="week" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[50, 100]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#60a5fa"
                  strokeWidth={3}
                  fill="url(#readyFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Skill breakdown</h3>
            <span className="pill">Live</span>
          </div>
          <div className="skill-list">
            {skillBreakdown.map((item) => (
              <div key={item.skill} className="skill-row">
                <div className="skill-label-row">
                  <span>{item.skill}</span>
                  <strong>{item.score}%</strong>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-grid secondary-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Weekly activity</h3>
            <span className="pill">Practice time</span>
          </div>
          <div className="chart-wrap small-chart">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyFocus}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.15)"
                  vertical={false}
                />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Performance profile</h3>
            <span className="pill">Radar</span>
          </div>
          <div className="chart-wrap small-chart">
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(148,163,184,0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar dataKey="score" stroke="#5eead4" fill="#5eead4" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Completion</h3>
            <span className="pill muted">This month</span>
          </div>
          <div className="ring-wrap">
            <div
              className="progress-ring"
              style={{
                background: 'conic-gradient(#60a5fa 0 68%, rgba(148,163,184,0.14) 68% 100%)',
              }}
            >
              <div className="progress-center">68%</div>
            </div>
            <div className="ring-legend">
              <div>
                <span className="dot blue" /> Completed
              </div>
              <div>
                <span className="dot violet" /> In progress
              </div>
              <div>
                <span className="dot teal" /> Pending
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Top focus areas</h3>
            <span className="pill success">Actionable</span>
          </div>
          <ul className="focus-list">
            <li>
              <div>
                <strong>System design</strong>
                <small>Target: 90%</small>
              </div>
              <ArrowUpRight size={18} />
            </li>
            <li>
              <div>
                <strong>Behavioral stories</strong>
                <small>Target: 85%</small>
              </div>
              <ArrowUpRight size={18} />
            </li>
            <li>
              <div>
                <strong>Problem solving</strong>
                <small>Target: 92%</small>
              </div>
              <ArrowUpRight size={18} />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
