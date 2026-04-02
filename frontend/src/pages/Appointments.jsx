import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAppointments, bookAppointment, updateStatus } from '../services/api';
import Navigation from '../components/Navigation';

const DEPARTMENTS = ['General', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Dermatology', 'Emergency'];
const STATUSES = ['SCHEDULED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    doctorName: '',
    department: 'General',
    scheduledTime: new Date().toISOString().slice(0, 16),
  });

  const fetchAppointments = async () => {
    try {
      const { data } = await getAppointments();
      setAppointments(data);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      await bookAppointment(formData);
      toast.success('Appointment booked successfully!');
      setShowForm(false);
      setFormData({
        patientName: '',
        patientEmail: '',
        doctorName: '',
        department: 'General',
        scheduledTime: new Date().toISOString().slice(0, 16),
      });
      await fetchAppointments();
    } catch {
      toast.error('Failed to book appointment');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateStatus(id, status);
      toast.success(`Status updated to ${status}`);
      await fetchAppointments();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="p-6 max-w-6xl mx-auto">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="text-cyan-500" size={32}/>
              Appointments
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage all patient appointments</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
          >
            <Plus size={18}/>
            Book Appointment
          </button>
        </div>

        {/* Booking Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-cyan-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4">New Appointment</h2>
            <form onSubmit={handleBook} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Patient Name</label>
                <input
                  type="text"
                  required
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.patientEmail}
                  onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Doctor Name</label>
                <input
                  type="text"
                  required
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                  placeholder="Dr. Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Appointment Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Book Appointment
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              <p className="text-slate-500 mt-2">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No appointments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Patient</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Department</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Wait (AI)</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-800">{apt.patientName}</p>
                          <p className="text-xs text-slate-500">{apt.patientEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{apt.department}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{new Date(apt.scheduledTime).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <select
                          value={apt.status}
                          onChange={(e) => handleStatusUpdate(apt.id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs font-semibold border-0 cursor-pointer ${apt.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' : apt.status === 'CHECKED_IN' ? 'bg-yellow-100 text-yellow-700' : apt.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' : apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">{apt.predictedWaitMinutes || 0}m</td>
                      <td className="px-6 py-4">
                        <button className="text-red-500 hover:text-red-700 transition-colors">
                          <Trash2 size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
