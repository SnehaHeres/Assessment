import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, AlertTriangle, CheckCircle, ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [devLink, setDevLink] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const { forgotPassword, error, loading, success, clearErrors, clearSuccess } = useAuth();

  const onChange = (e) => {
    setEmail(e.target.value);
    setValidationError('');
    setDevLink('');
    clearErrors();
    clearSuccess();
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setValidationError('Please enter your email address');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    const result = await forgotPassword(email);
    if (result.success) {
      setRequestSent(true);
      if (result.devResetUrl) {
        // We extract the path part for react router link
        const urlObj = new URL(result.devResetUrl);
        setDevLink(urlObj.pathname);
      }
    }
  };

  return (
    <div className="app-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Enter your email to receive a recovery link</p>
        </div>

        {/* Validation or Server Errors */}
        {(validationError || error) && (
          <div className="alert alert-error">
            <AlertTriangle size={18} />
            <span>{validationError || error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="alert alert-success">
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {!requestSent ? (
          <form onSubmit={onSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  className="form-input"
                  placeholder="name@example.com"
                  required
                />
                <Mail className="input-icon" size={18} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <span>Send Recovery Email</span>
                  <RefreshCw size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setRequestSent(false);
                setEmail('');
                clearSuccess();
                setDevLink('');
              }}
              style={{ marginBottom: '10px' }}
            >
              Request Again
            </button>
          </div>
        )}

        {/* Dev Mode Reset Link Assistant */}
        {devLink && (
          <div className="dev-helper-card">
            <div className="dev-helper-title">
              <AlertTriangle size={16} />
              <span>Developer Assistant (Mock SMTP Enabled)</span>
            </div>
            <p>A simulated email was logged to the server console. You can test the password reset workflow instantly by clicking the link below:</p>
            <Link to={devLink} className="dev-helper-url" style={{ color: '#fbbf24', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Reset Password link</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        )}

        <div className="auth-footer">
          <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
