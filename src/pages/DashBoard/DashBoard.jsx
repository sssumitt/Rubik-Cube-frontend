import { useState } from 'react';
import { User, Trophy, BarChart, Timer, Swords, Users, Crown, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './DashBoardPage.css';

const leaderboardData = [ /* ... */ ];
const recentMatchesData = [ /* ... */ ];

const StatItem = ({ icon: Icon, label, value }) => (
  <div className="stat-item">
    <Icon size={20} color="var(--clr-slate400)" />
    <p>{label}: <span>{value}</span></p>
  </div>
);

const Card = ({ children }) => <div className="card">{children}</div>;

function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: 'var(--size-5xl)', color: 'var(--clr-light)' }}>Competition Dashboard</h1>
        <p style={{ color: 'var(--clr-slate400)', fontSize: 'var(--size-lg)', marginTop: '0.5rem' }}>Your Real-time Rubik's Arena</p>
      </header>

      <div className="dashboard-grid">
        {/* Sidebar */}
        <div className="sidebar">
          <Card>
            <div className="card-header">
              <User size={20} color="var(--clr-indigo)" />
              My Profile
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <img src="https://placehold.co/64x64/4f46e5/f1f5f9?text=P1" alt="Player Avatar" className="avatar-large" />
              <div>
                <h2 style={{ fontSize: 'var(--size-xl)', color: 'var(--clr-light)' }}>Player_One</h2>
                <p style={{ color: '#22c55e', fontSize: 'var(--size-sm)', fontWeight: 'bold' }}>● Online</p>
              </div>
            </div>
            <div className="stats-grid">
              <StatItem icon={Trophy} label="Rank" value="#1,204" />
              <StatItem icon={BarChart} label="Solves" value="287" />
              <StatItem icon={Timer} label="Best" value="11.45s" />
              <StatItem icon={Timer} label="Avg" value="14.82s" />
            </div>
          </Card>

          <Card>
            <div className="card-header">
              <Swords size={20} color="var(--clr-indigo)" />
              Matchmaking
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn btn-primary" onClick={() => navigate('/singlePlayer')}>
                <Swords size={16} /> PLAY
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/multiPlayer')}>
                <Users size={16} /> MultiPlayer
              </button>
            </div>
          </Card>
        </div>

        {/* Main content */}
        <div className="main-content">
          <Card>
            <div className="card-header">
              <Activity size={20} color="var(--clr-indigo)" />
              Recent Matches
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentMatchesData.map((match, i) => (
                <li key={i} className={`recent-match ${match.result.toLowerCase()}`}>
                  <span>{match.opponent}</span>
                  <div style={{ textAlign: 'center' }}>
                    <span>{match.result}</span>
                    <div style={{ color: 'var(--clr-slate400)', fontFamily: 'monospace', fontSize: 'var(--size-sm)' }}>
                      {match.time} vs {match.opponentTime}
                    </div>
                  </div>
                  <button style={{ justifySelf: 'end', padding: '0.25em 0.75em', fontSize: 'var(--size-sm)', background: 'var(--clr-slate400)', borderRadius: '4px' }}>Details</button>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="card-header">
              <Trophy size={20} color="var(--clr-indigo)" />
              Global Leaderboard
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {leaderboardData.map(player => (
                <li key={player.rank} className={`leaderboard-item ${player.you ? 'you' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--clr-slate400)', fontStyle: 'italic', minWidth: '2ch', textAlign: 'center' }}>#{player.rank}</span>
                    <img src={`https://placehold.co/32x32/1e293b/f1f5f9?text=${player.name.charAt(0)}`} alt={`${player.name} avatar`} className="avatar-small" />
                    <span style={{ color: 'var(--clr-light)', fontWeight: '500' }}>{player.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {player.rank === 1 && <Crown size={16} color="#facc15" />}
                    <span style={{ color: 'var(--clr-rose)', fontWeight: 'bold', fontFamily: 'monospace' }}>{player.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
