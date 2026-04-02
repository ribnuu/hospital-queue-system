import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerUser } from '../services/api';
import toast from 'react-hot-toast';
import { UserPlus, Activity } from 'lucide-react';

const ROLES = [
  { value: 'RECEPTIONIST', label: 'Receptionist' },
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'NURSE', label: 'Nurse' },
  { value: 'ADMIN', label: 'Admin' },
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'RECEPTIONIST',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
            <Activity size={22} className="text-white"/>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-xl">MediQueue</h1>
            <p className="text-slate-400 text-xs">Smart Hospital Queue System</p>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UserPlus size={24} className="text-cyan-500"/>
            Create Account
          </h2>
          <p className="text-slate-500 text-sm mt-1">Join our hospital queue system</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="john@hospital.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-cyan-500 hover:text-cyan-600 font-semibold"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
