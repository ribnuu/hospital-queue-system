import { useState, useEffect } from 'react';
import { Users, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAppointments, getByDepartment } from '../services/api';
import Navigation from '../components/Navigation';

const DEPARTMENTS = ['General', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Dermatology', 'Emergency'];

const StatusBadge = ({ status }) => {
  const styles = {
    SCHEDULED: 'bg-blue-100 text-blue-700',
    CHECKED_IN: 'bg-yellow-100 text-yellow-700',
    IN_PROGRESS: 'bg-purple-100 text-purple-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default function Queue() {
  const [appointments, setAppointments] = useState([]);
  const [department, setDepartment] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [department]);

  const fetchQueue = async () => {
    try {
      let data;
      if (department === 'All') {
        const res = await getAppointments();
        data = res.data;
      } else {
        const res = await getByDepartment(department);
        data = res.data;
      }
      setAppointments(data.sort((a, b) => {
        const order = { SCHEDULED: 0, CHECKED_IN: 1, IN_PROGRESS: 2, COMPLETED: 3, CANCELLED: 4 };
        return (order[a.status] || 5) - (order[b.status] || 5);
      }));
    } catch {
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  const active = appointments.filter(a => ['SCHEDULED', 'CHECKED_IN', 'IN_PROGRESS'].includes(a.status));
  const completed = appointments.filter(a => a.status === 'COMPLETED').length;
  const avgWait = active.length > 0 
    ? Math.round(active.reduce((sum, a) => sum + (a.predictedWaitMinutes || 0), 0) / active.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="p-6 max-w-6xl mx-auto">
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2 mb-2">
            <Users className="text-cyan-500" size={32}/>
            Live Queue
          </h1>
          <p className="text-slate-500">Real-time patient queue management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-cyan-500">
            <p className="text-slate-500 text-sm font-semibold">Active Queue</p>
            <p className="text-3xl font-bold text-cyan-600">{active.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <p className="text-slate-500 text-sm font-semibold">In Progress</p>
            <p className="text-3xl font-bold text-purple-600">
              {appointments.filter(a => a.status === 'IN_PROGRESS').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-slate-500 text-sm font-semibold">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
            <p className="text-slate-500 text-sm font-semibold">Avg Wait Time</p>
            <p className="text-3xl font-bold text-orange-600">{avgWait}m</p>
          </div>
        </div>

        {/* Department Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Filter by Department</label>
          <div className="flex flex-wrap gap-2">
            {['All', ...DEPARTMENTS].map(dept => (
              <button
                key={dept}
                onClick={() => setDepartment(dept)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  department === dept
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Queue List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center p-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              <p className="text-slate-500 mt-2">Loading queue...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <AlertCircle size={48} className="mx-auto text-slate-300 mb-2"/>
              <p className="text-slate-500 font-semibold">No appointments in queue</p>
            </div>
          ) : (
            appointments.map((apt, idx) => (
              <div
                key={apt.id}
                className={`bg-white rounded-lg shadow-md p-4 border-l-4 transition-all hover:shadow-lg ${
                  apt.status === 'IN_PROGRESS' ? 'border-purple-500 bg-purple-50' :
                  apt.status === 'CHECKED_IN' ? 'border-yellow-500 bg-yellow-50' :
                  apt.status === 'COMPLETED' ? 'border-green-500 bg-green-50' :
                  'border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{apt.patientName}</h3>
                        <p className="text-xs text-slate-500">{apt.patientEmail}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mt-3">
                      <div>
                        <span className="text-slate-500">Department:</span>
                        <p className="font-semibold text-slate-700">{apt.department}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Appointment Time:</span>
                        <p className="font-semibold text-slate-700">
                          {new Date(apt.appointmentTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Wait Time (AI):</span>
                        <p className="font-semibold text-slate-700">{apt.predictedWaitMinutes || 0} min</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Status:</span>
                        <div className="mt-1">
                          <StatusBadge status={apt.status} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {apt.status === 'IN_PROGRESS' && (
                    <div className="ml-4">
                      <div className="flex items-center gap-1 text-purple-600 font-semibold text-sm">
                        <Clock size={16}/>
                        In Progress
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
