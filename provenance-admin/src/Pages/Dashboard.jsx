import { useState } from 'react';
import Home from './DashboardComponent/Home';
import EventsPage from './DashboardComponent/EventsPage';
import VerifyPayement from './DashboardComponent/VerifyPayement';
import UserLookup from './DashboardComponent/UserLookup';

const navItems = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12L12 3l9 9M4.5 10.5V20a1 1 0 001 1h4.5v-5h4v5H18.5a1 1 0 001-1v-9.5" />
      </svg>
    ),
  },
  {
    id: 'events',
    label: 'Events',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'verify',
    label: 'Verify Payment',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    id: 'lookup',
    label: 'User Lookup',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
];

export default function Dashboard() {
  const [activePage, setActivePage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'home': return <Home />;
      case 'events': return <EventsPage />;
      case 'verify': return <VerifyPayement />;
      case 'lookup': return <UserLookup />;
      default: return <Home />;
    }
  };

  return (
    <div style={styles.root}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`} style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>P</div>
          <span style={styles.logoText}>Provenance</span>
        </div>

        <p style={styles.navLabel}>NAVIGATION</p>

        {/* Nav Items */}
        <nav style={styles.nav}>
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                style={{
                  ...styles.navBtn,
                  ...(isActive ? styles.navBtnActive : {}),
                }}
                onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
              >
                <span style={{ ...styles.navIcon, ...(isActive ? styles.navIconActive : {}) }}>
                  {item.icon}
                </span>
                <span style={{ ...styles.navBtnLabel, ...(isActive ? styles.navBtnLabelActive : {}) }}>
                  {item.label}
                </span>
                {isActive && <span style={styles.activeDot} />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={styles.sidebarFooter}>
          <div style={styles.avatarCircle}>A</div>
          <div>
            <p style={styles.adminName}>Admin</p>
            <p style={styles.adminRole}>Administrator</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={styles.mainWrapper}>
        {/* Top Bar */}
        <header className="admin-topbar" style={styles.topBar}>
          <div style={styles.topBarLeft}>
            <button className="admin-hamburger" style={styles.hamburger} onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span style={styles.hamLine} />
              <span style={styles.hamLine} />
              <span style={styles.hamLine} />
            </button>
            <div>
              <h1 className="admin-page-title" style={styles.pageTitle}>
                {navItems.find(n => n.id === activePage)?.label}
              </h1>
              <p style={styles.breadcrumb}>Dashboard / {navItems.find(n => n.id === activePage)?.label}</p>
            </div>
          </div>
          <div style={styles.topBarRight}>
            <div className="admin-topbar-badge" style={styles.badge}>Admin Panel</div>
            <button
              onClick={() => {
                localStorage.removeItem('adminLoggedIn');
                window.location.reload();
              }}
              style={{
                background: '#fee2e2',
                color: '#ef4444',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-page-content" style={styles.pageContent}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f4f6f9',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    position: 'relative',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 10,
  },
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e8eaf0',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
    zIndex: 20,
    transition: 'transform 0.3s ease',
  },
  sidebarOpen: {
    position: 'fixed',
    left: 0,
    top: 0,
    transform: 'translateX(0)',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '24px 20px 20px',
    borderBottom: '1px solid #f0f2f7',
    marginBottom: '8px',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '16px',
  },
  logoText: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#1e1e2e',
    letterSpacing: '-0.3px',
  },
  navLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: '1px',
    padding: '12px 20px 6px',
    margin: 0,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '0 12px',
    flex: 1,
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 14px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'background 0.15s ease',
    position: 'relative',
  },
  navBtnActive: {
    backgroundColor: '#f0eeff',
  },
  navIcon: {
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.15s',
  },
  navIconActive: {
    color: '#4f46e5',
  },
  navBtnLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    transition: 'color 0.15s',
    flex: 1,
  },
  navBtnLabelActive: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  activeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#4f46e5',
  },
  sidebarFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 20px',
    borderTop: '1px solid #f0f2f7',
    margin: '8px 0 0',
  },
  avatarCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0,
  },
  adminName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e1e2e',
    margin: 0,
  },
  adminRole: {
    fontSize: '11px',
    color: '#9ca3af',
    margin: 0,
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  topBar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e8eaf0',
    padding: '0 28px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 5,
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  hamburger: {
    display: 'none',
    flexDirection: 'column',
    gap: '5px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  hamLine: {
    display: 'block',
    width: '20px',
    height: '2px',
    backgroundColor: '#6b7280',
    borderRadius: '2px',
  },
  pageTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e1e2e',
    margin: 0,
  },
  breadcrumb: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0,
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  badge: {
    backgroundColor: '#f0eeff',
    color: '#4f46e5',
    fontSize: '12px',
    fontWeight: '600',
    padding: '5px 12px',
    borderRadius: '20px',
  },
  pageContent: {
    padding: '24px 28px',
    flex: 1,
  },
};
