import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function UserHistory() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchHistory();
    }
  }, [isAuthenticated, navigate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/feedback/my-feedbacks`);
      setFeedbacks(res.data.feedbacks);
      setError(null);
    } catch (err) {
      setError('Failed to load feedback history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentStyle = (sentiment) => {
    switch (sentiment) {
      case 'Positive':
        return { color: '#4CAF50', emoji: '😊', bg: '#e8f5e9' };
      case 'Negative':
        return { color: '#F44336', emoji: '😡', bg: '#ffebee' };
      case 'Neutral':
        return { color: '#9E9E9E', emoji: '😐', bg: '#f5f5f5' };
      default:
        return { color: '#2196F3', emoji: '💬', bg: '#e3f2fd' };
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>📜 My Feedback History</h1>
          <p style={styles.headerSubtitle}>
            Welcome, <strong>{user?.name}</strong>
          </p>
        </div>
        <div style={styles.headerActions}>
          <Link to="/" style={styles.linkButton}>
            💬 Submit Feedback
          </Link>
          <Link to="/dashboard" style={styles.linkButton}>
            📊 Dashboard
          </Link>
          <button onClick={logout} style={styles.logoutButton}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading your feedbacks...</p>
          </div>
        ) : error ? (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>⚠️ {error}</p>
            <button onClick={fetchHistory} style={styles.retryButton}>
              🔄 Retry
            </button>
          </div>
        ) : feedbacks.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyEmoji}>📭</p>
            <p style={styles.emptyText}>You haven't submitted any feedback yet</p>
            <Link to="/" style={styles.linkButton}>
              💬 Submit Your First Feedback
            </Link>
          </div>
        ) : (
          <>
            <div style={styles.statsBar}>
              <div style={styles.totalCount}>
                Total Feedbacks: <strong>{feedbacks.length}</strong>
              </div>
              <button onClick={fetchHistory} style={styles.refreshButton}>
                🔄 Refresh
              </button>
            </div>

            <div style={styles.feedbackList}>
              {feedbacks.map((feedback) => {
                const sentimentStyle = getSentimentStyle(feedback.sentiment);
                return (
                  <div key={feedback._id} style={styles.feedbackCard}>
                    <div style={styles.feedbackHeader}>
                      <div style={{
                        ...styles.sentimentBadge,
                        background: sentimentStyle.bg,
                        color: sentimentStyle.color
                      }}>
                        <span style={{ fontSize: '20px', marginRight: '8px' }}>
                          {sentimentStyle.emoji}
                        </span>
                        <strong>{feedback.sentiment}</strong>
                      </div>
                      <div style={styles.timestamp}>
                        🕐 {formatDate(feedback.timestamp)}
                      </div>
                    </div>

                    <div style={styles.feedbackMessage}>
                      {feedback.message}
                    </div>

                    <div style={styles.feedbackFooter}>
                      <div style={styles.scoreInfo}>
                        Score: <strong>{feedback.score}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
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
    margin: 0
  },
  headerSubtitle: {
    color: '#666',
    marginTop: '5px',
    fontSize: '14px'
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
    border: 'none',
    cursor: 'pointer',
    display: 'inline-block'
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
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px'
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
    padding: '60px 20px'
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
  statsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  totalCount: {
    fontSize: '16px',
    color: '#666'
  },
  refreshButton: {
    padding: '10px 20px',
    background: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  feedbackList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  feedbackCard: {
    background: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  feedbackHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  sentimentBadge: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center'
  },
  timestamp: {
    fontSize: '13px',
    color: '#999'
  },
  feedbackMessage: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#333',
    marginBottom: '15px',
    padding: '15px',
    background: '#f9f9f9',
    borderRadius: '8px',
    borderLeft: '4px solid #667eea'
  },
  feedbackFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '15px',
    borderTop: '1px solid #eee'
  },
  scoreInfo: {
    fontSize: '14px',
    color: '#666'
  }
};

export default UserHistory;