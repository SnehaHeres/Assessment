import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertTriangle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validationError, setValidationError] = useState('');

  const { login, error, loading, clearErrors } = useAuth();
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError('');
    clearErrors();
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setValidationError('Please enter all fields');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="app-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to manage your account</p>
        </div>

        {/* Error Alert Display */}
        {(validationError || error) && (
          <div className="alert alert-error">
            <AlertTriangle size={18} />
            <span>{validationError || error}</span>
          </div>
        )}

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

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="auth-link forgot-password-link">
                Forgot Password?
              </Link>
            </div>
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

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
