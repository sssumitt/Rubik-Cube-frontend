import { useState, useEffect } from 'react';
import { User, Trophy, BarChart, Timer, Swords, Users, Crown, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardData } from '../../api/stats';
import { useAuth } from '../../context/AuthContext';
import './DashBoardPage.css';

const StatItem = ({ icon: Icon, label, value }) => (
  <div className="stat-item">
    <Icon size={20} color="var(--clr-slate400)" />
    <p>{label}: <span>{value}</span></p>
  </div>
);

const Card = ({ children }) => <div className="card">{children}</div>;

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ rank: '-', solves: 0, bestTime: '-', avgTime: '-' });
  const [recentMatches, setRecentMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        console.log("Dashboard Data Received:", data);
        setStats(data.stats);
        setRecentMatches(data.recentMatches);
        setLeaderboard(data.leaderboard);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading stats...</div>;

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
              <img src={`https://placehold.co/64x64/4f46e5/f1f5f9?text=${user?.username?.charAt(0).toUpperCase() || 'U'}`} alt="Player Avatar" className="avatar-large" />
              <div>
                <h2 style={{ fontSize: 'var(--size-xl)', color: 'var(--clr-light)' }}>{user?.username || 'Player'}</h2>
                <p style={{ color: '#22c55e', fontSize: 'var(--size-sm)', fontWeight: 'bold' }}>● Online</p>
              </div>
            </div>
            <div className="stats-grid">
              <StatItem icon={Trophy} label="Rank" value={`#${stats.rank}`} />
              <StatItem icon={BarChart} label="Wins" value={stats.solves} />
              <StatItem icon={Timer} label="Best" value={stats.bestTime} />
              <StatItem icon={Timer} label="Avg" value={stats.avgTime} />
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
            {recentMatches.length === 0 ? (
              <p style={{ color: 'var(--clr-slate400)', textAlign: 'center', padding: '1rem' }}>No recent matches found.</p>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentMatches.map((match, i) => (
                  <li key={i} className={`recent-match ${match.result.toLowerCase() === 'won' ? 'won' : 'lost'}`}>
                    <div className="match-info">
                      <span className="match-opponent">vs {match.opponent}</span>
                      <span className="match-date">{new Date(match.date).toLocaleDateString()}</span>
                    </div>
                    <span className="match-result">{match.result}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <div className="card-header">
              <Trophy size={20} color="var(--clr-indigo)" />
              Global Leaderboard
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {leaderboard.map(player => (
                <li key={player.rank} className={`leaderboard-item ${player.you ? 'you' : ''}`}>
                  <div className="player-info">
                    <span className="rank-badge">#{player.rank}</span>
                    <img src={`https://placehold.co/32x32/1e293b/f1f5f9?text=${player.name.charAt(0)}`} alt={`${player.name} avatar`} className="avatar-small" />
                    <span className="player-name">{player.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {player.rank === 1 && <Crown size={16} color="#facc15" />}
                    <span className="score-display">{player.time}</span>
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
