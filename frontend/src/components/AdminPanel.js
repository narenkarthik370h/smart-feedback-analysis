import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function AdminPanel() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [productFilter, setProductFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('All');

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    else if (!isAdmin) navigate('/dashboard');
    else fetchAllFeedbacks();
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    applyFilters();
  }, [feedbacks, sentimentFilter, productFilter, searchQuery, dateFilter]);

  const fetchAllFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/feedback');
      setFeedbacks(res.data.feedbacks);
      setError(null);
    } catch (err) {
      setError('Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...feedbacks];
    if (sentimentFilter !== 'All') filtered = filtered.filter(f => f.sentiment === sentimentFilter);
    if (productFilter !== 'All') filtered = filtered.filter(f => f.product === productFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f.name?.toLowerCase().includes(q) ||
        f.email?.toLowerCase().includes(q) ||
        f.message?.toLowerCase().includes(q) ||
        f.product?.toLowerCase().includes(q)
      );
    }
    if (dateFilter !== 'All') {
      const now = new Date();
      filtered = filtered.filter(f => {
        const fd = new Date(f.timestamp);
        if (dateFilter === 'Today') return fd.toDateString() === now.toDateString();
        if (dateFilter === 'This Week') return fd >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (dateFilter === 'This Month') return fd.getMonth() === now.getMonth() && fd.getFullYear() === now.getFullYear();
        return true;
      });
    }
    setFilteredFeedbacks(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      setDeleteLoading(id);
      await axios.delete(`http://localhost:5000/api/feedback/${id}`);
      setFeedbacks(feedbacks.filter(f => f._id !== id));
    } catch (err) {
      alert('Delete failed');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('⚠️ Delete ALL feedbacks?')) return;
    try {
      setLoading(true);
      await axios.delete('`${process.env.REACT_APP_API_URL}/api/feedback/clear');
      setFeedbacks([]);
      alert('✅ All cleared!');
    } catch (err) {
      alert('Clear failed');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentStyle = (s) => ({
    Positive: { color: '#4CAF50', emoji: '😊', bg: '#e8f5e9' },
    Negative: { color: '#F44336', emoji: '😡', bg: '#ffebee' },
    Neutral: { color: '#9E9E9E', emoji: '😐', bg: '#f5f5f5' }
  }[s] || { color: '#2196F3', emoji: '💬', bg: '#e3f2fd' });

  const formatDate = (t) => {
    if (!t) return 'No date';
    try {
      const d = new Date(t);
      return isNaN(d.getTime()) ? 'Invalid date' : d.toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch { return 'Invalid date'; }
  };

  const resetFilters = () => {
    setSentimentFilter('All');
    setProductFilter('All');
    setSearchQuery('');
    setDateFilter('All');
  };

  if (!isAuthenticated || !isAdmin) return null;

  const stats = {
    total: feedbacks.length,
    positive: feedbacks.filter(f => f.sentiment === 'Positive').length,
    negative: feedbacks.filter(f => f.sentiment === 'Negative').length,
    neutral: feedbacks.filter(f => f.sentiment === 'Neutral').length,
    filtered: filteredFeedbacks.length
  };

  return (
    <div style={s.cont}>
      <div style={s.hdr}>
        <div>
          <h1 style={s.title}>👨‍💼 Admin Panel</h1>
          <p style={s.sub}>Welcome, <strong>{user?.name}</strong></p>
        </div>
        <div style={s.acts}>
          <Link to="/" style={s.btn}>💬 Feedback</Link>
          <Link to="/dashboard" style={s.btn}>📊 Dashboard</Link>
          <button onClick={logout} style={{...s.btn, background: '#666'}}>🚪 Logout</button>
        </div>
      </div>

      <div style={s.body}>
        {loading ? (
          <div style={s.load}><div style={s.spin}></div><p>Loading...</p></div>
        ) : error ? (
          <div style={s.err}><p>⚠️ {error}</p><button onClick={fetchAllFeedbacks} style={s.retry}>🔄 Retry</button></div>
        ) : (
          <>
            <div style={s.stats}>
              {[
                { n: stats.total, l: 'Total', c: '#2196F3' },
                { n: stats.positive, l: 'Positive 😊', c: '#4CAF50' },
                { n: stats.negative, l: 'Negative 😡', c: '#F44336' },
                { n: stats.neutral, l: 'Neutral 😐', c: '#9E9E9E' }
              ].map((st, i) => (
                <div key={i} style={{...s.card, borderColor: st.c}}>
                  <div style={{...s.num, color: st.c}}>{st.n}</div>
                  <div style={s.lbl}>{st.l}</div>
                </div>
              ))}
            </div>

            <div style={s.filt}>
              <h3 style={s.fh}>🔍 Filters</h3>
              <div style={s.fg}>
                <div style={s.fi}>
                  <label style={s.fl}>🔎 Search</label>
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} 
                    placeholder="Search..." style={s.inp} />
                </div>
                <div style={s.fi}>
                  <label style={s.fl}>😊 Sentiment</label>
                  <select value={sentimentFilter} onChange={e => setSentimentFilter(e.target.value)} style={s.sel}>
                    <option value="All">All</option>
                    <option value="Positive">Positive 😊</option>
                    <option value="Negative">Negative 😡</option>
                    <option value="Neutral">Neutral 😐</option>
                  </select>
                </div>
                <div style={s.fi}>
                  <label style={s.fl}>📦 Product</label>
                  <select value={productFilter} onChange={e => setProductFilter(e.target.value)} style={s.sel}>
                    <option value="All">All Products</option>
                    <option value="Website">Website</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Product Quality">Product Quality</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={s.fi}>
                  <label style={s.fl}>📅 Date</label>
                  <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={s.sel}>
                    <option value="All">All Time</option>
                    <option value="Today">Today</option>
                    <option value="This Week">This Week</option>
                    <option value="This Month">This Month</option>
                  </select>
                </div>
                <div style={s.fi}>
                  <label style={s.fl}>&nbsp;</label>
                  <button onClick={resetFilters} style={s.reset}>🔄 Reset</button>
                </div>
              </div>
              <div style={s.info}>
                Showing <strong>{stats.filtered}</strong> of <strong>{stats.total}</strong> feedbacks
                {stats.filtered !== stats.total && <span style={{color: '#2196F3', fontWeight: '600'}}> (Filtered)</span>}
              </div>
            </div>

            <div style={s.bar}>
              <button onClick={fetchAllFeedbacks} style={s.ref}>🔄 Refresh</button>
              <button onClick={handleClearAll} style={s.clr}>🗑️ Clear All</button>
            </div>

            {filteredFeedbacks.length === 0 ? (
              <div style={s.emp}>
                <p style={{fontSize: '64px', margin: '0 0 20px'}}>📭</p>
                <p style={{color: '#666', fontSize: '18px'}}>
                  {feedbacks.length === 0 ? 'No feedbacks yet' : 'No matches'}
                </p>
              </div>
            ) : (
              <div style={s.list}>
                {filteredFeedbacks.map(fb => {
                  const ss = getSentimentStyle(fb.sentiment);
                  return (
                    <div key={fb._id} style={s.fcard}>
                      <div style={s.fh2}>
                        <div>
                          <div style={s.name}>👤 {fb.name || 'Anonymous'}</div>
                          <div style={s.email}>📧 {fb.email || 'No email'}</div>
                          <div style={s.prod}>📦 {fb.product || 'N/A'}</div>
                        </div>
                        <div style={{...s.badge, background: ss.bg, color: ss.color}}>
                          <span style={{fontSize: '20px', marginRight: '8px'}}>{ss.emoji}</span>
                          <strong>{fb.sentiment}</strong>
                        </div>
                      </div>
                      <div style={s.msg}>{fb.message}</div>
                      <div style={s.foot}>
                        <div style={s.meta}>
                          <span style={s.time}>🕐 {formatDate(fb.timestamp)}</span>
                          <span style={s.score}>Score: <strong>{fb.score || 'N/A'}</strong></span>
                        </div>
                        <button onClick={() => handleDelete(fb._id)} 
                          disabled={deleteLoading === fb._id}
                          style={{...s.del, opacity: deleteLoading === fb._id ? 0.6 : 1}}>
                          {deleteLoading === fb._id ? '⏳ Deleting...' : '🗑️ Delete'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  cont: { minHeight: '100vh', background: '#f5f5f5' },
  hdr: { background: 'white', padding: '20px 40px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#333', margin: 0 },
  sub: { color: '#666', marginTop: '5px', fontSize: '14px' },
  acts: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  btn: { padding: '10px 20px', background: '#667eea', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'inline-block' },
  body: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  load: { textAlign: 'center', padding: '60px 20px' },
  spin: { border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' },
  err: { textAlign: 'center', background: '#ffebee', padding: '40px', borderRadius: '12px', border: '2px solid #f44336' },
  retry: { padding: '12px 24px', background: '#f44336', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  card: { background: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '3px solid' },
  num: { fontSize: '42px', fontWeight: '700', marginBottom: '8px' },
  lbl: { fontSize: '14px', color: '#666', fontWeight: '600' },
  filt: { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' },
  fh: { fontSize: '20px', fontWeight: '700', color: '#333', marginBottom: '20px', marginTop: 0 },
  fg: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '15px' },
  fi: { display: 'flex', flexDirection: 'column', gap: '8px' },
  fl: { fontSize: '14px', fontWeight: '600', color: '#666' },
  inp: { padding: '10px 15px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  sel: { padding: '10px 15px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'white', cursor: 'pointer' },
  reset: { padding: '10px 20px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  info: { fontSize: '14px', color: '#666', padding: '10px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center' },
  bar: { display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '30px', padding: '15px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', flexWrap: 'wrap' },
  ref: { padding: '12px 24px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  clr: { padding: '12px 24px', background: '#f44336', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  emp: { textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px' },
  list: { display: 'flex', flexDirection: 'column', gap: '20px' },
  fcard: { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  fh2: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '15px' },
  name: { fontSize: '16px', fontWeight: '600', color: '#333' },
  email: { fontSize: '13px', color: '#666', marginTop: '3px' },
  prod: { fontSize: '13px', color: '#667eea', marginTop: '3px', fontWeight: '600' },
  badge: { padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center' },
  msg: { fontSize: '16px', lineHeight: '1.6', color: '#333', marginBottom: '15px', padding: '15px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '4px solid #667eea' },
  foot: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid #eee', flexWrap: 'wrap', gap: '15px' },
  meta: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  time: { fontSize: '13px', color: '#999' },
  score: { fontSize: '13px', color: '#666' },
  del: { padding: '8px 16px', background: '#f44336', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }
};

export default AdminPanel;