import { createContext, useState, useEffect } from 'react';
import axios from 'axios'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const data = response.data; 
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setRole(data.user.role);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };
  
  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', {
        name: name.trim(),      
        email: email.trim().toLowerCase(),
        password: password      
      });
      const data = response.data;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setRole(data.user.role);
      setUser(data.user);
    } catch (error) {
      console.error('Register error:', error.response?.data); 
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };  
  
  return (
    <AuthContext.Provider value={{ token, role, login, user, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};