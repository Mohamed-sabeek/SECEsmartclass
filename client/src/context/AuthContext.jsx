import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const fetchProfile = async (forceRefetch = false, includeAnalytics = false) => {
    const activeToken = localStorage.getItem('token') || token;
    if (!activeToken) return null;

    // Return cached profile if it exists and analytics requirement is satisfied
    if (
      profileData && 
      !forceRefetch && 
      (!includeAnalytics || profileData.averageAttendance !== undefined)
    ) {
      return profileData;
    }

    try {
      setFetchingProfile(true);
      const url = includeAnalytics ? '/api/users/me?analytics=true' : '/api/users/me';
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      
      const data = response.data.data;
      setProfileData(data);
      
      // Update AuthContext user
      setUser(prev => ({ ...prev, ...data }));
      localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
      
      return data;
    } catch (err) {
      console.error("Error fetching user profile in Context:", err);
      throw err;
    } finally {
      setFetchingProfile(false);
    }
  };

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    setProfileData(null); // Reset cache on login
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setProfileData(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  const updateUserInfo = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Also sync the cached profile data
    if (profileData) {
      setProfileData(prev => ({ ...prev, ...newData }));
    }
  };

  const value = {
    token,
    user,
    role: user?.role || null,
    mustChangePassword: user?.mustChangePassword || false,
    login,
    logout,
    updateUserInfo,
    isAuthenticated: !!token,
    loading,
    profileData,
    fetchingProfile,
    fetchProfile,
    setProfileData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
