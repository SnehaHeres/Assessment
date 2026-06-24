import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldCheck, KeyRound, Database, Lock, Mail, Calendar, User } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  // Get initial for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="app-container">
      <div className="dashboard-container">
        
        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-logo">
            <ShieldCheck size={26} />
            <span>SecureAuth Portal</span>
          </div>
          <button className="btn btn-secondary logout-btn" onClick={logout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </header>

        {/* Dashboard Body */}
        <div className="dashboard-body">
          
          {/* Sidebar profile */}
          <aside className="profile-card">
            <div className="profile-avatar">
              {getInitial(user?.name)}
            </div>
            <h3 className="profile-name">{user?.name}</h3>
            <p className="profile-email">{user?.email}</p>
            
            <div style={{ width: '100%', borderTop: '1px solid var(--glass-border)', margin: '20px 0' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <Calendar size={14} />
              <span>Joined: {formatDate(user?.createdAt)}</span>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="dashboard-content">
            <h2 className="dashboard-title">Welcome back, {user?.name.split(' ')[0]}!</h2>
            <p className="dashboard-intro">
              You are securely logged into your dashboard. This MERN stack application implements robust security, clean API design, and a responsive glassmorphic frontend layout.
            </p>

            <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Module Security Integrations</h4>
            
            <div className="feature-grid">
              
              <div className="feature-item">
                <KeyRound className="feature-icon" size={24} />
                <h5 className="feature-title">JWT Session Auth</h5>
                <p className="feature-desc">Sessions are authorized using stateless JSON Web Tokens stored securely in the client headers.</p>
              </div>

              <div className="feature-item">
                <Lock className="feature-icon" size={24} />
                <h5 className="feature-title">Bcrypt Hashing</h5>
                <p className="feature-desc">Passwords are hashed using bcrypt with a salt factor of 10 prior to database write operations.</p>
              </div>

              <div className="feature-item">
                <Database className="feature-icon" size={24} />
                <h5 className="feature-title">MongoDB Schema</h5>
                <p className="feature-desc">Mongoose models enforce strict data types, unique constraints, and regex email validation.</p>
              </div>

              <div className="feature-item">
                <ShieldCheck className="feature-icon" size={24} />
                <h5 className="feature-title">Protected Routes</h5>
                <p className="feature-desc">Both Express APIs and React routes verify tokens before granting access to sensitive data.</p>
              </div>

            </div>
          </main>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
