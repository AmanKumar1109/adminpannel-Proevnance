import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, getCountFromServer } from 'firebase/firestore';
import { db } from '../../firebase';

const EVENT_NAMES = [
  // HELIX — Tech & AI Club
  "Eminence in Prompt",
  "Shinobi Script",
  "Mangaka's Edge",
  "Hunter Rank: PRO",
  "Frag-Ops: PC Gaming",
  "Trigger-Point: BGMI Arena",
  "Colors of Konoha",
  "Sage Mode: Trivia",
  "Talk-no-Jutsu",
  // TARANGINI — Cultural Club
  "Paper Dance",
  "DandaDance (Street Reloaded)",
  "Karaoke-ON — Solo Singing",
  "Dressing My Darling",
  "My Dance Academia — Group Dance",
  "Komi Can Paint",
  "Jojo's Bizarre Walk",
  // XPECTRA — Media & Digital Creative
  "Sharingan Lens",
  "Infinite Scroll",
  "Ai X Film",
  "Food Wars",
  // RVS PANTHERS — Sports Club
  "Street Strikers",
  "Slam Dunk",
  "Karasuno Smash",
  "Bluelock",
  "Tug Of Titans",
  "Iron Grip",
  "Attack On Chairs",
  "Kaminari-Strike: (Supersixes)",
  // CIRCUITRON — Robotics & IoT Club
  "Gundam Architecture",
  "Shikamaru's Cube",
  "Cyber-Runner: Edge",
  "Fullmetal Kick Off",
  "Gundam: Last Stand",
  "Shinobi Balloon Smash",
  "The Labyrinth",
  "Senku's Bridge",
  // INDEPENDENT EVENTS
  "Flip & Win"
];

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // States for Events Grid
  const [counts, setCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [eventSearch, setEventSearch] = useState('');

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

      // Fetch user profile data to enrich event enrollment data with all architecture fields
      const enrichedData = await Promise.all(
        enrolledData.map(async (student) => {
          let userProfileData = {};
          if (student.uid) {
            try {
              const userSnap = await getDoc(doc(db, 'users', student.uid));
              if (userSnap.exists()) {
                userProfileData = userSnap.data();
              }
            } catch (e) {
              console.error(`Error fetching user ${student.uid}`, e);
            }
          }

          // Resolve primary fields fallback between student event record and user document
          const regId = student.registrationId || student.registerationId || userProfileData.registrationId || userProfileData.registerationId || '—';
          
          let evtPayStatus = student.eventPaymentStatus;
          let entryFee = student.entryFee;
          let transactionId = student.transactionId || userProfileData.transactionId;
          let paymentApp = student.paymentApp || userProfileData.paymentApp;

          // If entry fee/event payment status is missing on student doc, check registeredEventsDetails array in global user profile
          if (userProfileData.registeredEventsDetails) {
            const foundDetail = userProfileData.registeredEventsDetails.find(d => d.title === eventName);
            if (foundDetail) {
              if (!evtPayStatus) evtPayStatus = foundDetail.eventPaymentStatus;
              if (entryFee === undefined) entryFee = foundDetail.entryFee;
              if (foundDetail.transactionId) transactionId = foundDetail.transactionId;
              if (foundDetail.paymentApp) paymentApp = foundDetail.paymentApp;
            }
          }

          return {
            ...student,
            userFallbackData: userProfileData,
            collegeType: student.collegeType || userProfileData.collegeType || 'within',
            collegeName: student.collegeName || userProfileData.collegeName || 'N/A',
            branch: student.branch || userProfileData.branch || 'N/A',
            year: student.year || userProfileData.year || 'N/A',
            rollNumber: student.rollNumber || userProfileData.rollNumber || 'N/A',
            tshirtSize: student.tshirtSize || userProfileData.tshirtSize || 'N/A',
            paymentStatus: userProfileData.paymentStatus || 'pending', // Global Base Registration Status
            eventPaymentStatus: evtPayStatus || (entryFee ? 'pending' : 'verified'),
            entryFee: entryFee || 0,
            transactionId: transactionId || '—',
            paymentApp: paymentApp || '—',
            regId,
          };
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
      (s.regId || '').toLowerCase().includes(q) ||
      (s.registerationId || '').toLowerCase().includes(q) ||
      (s.teamName || '').toLowerCase().includes(q) ||
      (s.collegeName || '').toLowerCase().includes(q) ||
      (s.branch || '').toLowerCase().includes(q) ||
      (s.transactionId || '').toLowerCase().includes(q)
    );
  });

  // Filter events by search query
  const filteredEvents = EVENT_NAMES.filter((name) =>
    name.toLowerCase().includes(eventSearch.toLowerCase())
  );

  // Render Grid
  if (!selectedEvent) {
    return (
      <div>
        <div className="admin-events-header" style={styles.header}>
          <div>
            <h2 style={styles.pageHeading}>Events Overview</h2>
            <p style={styles.pageSub}>Select an event to view registered students</p>
          </div>
          <div style={styles.countBadge}>{filteredEvents.length} / {EVENT_NAMES.length} Events</div>
        </div>

        {/* Event Search Bar */}
        <div style={styles.searchWrap}>
          <svg style={styles.searchIcon} width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            style={styles.searchInput}
            placeholder="Search events by name..."
            value={eventSearch}
            onChange={(e) => setEventSearch(e.target.value)}
          />
          {eventSearch && (
            <button
              onClick={() => setEventSearch('')}
              style={styles.searchClear}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {loadingCounts ? (
          <div style={styles.emptyState}>
            <div style={styles.spinner} />
            <p style={styles.emptyText}>Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No events match "{eventSearch}"</p>
          </div>
        ) : (
          <div className="admin-event-grid" style={styles.eventGrid}>
            {filteredEvents.map((name) => (
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
      <div className="admin-events-header" style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => setSelectedEvent(null)}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </button>
          <h2 style={styles.pageHeading}>{selectedEvent}</h2>
          <p style={styles.pageSub}>Registered participants list enriched with full profile & team details</p>
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
          placeholder="Search by name, email, phone, reg ID, college, branch or TXN ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        {loadingDetails ? (
          <div style={styles.emptyState}>
            <div style={styles.spinner} />
            <p style={styles.emptyText}>Loading participants & enriching profiles...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={styles.emptyState}>
            <svg width="48" height="48" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <p style={styles.emptyText}>{search ? 'No results found matching your search' : 'No registrations yet for this event'}</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Participant / Team</th>
                <th style={styles.th}>Contact Info</th>
                <th style={styles.th}>Academic Details</th>
                <th style={styles.th}>Event Entry & Fee</th>
                <th style={styles.th}>Base Reg Status</th>
                <th style={styles.th}>Enrolled Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, idx) => {
                const isBaseVerified = s.paymentStatus === 'verified' || s.paymentStatus === 'approved';
                return (
                  <tr key={s.id} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.td}>{idx + 1}</td>
                    
                    {/* Participant / Team */}
                    <td style={styles.tdWrapper}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '600', color: '#1e1e2e', fontSize: '14px' }}>{s.name || '—'}</span>
                          <span style={{ fontSize: '11px', background: '#f0eeff', color: '#4f46e5', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
                            ID: {s.regId}
                          </span>
                          {s.role && (
                            <span style={{ fontSize: '10px', background: '#e0e7ff', color: '#3730a3', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
                              {s.role}
                            </span>
                          )}
                        </div>

                        {s.isTeamEntry && (
                          <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #e8eaf0', fontSize: '12px', color: '#4b5563' }}>
                            <div>Team Name: <strong style={{ color: '#1e1e2e' }}>{s.teamName || 'N/A'}</strong> {s.teamType && <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280' }}>({s.teamType})</span>}</div>
                            {s.teamMembers && s.teamMembers.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', color: '#9ca3af' }}>Teammate IDs:</span>
                                {s.teamMembers.map((mId, mIdx) => (
                                  <span key={mIdx} style={{ fontSize: '10px', background: '#f3f4f6', color: '#374151', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                                    {typeof mId === 'object' ? mId.id || mId.name : mId}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td style={styles.tdWrapper}>
                      <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                        <div>📧 {s.email || '—'}</div>
                        <div>📞 {s.mobile || '—'}</div>
                      </div>
                    </td>

                    {/* Academic Details */}
                    <td style={styles.tdWrapper}>
                      <div style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.4' }}>
                        <div style={{ fontWeight: '500', color: '#1e1e2e' }}>{s.collegeName || 'N/A'}</div>
                        <div><span style={{ color: '#9ca3af' }}>Branch:</span> {s.branch || 'N/A'} • <span style={{ color: '#9ca3af' }}>Year:</span> {s.year || 'N/A'}</div>
                        {s.collegeType === 'within' && (
                          <div style={{ display: 'flex', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '10px', background: '#f3f4f6', padding: '1px 5px', borderRadius: '4px', color: '#4b5563' }}>Roll: {s.rollNumber || 'N/A'}</span>
                            {s.tshirtSize && s.tshirtSize !== 'N/A' && <span style={{ fontSize: '10px', background: '#f3f4f6', padding: '1px 5px', borderRadius: '4px', color: '#4b5563' }}>T-Shirt: {s.tshirtSize}</span>}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Event Entry & Fee */}
                    <td style={styles.tdWrapper}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: s.entryFee > 0 ? '#d97706' : '#059669' }}>
                            {s.entryFee > 0 ? `₹${s.entryFee}` : 'Free Entry'}
                          </span>
                          {s.entryFee > 0 && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              padding: '2px 6px',
                              borderRadius: '10px',
                              backgroundColor: s.eventPaymentStatus === 'verified' ? '#ecfdf5' : s.eventPaymentStatus === 'reviewing' ? '#eff6ff' : '#fffbeb',
                              color: s.eventPaymentStatus === 'verified' ? '#059669' : s.eventPaymentStatus === 'reviewing' ? '#2563eb' : '#d97706',
                              border: `1px solid ${s.eventPaymentStatus === 'verified' ? '#a7f3d0' : s.eventPaymentStatus === 'reviewing' ? '#bfdbfe' : '#fde68a'}`
                            }}>
                              {s.eventPaymentStatus}
                            </span>
                          )}
                        </div>
                        {s.entryFee > 0 && s.transactionId && s.transactionId !== '—' && (
                          <div style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'monospace' }}>
                            TXN: {s.transactionId} {s.paymentApp && s.paymentApp !== '—' && `(${s.paymentApp})`}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Base Reg Status */}
                    <td style={styles.td}>
                      {s.collegeType !== 'within' ? (
                        <span style={{ ...styles.statusChip, backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                          Outside College
                        </span>
                      ) : (
                        <span style={{
                          ...styles.statusChip,
                          backgroundColor: isBaseVerified ? '#ecfdf5' : s.paymentStatus === 'reviewing' ? '#eff6ff' : '#fffbeb',
                          color: isBaseVerified ? '#059669' : s.paymentStatus === 'reviewing' ? '#2563eb' : '#d97706',
                        }}>
                          {isBaseVerified ? 'Verified' : s.paymentStatus ? s.paymentStatus.charAt(0).toUpperCase() + s.paymentStatus.slice(1) : 'Pending'}
                        </span>
                      )}
                    </td>

                    {/* Enrolled Date */}
                    <td style={styles.td}>
                      {s.enrolledAt ? new Date(s.enrolledAt.toDate ? s.enrolledAt.toDate() : s.enrolledAt).toLocaleDateString() : '—'}
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
    flexShrink: 0,
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
    padding: '11px 36px 11px 42px',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1e1e2e',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
  },
  searchClear: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: '4px',
    lineHeight: 1,
  },
  tableWrap: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e8eaf0',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
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
    minWidth: '850px',
  },
  th: {
    padding: '13px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #f0f2f7',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '13px 16px',
    fontSize: '13px',
    color: '#6b7280',
    borderBottom: '1px solid #f9fafb',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
  },
  tdWrapper: {
    padding: '12px 16px',
    borderBottom: '1px solid #f9fafb',
    verticalAlign: 'middle',
    whiteSpace: 'normal',
    minWidth: '180px',
  },
  trEven: { backgroundColor: '#ffffff' },
  trOdd: { backgroundColor: '#fafafa' },
  statusChip: {
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
};
