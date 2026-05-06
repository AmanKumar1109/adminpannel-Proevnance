import { useState, useEffect } from 'react';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

export default function Home() {
  const [stats, setStats] = useState([
    {
      id: 'total',
      label: 'Total Registered',
      value: '...',
      icon: (
        <svg width="22" height="22" fill="none" stroke="#4f46e5" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
      color: '#f0eeff',
      iconBg: '#4f46e5',
    },
    {
      id: 'verified',
      label: 'Payments Verified',
      value: '...',
      icon: (
        <svg width="22" height="22" fill="none" stroke="#059669" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: '#ecfdf5',
      iconBg: '#059669',
    },
    {
      id: 'pending',
      label: 'Pending Verifications',
      value: '...',
      icon: (
        <svg width="22" height="22" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      color: '#fffbeb',
      iconBg: '#d97706',
    },
    {
      id: 'events',
      label: 'Total Events',
      value: '36',
      icon: (
        <svg width="22" height="22" fill="none" stroke="#7c3aed" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      color: '#f5f3ff',
      iconBg: '#7c3aed',
    },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersRef = collection(db, 'users');
        const [totalSnap, approvedSnap, pendingSnap] = await Promise.all([
          getCountFromServer(usersRef),
          getCountFromServer(query(usersRef, where('paymentStatus', '==', 'approved'))),
          getCountFromServer(query(usersRef, where('paymentStatus', '==', 'pending'))),
        ]);

        setStats(prev => prev.map(s => {
          if (s.id === 'total') return { ...s, value: totalSnap.data().count };
          if (s.id === 'verified') return { ...s, value: approvedSnap.data().count };
          if (s.id === 'pending') return { ...s, value: pendingSnap.data().count };
          return s;
        }));
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      {/* Welcome Banner */}
      <div style={styles.banner}>
        <div>
          <h2 style={styles.bannerTitle}>Welcome back, Admin 👋</h2>
          <p style={styles.bannerSub}>Here's what's happening with Provenance 6.0 today.</p>
        </div>
        <div style={styles.bannerBadge}>Live Event</div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} style={{ ...styles.statCard, backgroundColor: stat.color }}>
            <div style={styles.statTop}>
              <div style={styles.statIconWrap}>
                {stat.icon}
              </div>
              <span style={styles.statValue}>{stat.value}</span>
            </div>
            <p style={styles.statLabel}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Info */}
      <div style={styles.infoRow}>
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Quick Actions</h3>
          <div style={styles.actionList}>
            {['View all registrations', 'Verify pending payments', 'Export student data', 'Manage events'].map((action, i) => (
              <div key={i} style={styles.actionItem}>
                <div style={styles.actionDot} />
                <span style={styles.actionText}>{action}</span>
                <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>System Status</h3>
          <div style={styles.statusList}>
            {[
              { label: 'Firebase Database', ok: true },
              { label: 'Payment Gateway', ok: true },
              { label: 'Email Notifications', ok: false },
            ].map((s, i) => (
              <div key={i} style={styles.statusItem}>
                <div style={{ ...styles.statusDot, backgroundColor: s.ok ? '#10b981' : '#f59e0b' }} />
                <span style={styles.statusLabel}>{s.label}</span>
                <span style={{ ...styles.statusPill, backgroundColor: s.ok ? '#ecfdf5' : '#fffbeb', color: s.ok ? '#059669' : '#d97706' }}>
                  {s.ok ? 'Online' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  banner: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    borderRadius: '16px',
    padding: '28px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  bannerTitle: {
    color: '#fff',
    fontSize: '22px',
    fontWeight: '700',
    margin: '0 0 6px',
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    margin: 0,
  },
  bannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    borderRadius: '20px',
    padding: '6px 16px',
    fontSize: '13px',
    fontWeight: '600',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    borderRadius: '14px',
    padding: '20px',
    border: '1px solid rgba(0,0,0,0.05)',
  },
  statTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  statIconWrap: {
    display: 'flex',
    alignItems: 'center',
  },
  statValue: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1e1e2e',
  },
  statLabel: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
    fontWeight: '500',
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '22px',
    border: '1px solid #e8eaf0',
  },
  infoTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1e1e2e',
    margin: '0 0 16px',
  },
  actionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  actionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    ':hover': { backgroundColor: '#f9fafb' },
  },
  actionDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#4f46e5',
    flexShrink: 0,
  },
  actionText: {
    fontSize: '13px',
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  statusList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  statusLabel: {
    fontSize: '13px',
    color: '#374151',
    flex: 1,
  },
  statusPill: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '12px',
  },
};
