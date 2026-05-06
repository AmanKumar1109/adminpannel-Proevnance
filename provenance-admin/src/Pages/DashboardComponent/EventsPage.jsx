import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, getCountFromServer } from 'firebase/firestore';
import { db } from '../../firebase';

const EVENT_NAMES = [
  "Eminence in Prompt",
  "Shinobi Script",
  "Mangaka's Edge",
  "Hunter Rank: PRO",
  "Frag-Ops: PC Gaming",
  "Trigger-Point: BGMI Arena",
  "Colors of Konoha",
  "Sage Mode: Trivia",
  "Paper Dance",
  "Street Reloaded",
  "Solo Song",
  "Dressing My Darling",
  "My Dance Academia",
  "Komi Can Paint",
  "Jojo's Bizarre Walk",
  "Sharingan Lens",
  "Infinite Scroll",
  "Ai X Film",
  "Food Wars",
  "Street Strikers",
  "Slam Dunk",
  "Karasuno Smash",
  "Bluelock",
  "Tug Of Titans",
  "Iron Grip",
  "Attack On Chairs",
  "Gundam Architecture",
  "Shikamaru's Cube",
  "Cyber-Runner: Edge",
  "Fullmetal Kick Off",
  "Gundam: Last Stand",
  "Shinobi Balloon Smash",
  "Finding One Piece",
  "Senku's Bridge",
  "Debate Competition",
  "Flip & Win"
];

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // States for Events Grid
  const [counts, setCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  // States for Event Details
  const [students, setStudents] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch all counts on mount
  useEffect(() => {
    const fetchCounts = async () => {
      setLoadingCounts(true);
      const newCounts = {};
      try {
        await Promise.all(
          EVENT_NAMES.map(async (eventName) => {
            try {
              const collRef = collection(db, eventName);
              const snapshot = await getCountFromServer(collRef);
              newCounts[eventName] = snapshot.data().count;
            } catch (err) {
              console.error(`Error fetching count for ${eventName}`, err);
              newCounts[eventName] = 0;
            }
          })
        );
        setCounts(newCounts);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoadingCounts(false);
      }
    };
    fetchCounts();
  }, []);

  const handleEventClick = async (eventName) => {
    setSelectedEvent(eventName);
    setSearch('');
    setStudents([]);
    setLoadingDetails(true);

    try {
      const snap = await getDocs(collection(db, eventName));
      const enrolledData = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Fetch payment status for each user
      const enrichedData = await Promise.all(
        enrolledData.map(async (student) => {
          let paymentStatus = 'pending';
          if (student.uid) {
            try {
              const userSnap = await getDoc(doc(db, 'users', student.uid));
              if (userSnap.exists()) {
                paymentStatus = userSnap.data().paymentStatus || 'pending';
              }
            } catch (e) {
              console.error(`Error fetching user ${student.uid}`, e);
            }
          }
          return { ...student, paymentStatus };
        })
      );
      setStudents(enrichedData);
    } catch (err) {
      console.error('Error fetching event details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.mobile || '').toLowerCase().includes(q) ||
      (s.registerationId || '').toLowerCase().includes(q)
    );
  });

  // Render Grid
  if (!selectedEvent) {
    return (
      <div>
        <div style={styles.header}>
          <div>
            <h2 style={styles.pageHeading}>Events Overview</h2>
            <p style={styles.pageSub}>Select an event to view registered students</p>
          </div>
          <div style={styles.countBadge}>{EVENT_NAMES.length} Events</div>
        </div>

        {loadingCounts ? (
          <div style={styles.emptyState}>
            <div style={styles.spinner} />
            <p style={styles.emptyText}>Loading events...</p>
          </div>
        ) : (
          <div style={styles.eventGrid}>
            {EVENT_NAMES.map((name) => (
              <div key={name} style={styles.eventCard} onClick={() => handleEventClick(name)}>
                <div style={styles.eventCardTop}>
                  <div style={styles.eventIcon}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <span style={styles.eventCount}>{counts[name] || 0} Registered</span>
                </div>
                <h3 style={styles.eventName}>{name}</h3>
                <div style={styles.eventFooter}>
                  <span>View Details</span>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Details
  return (
    <div>
      {/* Back & Header */}
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => setSelectedEvent(null)}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </button>
          <h2 style={styles.pageHeading}>{selectedEvent}</h2>
          <p style={styles.pageSub}>Registered participants list</p>
        </div>
        <div style={styles.countBadge}>{students.length} Registered</div>
      </div>

      {/* Search */}
      <div style={styles.searchWrap}>
        <svg style={styles.searchIcon} width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          style={styles.searchInput}
          placeholder="Search by name, email, phone or reg ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        {loadingDetails ? (
          <div style={styles.emptyState}>
            <div style={styles.spinner} />
            <p style={styles.emptyText}>Loading participants...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={styles.emptyState}>
            <svg width="48" height="48" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <p style={styles.emptyText}>{search ? 'No results found' : 'No registrations yet'}</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['#', 'Name', 'Email', 'Phone', 'Reg ID', 'Date', 'Payment Status'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, idx) => {
                const isApproved = s.paymentStatus === 'approved';
                return (
                  <tr key={s.id} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.td}>{idx + 1}</td>
                    <td style={styles.tdBold}>{s.name || '—'}</td>
                    <td style={styles.td}>{s.email || '—'}</td>
                    <td style={styles.td}>{s.mobile || '—'}</td>
                    <td style={styles.td}>{s.registerationId || '—'}</td>
                    <td style={styles.td}>
                      {s.enrolledAt ? new Date(s.enrolledAt.toDate ? s.enrolledAt.toDate() : s.enrolledAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusChip,
                        backgroundColor: isApproved ? '#ecfdf5' : '#fffbeb',
                        color: isApproved ? '#059669' : '#d97706',
                      }}>
                        {isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
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
  countBadge: {
    backgroundColor: '#f0eeff',
    color: '#4f46e5',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#4f46e5',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0 0 12px',
  },
  eventGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  eventCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e8eaf0',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  eventCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  eventIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#f5f3ff',
    color: '#7c3aed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCount: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#4f46e5',
    backgroundColor: '#f0eeff',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  eventName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1e1e2e',
    margin: '0 0 16px',
    lineHeight: '1.4',
    flex: 1,
  },
  eventFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f0f2f7',
    paddingTop: '12px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#6b7280',
  },
  searchWrap: {
    position: 'relative',
    marginBottom: '16px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '11px 14px 11px 42px',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1e1e2e',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
  },
  tableWrap: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e8eaf0',
    overflow: 'auto',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    gap: '14px',
    gridColumn: '1 / -1',
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
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '700px',
  },
  th: {
    padding: '13px 18px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #f0f2f7',
  },
  td: {
    padding: '13px 18px',
    fontSize: '13px',
    color: '#6b7280',
    borderBottom: '1px solid #f9fafb',
  },
  tdBold: {
    padding: '13px 18px',
    fontSize: '13px',
    color: '#1e1e2e',
    fontWeight: '600',
    borderBottom: '1px solid #f9fafb',
  },
  trEven: { backgroundColor: '#ffffff' },
  trOdd: { backgroundColor: '#fafafa' },
  statusChip: {
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
};
