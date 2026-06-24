import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, AlertTriangle, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const { resetPassword, error, loading, success, clearErrors, clearSuccess } = useAuth();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState('');
  const [isResetDone, setIsResetDone] = useState(false);

  const { password, confirmPassword } = formData;

  useEffect(() => {
    // Clear any leftover state
    clearErrors();
    clearSuccess();
  }, []);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError('');
    clearErrors();
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setValidationError('Please enter all fields');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    const result = await resetPassword(resetToken, password);
    if (result.success) {
      setIsResetDone(true);
      // Auto redirect after 3 seconds
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 3500);
      return () => clearTimeout(timer);
    }
  };

  return (
    <div className="app-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">New Password</h2>
          <p className="auth-subtitle">Set your new secure password</p>
        </div>

        {/* Validation or Server Errors */}
        {(validationError || error) && (
          <div className="alert alert-error">
            <AlertTriangle size={18} />
            <span>{validationError || error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="alert alert-success">
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {!isResetDone ? (
          <form onSubmit={onSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="password">New Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  className="form-input"
                  placeholder="••••••••"
                  required
                />
                <Lock className="input-icon" size={18} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={onChange}
                  className="form-input"
                  placeholder="••••••••"
                  required
                />
                <Lock className="input-icon" size={18} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <span>Reset & Login</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: 'var(--success)', marginBottom: '20px' }}>
              <ShieldCheck size={48} />
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
              Redirecting to your secure dashboard in a few seconds...
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard Now
            </button>
          </div>
        )}

        {!isResetDone && (
          <div className="auth-footer">
            Remembered your password?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
