import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

function FeedbackForm() {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [product, setProduct] = useState('');     // 👈 NEW STATE
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [sentimentResult, setSentimentResult] = useState(null);

  const { user, isAuthenticated } = useAuth();

  // Product options
  const productOptions = [
    'Website',
    'Mobile App',
    'Customer Service',
    'Product Quality',
    'Delivery',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/feedback', {
        name: isAuthenticated ? user.name : name,
        email: isAuthenticated ? user.email : email,
        product: product,                         // 👈 SEND PRODUCT
        message
      });

      setSentimentResult(res.data);
      setSuccess(true);
      setMessage('');
      setProduct('');                            // 👈 RESET PRODUCT
      if (!isAuthenticated) {
        setName('');
        setEmail('');
      }

      setTimeout(() => setSuccess(false), 5000);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return '😊';
      case 'Negative': return '😡';
      case 'Neutral': return '😐';
      default: return '💬';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return '#4CAF50';
      case 'Negative': return '#F44336';
      case 'Neutral': return '#9E9E9E';
      default: return '#2196F3';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>💬 Submit Feedback</h2>
          {isAuthenticated && (
            <p style={styles.welcomeText}>
              Welcome, <strong>{user.name}</strong>! 👋
            </p>
          )}
        </div>

        {success && sentimentResult && (
          <div style={{
            ...styles.success,
            borderColor: getSentimentColor(sentimentResult.sentiment)
          }}>
            <div style={styles.successHeader}>
              <span style={{ fontSize: '32px' }}>
                {getSentimentEmoji(sentimentResult.sentiment)}
              </span>
              <div>
                <div style={styles.successTitle}>Feedback Submitted!</div>
                <div style={styles.sentimentLabel}>
                  Sentiment: <strong style={{
                    color: getSentimentColor(sentimentResult.sentiment)
                  }}>
                    {sentimentResult.sentiment}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={styles.error}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isAuthenticated && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={styles.input}
                />
              </div>
            </>
          )}

          {}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              📦 Feedback For <span style={{color: '#f44336'}}>*</span>
            </label>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              required
              style={styles.select}
            >
              <option value="">-- Select Product/Service --</option>
              {productOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Your Feedback</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts, suggestions, or concerns..."
              required
              rows="6"
              style={styles.textarea}
            />
            <div style={styles.charCount}>
              {message.length} characters
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Submitting...' : '📤 Submit Feedback'}
          </button>
        </form>

        <div style={styles.footer}>
          {!isAuthenticated ? (
            <p style={styles.footerText}>
              Have an account?{' '}
              <Link to="/login" style={styles.link}>Login</Link>
              {' | '}
              <Link to="/register" style={styles.link}>Register</Link>
            </p>
          ) : (
            <p style={styles.footerText}>
              <Link to="/dashboard" style={styles.link}>
                📊 View Dashboard
              </Link>
              {' | '}
              <Link to="/history" style={styles.link}>
                📜 My Feedbacks
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#333'
  },
  welcomeText: {
    color: '#666',
    fontSize: '16px'
  },
  success: {
    background: '#e8f5e9',
    border: '2px solid #4CAF50',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px'
  },
  successHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  successTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: '5px'
  },
  sentimentLabel: {
    fontSize: '14px',
    color: '#555'
  },
  error: {
    background: '#fee',
    border: '2px solid #f44336',
    color: '#c62828',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  input: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border 0.3s',
    fontFamily: 'inherit'
  },
  select: {                                     
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border 0.3s',
    fontFamily: 'inherit',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  textarea: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: '1.5'
  },
  charCount: {
    fontSize: '12px',
    color: '#999',
    textAlign: 'right'
  },
  button: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    marginTop: '10px'
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center'
  },
  footerText: {
    color: '#666',
    fontSize: '14px'
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

export default FeedbackForm;