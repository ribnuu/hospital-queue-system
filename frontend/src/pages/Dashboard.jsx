import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Clock, CheckCircle, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAppointments, updateStatus } from '../services/api';
import { useQueueSocket } from '../hooks/useQueueSocket';
import Navigation from '../components/Navigation';

const DEPT_COLORS = ['#06b6d4','#8b5cf6','#f59e0b','#10b981','#ef4444','#3b82f6','#ec4899'];
const DEPARTMENTS = ['General','Cardiology','Orthopedics','Pediatrics','Neurology','Dermatology','Emergency'];

const StatusBadge = ({ s }) => {
  const map = {
    SCHEDULED:   'bg-blue-100 text-blue-700',
    CHECKED_IN:  'bg-yellow-100 text-yellow-700',
    IN_PROGRESS: 'bg-purple-100 text-purple-700',
    COMPLETED:   'bg-green-100 text-green-700',
    CANCELLED:   'bg-red-100 text-red-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[s]||''}`}>{s.replace('_',' ')}</span>;
};

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchData = useCallback(async () => {
    try {
      const { data } = await getAppointments();
      setAppointments(data);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Live WebSocket updates
  useQueueSocket(
    null,
    () => { fetchData(); toast('🔄 Queue updated in real-time', { icon: '📡' }); },
    (alert) => toast(alert.message, { icon: '🤖', duration: 6000 })
  );

  const handleStatus = async (id, status) => {
    try {
      await updateStatus(id, status);
      await fetchData();
      toast.success(`Status updated to ${status.replace('_',' ')}`);
    } catch { toast.error('Update failed'); }
  };

  // Stats
  const active   = appointments.filter(a => ['SCHEDULED','CHECKED_IN','IN_PROGRESS'].includes(a.status)).length;
  const done     = appointments.filter(a => a.status === 'COMPLETED').length;
  const avgWait  = appointments.filter(a=>a.predictedWaitMinutes).reduce((s,a,_,arr)=>s+a.predictedWaitMinutes/arr.length,0);

  // Chart data
  const deptData = DEPARTMENTS.map(d => ({
    name: d, count: appointments.filter(a=>a.department===d).length
  })).filter(d=>d.count>0);

  const statusData = [
    { name:'Scheduled',   value: appointments.filter(a=>a.status==='SCHEDULED').length },
    { name:'Checked In',  value: appointments.filter(a=>a.status==='CHECKED_IN').length },
    { name:'In Progress', value: appointments.filter(a=>a.status==='IN_PROGRESS').length },
    { name:'Completed',   value: done },
  ].filter(d=>d.value>0);

  const filtered = filter === 'ALL' ? appointments : appointments.filter(a=>a.status===filter);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label:'Total Today',   value: appointments.length, icon: Users,        color:'bg-blue-500' },
            { label:'Active Queue',  value: active,              icon: Clock,        color:'bg-amber-500' },
            { label:'Completed',     value: done,                icon: CheckCircle,  color:'bg-green-500' },
            { label:'Avg Wait (AI)', value: `${Math.round(avgWait||0)}m`,icon:Activity,color:'bg-purple-500' },
          ].map(({ label,value,icon:Icon,color }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500 font-medium">{label}</span>
                <div className={`${color} w-9 h-9 rounded-lg flex items-center justify-center`}>
                  <Icon size={16} className="text-white"/>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-700 mb-4">Appointments by Department</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="name" tick={{fontSize:11}} angle={-20} textAnchor="end"/>
                <YAxis tick={{fontSize:11}}/>
                <Tooltip/>
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {deptData.map((_,i)=><Cell key={i} fill={DEPT_COLORS[i%DEPT_COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-700 mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({name,value})=>`${name}: ${value}`}>
                  {statusData.map((_,i)=><Cell key={i} fill={DEPT_COLORS[i]}/>)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-semibold text-slate-700">Live Appointment Queue</h3>
            <div className="flex gap-2 flex-wrap">
              {['ALL','SCHEDULED','CHECKED_IN','IN_PROGRESS','COMPLETED'].map(s=>(
                <button key={s} onClick={()=>setFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter===s?'bg-cyan-500 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {s.replace('_',' ')}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-10 text-center text-slate-400">Loading queue...</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-slate-400">No appointments found</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 text-left">Q#</th>
                    <th className="px-5 py-3 text-left">Patient</th>
                    <th className="px-5 py-3 text-left">Department</th>
                    <th className="px-5 py-3 text-left">Doctor</th>
                    <th className="px-5 py-3 text-left">AI Wait</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(a=>(
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-bold text-cyan-600">#{a.queueNumber}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800">{a.patientName}</p>
                        <p className="text-slate-400 text-xs">{a.patientEmail}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{a.department}</td>
                      <td className="px-5 py-3 text-slate-600">{a.doctorName}</td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1 text-purple-600 font-semibold">
                          <Clock size={13}/> {a.predictedWaitMinutes ?? '—'}m
                        </span>
                        <span className="text-xs text-slate-400">AI predicted</span>
                      </td>
                      <td className="px-5 py-3"><StatusBadge s={a.status}/></td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          {a.status==='SCHEDULED' && (
                            <button onClick={()=>handleStatus(a.id,'CHECKED_IN')}
                              className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200">Check In</button>
                          )}
                          {a.status==='CHECKED_IN' && (
                            <button onClick={()=>handleStatus(a.id,'IN_PROGRESS')}
                              className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">Start</button>
                          )}
                          {a.status==='IN_PROGRESS' && (
                            <button onClick={()=>handleStatus(a.id,'COMPLETED')}
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">Complete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
