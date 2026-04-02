import { useAuth } from '../context/AuthContext';
import { User, Mail, Briefcase, Calendar } from 'lucide-react';
import Navigation from '../components/Navigation';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="p-6 max-w-4xl mx-auto">
        
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2 mb-6">
          <User className="text-cyan-500" size={32}/>
          User Profile
        </h1>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          
          {/* Header */}
          <div className="h-32 bg-gradient-to-r from-cyan-500 to-cyan-600"></div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-16 mb-6">
              <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-slate-600">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{user?.name}</h2>
                <p className="text-slate-500">{user?.role}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              
              {/* Name */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <User size={18} className="text-cyan-500"/>
                  <span className="text-sm font-semibold text-slate-600">Full Name</span>
                </div>
                <p className="text-lg font-semibold text-slate-800">{user?.name}</p>
              </div>

              {/* Email */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <Mail size={18} className="text-purple-500"/>
                  <span className="text-sm font-semibold text-slate-600">Email Address</span>
                </div>
                <p className="text-lg font-semibold text-slate-800">{user?.email}</p>
              </div>

              {/* Role */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase size={18} className="text-orange-500"/>
                  <span className="text-sm font-semibold text-slate-600">Role</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    user?.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                    user?.role === 'DOCTOR' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              </div>

              {/* Join Date */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar size={18} className="text-green-500"/>
                  <span className="text-sm font-semibold text-slate-600">Account Created</span>
                </div>
                <p className="text-lg font-semibold text-slate-800">
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

            </div>

            {/* Permissions Info */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-2">Permissions</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ View Dashboard and Analytics</li>
                <li>✓ Manage Appointments</li>
                <li>✓ View Live Queue</li>
                <li>✓ Access Patient Records</li>
                {user?.role === 'ADMIN' && <li>✓ Admin Access - Manage Users</li>}
                {user?.role === 'DOCTOR' && <li>✓ Doctor Access - Patient Diagnosis</li>}
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
