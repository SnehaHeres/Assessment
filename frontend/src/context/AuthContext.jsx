import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Set default header token if exists
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Load User Info
  const loadUser = async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
      const res = await axios.get(`${API_URL}/profile`);
      if (res.data.success) {
        setUser(res.data.data);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Load User Error:', err.response?.data?.error || err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  // Register User
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post(`${API_URL}/register`, { name, email, password });
      if (res.data.success) {
        const newToken = res.data.data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(res.data.data);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      if (res.data.success) {
        const newToken = res.data.data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(res.data.data);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Invalid email or password.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post(`${API_URL}/forgot-password`, { email });
      if (res.data.success) {
        setSuccess(res.data.message);
        return { 
          success: true, 
          message: res.data.message,
          // Expose dev token and url returned by our mock/dev endpoint setup
          devToken: res.data.devToken,
          devResetUrl: res.data.devResetUrl
        };
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Could not initiate password reset request.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const resetPassword = async (resetToken, password) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.put(`${API_URL}/reset-password/${resetToken}`, { password });
      if (res.data.success) {
        setSuccess(res.data.message);
        // Automatically login the user
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          setToken(res.data.token);
        }
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to reset password. Token may be invalid or expired.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const clearErrors = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        success,
        register,
        login,
        forgotPassword,
        resetPassword,
        logout,
        clearErrors,
        clearSuccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
