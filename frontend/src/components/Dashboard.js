import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ positive: 0, negative: 0, neutral: 0, total: 0 });

  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchSummary();
    }
  }, [isAuthenticated, navigate]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      
      let endpoint;
      if (isAdmin) {
        endpoint = `${process.env.REACT_APP_API_URL}/api/feedback/summary`;
      } else {
        endpoint = `${process.env.REACT_APP_API_URL}/api/feedback/my-summary`;
      }
      
      const res = await axios.get(endpoint);
      
      const positive = res.data.positive || 0;
      const negative = res.data.negative || 0;
      const neutral = res.data.neutral || 0;
      
      setStats({
        positive,
        negative,
        neutral,
        total: positive + negative + neutral
      });

      setChartData({
        labels: ['Positive 😊', 'Negative 😡', 'Neutral 😐'],
        datasets: [
          {
            data: [positive, negative, neutral],
            backgroundColor: ['#4CAF50', '#F44336', '#9E9E9E'],
            borderColor: ['#45a049', '#da190b', '#757575'],
            borderWidth: 2,
            hoverOffset: 12,
            hoverBorderWidth: 3,
          },
        ],
      });
      setError(null);
    } catch (err) {
      console.error('Chart fetch error:', err);
      setError('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>
            📊 Dashboard
            {isAdmin && <span style={styles.adminBadge}>👑 Admin</span>}
          </h1>
          <p style={styles.headerSubtitle}>
            Welcome back, <strong>{user?.name}</strong>!
          </p>
        </div>
        <div style={styles.headerActions}>
          <Link to="/" style={styles.linkButton}>
            💬 Submit Feedback
          </Link>
          <Link to="/history" style={styles.linkButton}>
            📜 My History
          </Link>
          
          {/* 🎯 ADMIN PANEL BUTTON */}
          {isAdmin && (
            <Link to="/admin" style={{...styles.linkButton, background: '#f44336'}}>
              👨‍💼 Admin Panel
            </Link>
          )}
          
          <button onClick={logout} style={styles.logoutButton}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Info Banner */}
        <div style={styles.infoBanner}>
          {isAdmin ? (
            <>
              <span style={styles.infoIcon}>👨‍💼</span>
              <span>Showing <strong>ALL feedbacks</strong> from all users (Admin View)</span>
            </>
          ) : (
            <>
              <span style={styles.infoIcon}>👤</span>
              <span>Showing <strong>YOUR feedbacks</strong> only</span>
            </>
          )}
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading sentiment data...</p>
          </div>
        ) : error ? (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>⚠️ {error}</p>
            <button onClick={fetchSummary} style={styles.retryButton}>
              🔄 Retry
            </button>
          </div>
        ) : stats.total === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyEmoji}>📊</p>
            <p style={styles.emptyText}>
              {isAdmin 
                ? 'No feedback data available yet' 
                : 'You haven\'t submitted any feedback yet'}
            </p>
            <Link to="/" style={styles.linkButton}>
              💬 Submit First Feedback
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div style={styles.statsGrid}>
              <div style={{...styles.statCard, borderColor: '#2196F3'}}>
                <div style={styles.statNumber}>{stats.total}</div>
                <div style={styles.statLabel}>
                  {isAdmin ? 'Total Feedbacks' : 'My Feedbacks'}
                </div>
              </div>
              <div style={{...styles.statCard, borderColor: '#4CAF50'}}>
                <div style={{...styles.statNumber, color: '#4CAF50'}}>{stats.positive}</div>
                <div style={styles.statLabel}>Positive 😊</div>
              </div>
              <div style={{...styles.statCard, borderColor: '#F44336'}}>
                <div style={{...styles.statNumber, color: '#F44336'}}>{stats.negative}</div>
                <div style={styles.statLabel}>Negative 😡</div>
              </div>
              <div style={{...styles.statCard, borderColor: '#9E9E9E'}}>
                <div style={{...styles.statNumber, color: '#9E9E9E'}}>{stats.neutral}</div>
                <div style={styles.statLabel}>Neutral 😐</div>
              </div>
            </div>

            {/* Chart */}
            <div style={styles.chartContainer}>
              <h2 style={styles.chartTitle}>
                {isAdmin ? 'Overall Sentiment Distribution' : 'My Sentiment Distribution'}
              </h2>
              <div style={styles.chartWrapper}>
                <Pie
                  data={chartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: '#333',
                          font: { size: 14, weight: '600' },
                          padding: 15,
                          usePointStyle: true,
                          pointStyle: 'circle',
                        },
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        padding: 12,
                        titleFont: { size: 14, weight: '600' },
                        bodyFont: { size: 13 },
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    },
                  }}
                />
              </div>
              <button onClick={fetchSummary} style={styles.refreshButton}>
                🔄 Refresh Data
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  header: {
    background: 'white',
    padding: '20px 40px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  headerSubtitle: {
    color: '#666',
    marginTop: '5px',
    fontSize: '14px'
  },
  adminBadge: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    marginLeft: '10px'
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  linkButton: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'transform 0.2s',
    display: 'inline-block',
    border: 'none',
    cursor: 'pointer'
  },
  logoutButton: {
    padding: '10px 20px',
    background: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  // 🎯 INFO BANNER
  infoBanner: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '15px 25px',
    borderRadius: '12px',
    marginBottom: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '15px',
    fontWeight: '500',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
  },
  infoIcon: {
    fontSize: '24px'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  loadingText: {
    color: '#666',
    fontSize: '16px'
  },
  errorBox: {
    textAlign: 'center',
    background: '#ffebee',
    padding: '40px',
    borderRadius: '12px',
    border: '2px solid #f44336'
  },
  errorText: {
    color: '#c62828',
    fontSize: '16px',
    marginBottom: '20px'
  },
  retryButton: {
    padding: '12px 24px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  emptyEmoji: {
    fontSize: '64px',
    margin: '0 0 20px 0'
  },
  emptyText: {
    color: '#666',
    fontSize: '18px',
    marginBottom: '30px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  statCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    border: '3px solid',
    transition: 'transform 0.3s ease'
  },
  statNumber: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: '10px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '600'
  },
  chartContainer: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  chartTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '30px',
    textAlign: 'center'
  },
  chartWrapper: {
    maxWidth: '500px',
    height: '500px',
    margin: '0 auto 30px'
  },
  refreshButton: {
    display: 'block',
    margin: '0 auto',
    padding: '12px 24px',
    background: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.3s ease'
  }
};

export default Dashboard;