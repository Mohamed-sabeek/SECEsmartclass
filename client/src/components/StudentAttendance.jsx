import { useState, useEffect, useRef } from 'react';
import { 
  ClipboardCheck, 
  Users, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Info, 
  History,
  Calendar,
  Clock,
  X
} from 'lucide-react';
import axios from 'axios';
import Dropdown from './ui/Dropdown';

const StudentAttendance = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  const [filterDate, setFilterDate] = useState('');
  const dateInputRef = useRef(null);

  useEffect(() => {
    fetchAttendance();
    fetchHistory();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/student/attendance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/student/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const getPercentageColor = (pct) => {
    if (pct >= 75) return 'text-green-500 bg-green-50 border-green-100';
    if (pct >= 50) return 'text-yellow-500 bg-yellow-50 border-yellow-100';
    return 'text-red-500 bg-red-50 border-red-100';
  };

  const getPercentageBarColor = (pct) => {
    if (pct >= 75) return 'bg-green-500';
    if (pct >= 50) return 'bg-[#FFD700]';
    return 'bg-red-500';
  };

  if (loading && historyLoading) {
    return (
      <div className="h-96 flex items-center justify-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
        <Loader2 className="animate-spin text-[#FFD700]" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* SECTION 1: Attendance Analytics Summary */}
      <div className="mb-10">
        <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter">
          Academic <span className="text-[#FFD700]">Metric</span>
        </h2>
        <p className="text-gray-500 mt-2 font-medium italic">Your personalized synchronization index and participation analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
         <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center group hover:border-[#FFD700] transition-all duration-500">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Info className="text-blue-500" size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Classes</p>
            <h4 className="text-3xl font-black text-[#1A1A1A] italic">{stats?.totalClasses}</h4>
         </div>

         <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center group hover:border-green-500 transition-all duration-500">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <CheckCircle className="text-green-500" size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Present Log</p>
            <h4 className="text-3xl font-black text-[#1A1A1A] italic">{stats?.presentCount}</h4>
         </div>

         <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center group hover:border-red-500 transition-all duration-500">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <XCircle className="text-red-500" size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Absent Log</p>
            <h4 className="text-3xl font-black text-[#1A1A1A] italic">{stats?.absentCount}</h4>
         </div>

         <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center group hover:border-[#FFD700] transition-all duration-500">
            <div className="w-12 h-12 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <ClipboardCheck className="text-[#FFD700]" size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Efficiency Ratio</p>
            <h4 className="text-3xl font-black text-[#1A1A1A] italic">{stats?.percentage}%</h4>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl border border-gray-100 relative overflow-hidden group mb-16">
         <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex-1">
               <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-4 uppercase">Overall Participation Index</h3>
               <div className="w-full h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-1 mb-4">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${getPercentageBarColor(stats?.percentage)}`}
                    style={{ width: `${stats?.percentage}%` }}
                  ></div>
               </div>
               <p className="text-gray-500 text-sm font-medium italic">
                 {stats?.percentage >= 75 
                   ? "Outstanding engagement! You are maintaining an elite synchronization level. Keep up the consistent broadcast presence."
                   : stats?.percentage >= 50
                   ? "Stable participation. You are currently within the acceptable operational range, but there is clear room for optimization."
                   : "Critical signal loss. Your participation metrics are significantly below the required threshold. Urgent corrective action is advised."}
               </p>
            </div>
            <div className={`w-40 h-40 rounded-full border-8 border-gray-50 flex flex-col items-center justify-center shadow-inner ${getPercentageColor(stats?.percentage)}`}>
               <span className="text-4xl font-black italic">{stats?.percentage}%</span>
               <span className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">Sync Rate</span>
            </div>
         </div>
      </div>

      {/* SECTION 2: Attendance History Table */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#FFD700] rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <History className="text-[#1A1A1A]" size={20} />
          </div>
          <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.3em]">Historical Log</span>
        </div>
        <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter">
          Attendance <span className="text-[#FFD700]">History</span>
        </h2>
        <p className="text-gray-500 mt-2 font-medium italic">Review complete session records and individual broadcast analytics</p>
      </div>

      {!historyLoading && history.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 mb-8">

          <Dropdown
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { label: 'All Status', value: 'All' },
              { label: 'Present (≥ 70%)', value: 'Present' },
              { label: 'Absent (< 70%)', value: 'Absent' }
            ]}
            className="md:w-64"
          />

          <div className="flex-1 relative group">
            <button 
              onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-[#FFD700] hover:scale-110 transition-transform z-20"
            >
              <Calendar size={14} />
            </button>
            <input 
              ref={dateInputRef}
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full pl-14 pr-12 py-4 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest focus:outline-none focus:border-[#FFD700] transition-colors cursor-pointer relative student-date-input"
              style={{ colorScheme: 'light' }}
            />
            {filterDate && (
              <button 
                onClick={() => setFilterDate('')}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors z-20"
                title="Clear Filter"
              >
                <X size={14} />
              </button>
            )}
            <style dangerouslySetInnerHTML={{ __html: `
              .student-date-input::-webkit-calendar-picker-indicator {
                background: transparent;
                bottom: 0;
                color: transparent;
                cursor: pointer;
                height: auto;
                left: 0;
                position: absolute;
                right: 0;
                top: 0;
                width: auto;
                opacity: 0;
              }
            `}} />
          </div>
        </div>
      )}

      {historyLoading ? (
        <div className="h-64 flex items-center justify-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
          <Loader2 className="animate-spin text-[#FFD700]" size={40} />
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <History className="text-gray-300" size={40} />
            </div>
            <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 tracking-tight">Logs Empty</h3>
            <p className="text-gray-500 max-w-sm mx-auto font-medium italic text-lg">Your academic history will populate once sessions are started for your class.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">Academic Module</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 text-center">Date</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 text-center">Status</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 text-center">Window</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">Participation (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.filter(session => {
                  const d = new Date(session.startTime);
                  const sessionDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  
                  const matchStatus = filterStatus === 'All' || session.status === filterStatus;
                  const matchDate = !filterDate || sessionDate === filterDate;
                  
                  return matchStatus && matchDate;
                }).map((session) => (
                  <tr key={session._id} className="group hover:bg-yellow-50/20 transition-all duration-300">
                    <td className="px-10 py-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-[#1A1A1A] transition-colors">
                           <Calendar size={18} className="text-[#FFD700]" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{session.className}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1 italic">Faculty: {session.teacherName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="text-xs font-black text-[#1A1A1A] italic uppercase">
                        {new Date(session.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                       {session.status === 'Present' ? (
                          <span className="inline-flex items-center px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                             <CheckCircle size={12} className="mr-1.5" />
                             Present
                          </span>
                       ) : (
                          <span className="inline-flex items-center px-4 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100">
                             <XCircle size={12} className="mr-1.5" />
                             Absent
                          </span>
                       )}
                    </td>
                    <td className="px-10 py-6 text-center">
                       <span className="text-[10px] font-black text-gray-400 italic uppercase">
                          {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                          {" — "}
                          {session.endTime ? new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Ongoing'}
                       </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                        <div className="inline-flex flex-col items-end">
                           <div className="flex items-center px-4 py-2 rounded-xl bg-gray-50 text-[10px] font-black text-gray-800 border border-gray-100">
                              <Clock size={12} className="mr-2 text-[#FFD700]" />
                              {session.duration}
                           </div>
                           <span className={`text-[10px] font-black uppercase italic mt-1 pr-1 ${session.status === 'Present' ? 'text-emerald-500' : 'text-red-400'}`}>
                              {session.attendancePercentage}% Attendance
                           </span>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
