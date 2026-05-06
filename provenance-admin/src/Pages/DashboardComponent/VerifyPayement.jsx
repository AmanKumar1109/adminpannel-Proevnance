import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import axios from 'axios';

export default function VerifyPayement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | pending | verified

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStudents(data);
    } catch (err) {
      console.error('Error fetching:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleVerify = async (studentId) => {
    setVerifying(studentId);
    try {
      await updateDoc(doc(db, 'users', studentId), { paymentStatus: 'approved' });
      
      const student = students.find((s) => s.id === studentId);
      if (student) {
        try {
          await axios.post('http://localhost:5000/api/auth/send-email', {
            email: student.email,
            name: student.name,
            registerid: student.registerationId || student.id,
          });
        } catch (emailErr) {
          console.error('Failed to send verification email:', emailErr);
        }
      }

      setStudents((prev) =>
        prev.map((s) => s.id === studentId ? { ...s, paymentStatus: 'approved' } : s)
      );
    } catch (err) {
      alert('Failed to verify payment. Please try again.');
      console.error(err);
    } finally {
      setVerifying(null);
    }
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.transactionId || '').toLowerCase().includes(q) ||
      (s.registerationId || '').toLowerCase().includes(q) ||
      (s.mobile || '').toLowerCase().includes(q);
    const matchFilter =
      filter === 'all' ||
      (filter === 'pending' && s.paymentStatus !== 'approved') ||
      (filter === 'verified' && s.paymentStatus === 'approved');
    return matchSearch && matchFilter;
  });

  const pendingCount = students.filter((s) => s.paymentStatus !== 'approved').length;
  const verifiedCount = students.filter((s) => s.paymentStatus === 'approved').length;

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.pageHeading}>Verify Payments</h2>
          <p style={styles.pageSub}>Review and approve student payment submissions</p>
        </div>
        <button onClick={fetchStudents} style={styles.refreshBtn}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary Pills */}
      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryNum}>{students.length}</span>
          <span style={styles.summaryLabel}>Total</span>
        </div>
        <div style={{ ...styles.summaryCard, backgroundColor: '#fffbeb' }}>
          <span style={{ ...styles.summaryNum, color: '#d97706' }}>{pendingCount}</span>
          <span style={styles.summaryLabel}>Pending</span>
        </div>
        <div style={{ ...styles.summaryCard, backgroundColor: '#ecfdf5' }}>
          <span style={{ ...styles.summaryNum, color: '#059669' }}>{verifiedCount}</span>
          <span style={styles.summaryLabel}>Verified</span>
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.searchWrap}>
          <svg style={styles.searchIcon} width="15" height="15" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            style={styles.searchInput}
            placeholder="Search name, email, phone, transaction or reg ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={styles.filterRow}>
          {['all', 'pending', 'verified'].map((f) => (
            <button
              key={f}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={styles.emptyState}>
          <div style={styles.spinner} />
          <p style={styles.emptyText}>Loading registrations...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <svg width="48" height="48" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <p style={styles.emptyText}>{search ? 'No results found' : 'No entries in this category'}</p>
        </div>
      ) : (
        <div style={styles.cardGrid}>
          {filtered.map((s) => (
            <div key={s.id} style={styles.card}>
              {/* Card Top */}
              <div style={styles.cardTop}>
                <div style={styles.avatar}>
                  {(s.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={styles.cardName}>{s.name || 'Unknown'}</p>
                  <p style={styles.cardEmail}>{s.email || '—'}</p>
                </div>
                <span style={{
                  ...styles.statusPill,
                  backgroundColor: s.paymentStatus === 'approved' ? '#ecfdf5' : '#fffbeb',
                  color: s.paymentStatus === 'approved' ? '#059669' : '#d97706',
                }}>
                  {s.paymentStatus === 'approved' ? '✓ Verified' : '⏳ Pending'}
                </span>
              </div>

              {/* Details Grid */}
              <div style={styles.detailGrid}>
                <div style={styles.detailItem}>
                  <span style={styles.detailKey}>College</span>
                  <span style={styles.detailVal}>{s.collegeName || '—'} {s.collegeType && `(${s.collegeType})`}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailKey}>Branch & Year</span>
                  <span style={styles.detailVal}>{s.branch || '—'}, {s.year || '—'}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailKey}>Phone</span>
                  <span style={styles.detailVal}>{s.mobile || '—'}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailKey}>Amount</span>
                  <span style={{ ...styles.detailVal, color: '#4f46e5', fontWeight: '700' }}>
                    ₹900
                  </span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailKey}>Roll No</span>
                  <span style={styles.detailVal}>{s.rollNumber || '—'}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailKey}>T-Shirt Size</span>
                  <span style={styles.detailVal}>{s.tshirtSize ? s.tshirtSize.toUpperCase() : '—'}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailKey}>Reg ID</span>
                  <span style={styles.detailVal}>{s.registerationId || '—'}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailKey}>Payment App</span>
                  <span style={styles.detailVal}>{s.paymentApp || '—'}</span>
                </div>
                {s.transactionId && (
                  <div style={{ ...styles.detailItem, gridColumn: '1 / -1' }}>
                    <span style={styles.detailKey}>Transaction ID</span>
                    <span style={{ ...styles.detailVal, fontFamily: 'monospace', fontSize: '12px' }}>
                      {s.transactionId}
                    </span>
                  </div>
                )}
              </div>

              {/* Action */}
              {s.paymentStatus !== 'approved' && (
                <button
                  style={{
                    ...styles.verifyBtn,
                    opacity: verifying === s.id ? 0.7 : 1,
                    cursor: verifying === s.id ? 'not-allowed' : 'pointer',
                  }}
                  onClick={() => handleVerify(s.id)}
                  disabled={verifying === s.id}
                >
                  {verifying === s.id ? (
                    <>
                      <div style={styles.btnSpinner} />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Approve Payment
                    </>
                  )}
                </button>
              )}
              {s.paymentStatus === 'approved' && (
                <div style={styles.verifiedLabel}>
                  <svg width="15" height="15" fill="none" stroke="#059669" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Payment Approved
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  pageHeading: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e1e2e',
    margin: '0 0 4px',
  },
  pageSub: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
  },
  summaryRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  summaryCard: {
    backgroundColor: '#f0eeff',
    borderRadius: '12px',
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '100px',
    border: '1px solid rgba(0,0,0,0.04)',
  },
  summaryNum: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#4f46e5',
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
    marginTop: '2px',
  },
  controls: {
    display: 'flex',
    gap: '12px',
    marginBottom: '18px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  searchWrap: {
    position: 'relative',
    flex: 1,
    minWidth: '200px',
  },
  searchIcon: {
    position: 'absolute',
    left: '13px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px 10px 38px',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1e1e2e',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
  },
  filterRow: {
    display: 'flex',
    gap: '6px',
    backgroundColor: '#f4f6f9',
    padding: '4px',
    borderRadius: '10px',
  },
  filterBtn: {
    padding: '7px 16px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    fontSize: '13px',
    fontWeight: '500',
    color: '#6b7280',
    cursor: 'pointer',
  },
  filterBtnActive: {
    backgroundColor: '#ffffff',
    color: '#4f46e5',
    fontWeight: '600',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e8eaf0',
    gap: '14px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0,
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e8eaf0',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '18px',
    flexShrink: 0,
  },
  cardName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1e1e2e',
    margin: '0 0 2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardEmail: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  statusPill: {
    flexShrink: 0,
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    backgroundColor: '#f9fafb',
    borderRadius: '10px',
    padding: '14px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  detailKey: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailVal: {
    fontSize: '13px',
    color: '#374151',
    fontWeight: '500',
  },
  verifyBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '11px',
    fontSize: '13px',
    fontWeight: '600',
    width: '100%',
    transition: 'background 0.15s',
  },
  btnSpinner: {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  verifiedLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    color: '#059669',
    fontSize: '13px',
    fontWeight: '600',
    backgroundColor: '#ecfdf5',
    borderRadius: '10px',
    padding: '11px',
  },
};
