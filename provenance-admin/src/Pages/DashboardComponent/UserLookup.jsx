import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function UserLookup() {
  const [regId, setRegId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showEvents, setShowEvents] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = regId.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setUser(null);
    setShowEvents(false);

    try {
      const q = query(
        collection(db, 'users'),
        where('registerationId', '==', trimmed)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setError(`No user found with Registration ID "${trimmed}".`);
      } else {
        setUser({ id: snap.docs[0].id, ...snap.docs[0].data() });
      }
    } catch (err) {
      setError('Failed to fetch user. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'verified': return { color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' };
      case 'reviewing': return { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' };
      case 'outside-college': return { color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' };
      default: return { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' };
    }
  };

  return (
    <div style={s.container}>
      {/* Header */}
      <div className="admin-lookup-header" style={s.header}>
        <div className="admin-lookup-header-icon" style={s.headerIcon}>
          <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <div>
          <h2 className="admin-lookup-header-title" style={s.headerTitle}>User Lookup</h2>
          <p style={s.headerSub}>Search any participant by their Registration ID</p>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="admin-search-row" style={s.searchRow}>
        <div className="admin-input-wrap" style={s.inputWrap}>
          <span style={s.inputIcon}>
            <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            id="reg-id-input"
            style={s.input}
            type="text"
            placeholder="Enter Registration ID (e.g. AB1234)"
            value={regId}
            onChange={(e) => setRegId(e.target.value)}
            autoComplete="off"
          />
        </div>
        <button id="reg-search-btn" type="submit" style={s.searchBtn} disabled={loading}>
          {loading ? (
            <span style={s.spinner} />
          ) : (
            <>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search
            </>
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div style={s.errorBox}>
          <svg width="16" height="16" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* User Card */}
      {user && (
        <div style={s.card}>
          {/* User profile top */}
          <div className="admin-profile-top" style={s.profileTop}>
            <div style={s.avatarLarge}>
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={s.profileInfo}>
              <h3 style={s.userName}>{user.name || '—'}</h3>
              <p style={s.userEmail}>{user.email || '—'}</p>
              <div style={s.regBadge}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                ID: {user.registrationId}
              </div>
            </div>
            <div className="admin-pay-badge" style={{ ...s.payBadge, color: statusColor(user.paymentStatus).color, background: statusColor(user.paymentStatus).bg, border: `1px solid ${statusColor(user.paymentStatus).border}` }}>
              {user.paymentStatus || 'pending'}
            </div>
          </div>

          {/* Details Grid */}
          <div style={s.divider} />
          <div className="admin-user-grid" style={s.grid}>
            <InfoRow label="Mobile" value={user.mobile} />
            <InfoRow label="College Type" value={user.collegeType} />
            <InfoRow label="College Name" value={user.collegeName} />
            <InfoRow label="Branch" value={user.branch} />
            <InfoRow label="Year" value={user.year} />
            {user.collegeType === 'within' && (
              <>
                <InfoRow label="Roll Number" value={user.rollNumber} />
                <InfoRow label="T-Shirt Size" value={user.tshirtSize} />
              </>
            )}
            <InfoRow label="Payment App" value={user.paymentApp} />
            <InfoRow label="Transaction ID" value={user.transactionId} />
            <InfoRow label="Registered At" value={user.registeredAt?.toDate ? user.registeredAt.toDate().toLocaleString() : '—'} />
          </div>

          {/* Registered Events Button */}
          <div style={s.divider} />
          <div className="admin-events-section-header" style={s.eventsHeader}>
            <div style={s.eventsTitle}>
              <svg width="16" height="16" fill="none" stroke="#4f46e5" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Registered Events
              <span style={s.eventCount}>{(user.registeredEventsDetails || []).length}</span>
            </div>
            <button
              id="view-events-btn"
              style={s.eventsToggleBtn}
              onClick={() => setShowEvents(v => !v)}
            >
              {showEvents ? 'Hide Events ▲' : 'View Events ▼'}
            </button>
          </div>

          {/* Events List */}
          {showEvents && (
            <div className="admin-events-list" style={s.eventsList}>
              {(!user.registeredEventsDetails || user.registeredEventsDetails.length === 0) ? (
                <div style={s.emptyEvents}>No events registered yet.</div>
              ) : (
                user.registeredEventsDetails.map((ev, i) => (
                  <EventCard key={i} ev={ev} statusColor={statusColor} />
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="admin-user-info-row" style={s.infoRow}>
      <span style={s.infoLabel}>{label}</span>
      <span style={s.infoValue}>{value || '—'}</span>
    </div>
  );
}

function EventCard({ ev, statusColor }) {
  const sc = statusColor(ev.eventPaymentStatus);
  return (
    <div style={s.eventCard}>
      <div style={s.eventCardTop}>
        <span style={s.eventTitle}>{ev.title}</span>
        <span style={{ ...s.eventStatusBadge, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
          {ev.eventPaymentStatus || 'pending'}
        </span>
      </div>
      <div className="admin-event-meta" style={s.eventMeta}>
        <span>
          <strong>Enrolled:</strong> {ev.enrolledAt ? new Date(ev.enrolledAt).toLocaleString() : '—'}
        </span>
        <span>
          <strong>Fee:</strong> ₹{ev.entryFee ?? '—'}
        </span>
        <span>
          <strong>Team Entry:</strong> {ev.isTeamEntry ? 'Yes' : 'No'}
        </span>
      </div>
      {ev.isTeamEntry && (
        <div style={s.teamSection}>
          <p style={s.teamName}>Team: <strong>{ev.teamName || '—'}</strong></p>
          {ev.teamMembers && ev.teamMembers.length > 0 && (
            <div style={s.membersList}>
              {ev.teamMembers.map((m, i) => (
                <span key={i} style={s.memberChip}>
                  {typeof m === 'object' ? `${m.name} (${m.id})` : m}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  container: {
    maxWidth: '860px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '28px',
  },
  headerIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
  },
  headerTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e1e2e',
    margin: '0 0 2px',
  },
  headerSub: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
  },
  searchRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  inputWrap: {
    flex: 1,
    minWidth: '220px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    display: 'flex',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 40px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    color: '#1e1e2e',
    background: '#fff',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  searchBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
    transition: 'opacity 0.2s',
    flexShrink: 0,
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2.5px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 18px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    color: '#ef4444',
    fontSize: '14px',
    marginBottom: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '18px',
    border: '1px solid #e8eaf0',
    overflow: 'hidden',
    boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
  },
  profileTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    padding: '28px 28px 24px',
    flexWrap: 'wrap',
  },
  avatarLarge: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '26px',
    flexShrink: 0,
    boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
  },
  profileInfo: {
    flex: 1,
    minWidth: '160px',
  },
  userName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e1e2e',
    margin: '0 0 4px',
  },
  userEmail: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 8px',
    wordBreak: 'break-all',
  },
  regBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    background: '#f0eeff',
    color: '#4f46e5',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
  },
  payBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
    marginLeft: 'auto',
    flexShrink: 0,
  },
  divider: {
    height: '1px',
    background: '#f0f2f7',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '0',
    padding: '8px 0',
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'column',
    padding: '14px 28px',
    gap: '3px',
  },
  infoLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e1e2e',
    wordBreak: 'break-word',
  },
  eventsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 28px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  eventsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#1e1e2e',
  },
  eventCount: {
    background: '#4f46e5',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px',
    minWidth: '20px',
    textAlign: 'center',
  },
  eventsToggleBtn: {
    padding: '9px 18px',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 3px 10px rgba(79,70,229,0.25)',
    transition: 'opacity 0.2s',
  },
  eventsList: {
    padding: '0 28px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  emptyEvents: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
    padding: '20px 0',
  },
  eventCard: {
    border: '1.5px solid #e8eaf0',
    borderRadius: '14px',
    padding: '18px 20px',
    background: '#fafbff',
    transition: 'box-shadow 0.2s',
  },
  eventCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  eventTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1e1e2e',
  },
  eventStatusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  eventMeta: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  teamSection: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px dashed #e8eaf0',
  },
  teamName: {
    fontSize: '13px',
    color: '#4b5563',
    margin: '0 0 8px',
  },
  membersList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  memberChip: {
    padding: '4px 12px',
    background: '#f0eeff',
    color: '#4f46e5',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
  },
};
