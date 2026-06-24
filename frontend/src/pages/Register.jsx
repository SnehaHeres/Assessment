import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertTriangle, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState('');
  
  const { register, error, loading, clearErrors } = useAuth();
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError('');
    clearErrors();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validations
    if (!name || !email || !password || !confirmPassword) {
      setValidationError('Please enter all fields');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
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

    const result = await register(name, email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="app-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join us to access your dashboard</p>
        </div>

        {/* Display validation or server errors */}
        {(validationError || error) && (
          <div className="alert alert-error">
            <AlertTriangle size={18} />
            <span>{validationError || error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <input
                id="name"
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                className="form-input"
                placeholder="John Doe"
                required
              />
              <User className="input-icon" size={18} />
            </div>
          </div>

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
            <label className="form-label" htmlFor="password">Password</label>
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
                <span>Sign Up</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
