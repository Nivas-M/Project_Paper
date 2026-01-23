import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('adminToken', data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-secondary-dark">
        <div className="bg-primary p-8 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Access</h2>
          <p className="text-primary-light mt-2 opacity-90">Enter credentials to manage print orders</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
              <input
                type="text"
                required
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full px-4 py-3 border border-secondary-dark rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-surface"
                placeholder="admin"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full px-4 py-3 border border-secondary-dark rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-surface"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              {loading ? 'Verifying...' : 'Login to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
