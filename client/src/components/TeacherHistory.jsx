import { useState, useEffect, useRef } from 'react';
import { History, Calendar, Clock, Loader2, ArrowRight, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Dropdown from './ui/Dropdown';

const TeacherHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const dateInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/sessions/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/teacher/session/${id}`);
  };

  const calculateDuration = (start, end) => {
    if (!end) return 'Active';
    const duration = Math.round((new Date(end) - new Date(start)) / 60000);
    return `${duration} mins`;
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
        <Loader2 className="animate-spin text-[#FFD700]" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom duration-700">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter">
          Academic <span className="text-[#FFD700]">Artifacts</span>
        </h2>
        <p className="text-gray-500 mt-2 font-medium italic">Log of all previously broadcasted sessions and teaching records</p>
      </div>

      {!loading && history.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Dropdown
            value={filterClass}
            onChange={setFilterClass}
            options={['All', ...new Set(history.map(s => s.classId?.className || 'Deleted Class'))].map(cls => ({
              label: cls === 'All' ? 'All Classes' : cls,
              value: cls
            }))}
            className="md:w-64"
          />
          <Dropdown
            value={filterMonth}
            onChange={setFilterMonth}
            options={['All', ...new Set(history.map(s => new Date(s.startTime).toLocaleString('default', { month: 'long', year: 'numeric' })))].map(month => ({
              label: month === 'All' ? 'All Months' : month,
              value: month
            }))}
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
              className="w-full pl-14 pr-12 py-4 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest focus:outline-none focus:border-[#FFD700] transition-colors cursor-pointer relative date-input-field"
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
              .date-input-field::-webkit-calendar-picker-indicator {
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

      {history.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <History className="text-gray-300" size={40} />
            </div>
            <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 tracking-tight">Archives Empty</h3>
            <p className="text-gray-500 max-w-sm mx-auto font-medium italic text-lg">Your academic teaching history will appear here once you complete your first broadcast session.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">Academic Block</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 text-center">Date</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 text-center">Timing Window</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 text-center">Metric Duration</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 text-center">Attendance</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.filter(session => {
                  const sessionClass = session.classId?.className || 'Deleted Class';
                  const sessionMonth = new Date(session.startTime).toLocaleString('default', { month: 'long', year: 'numeric' });
                  
                  // Fix: Use local date parts to avoid UTC shift
                  const d = new Date(session.startTime);
                  const sessionDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  
                  const matchClass = filterClass === 'All' || sessionClass === filterClass;
                  const matchMonth = filterMonth === 'All' || sessionMonth === filterMonth;
                  const matchDate = !filterDate || sessionDate === filterDate;
                  
                  return matchClass && matchMonth && matchDate;
                }).map((session) => (
                  <tr key={session._id} className="group hover:bg-yellow-50/20 transition-all duration-300">
                    <td className="px-10 py-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-[#1A1A1A] transition-colors">
                           <Calendar size={18} className="text-[#FFD700]" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{session.classId?.className || 'Deleted Class'}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{session.classId?.year} Year — {session.classId?.section}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="text-xs font-black text-[#1A1A1A] italic uppercase">
                        {new Date(session.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-gray-800 italic uppercase">
                          {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                        <div className="w-px h-2 bg-gray-200 my-1"></div>
                        <span className="text-[10px] font-black text-gray-400 italic uppercase">
                          {session.endTime ? new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Ongoing'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <div className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-50 text-[10px] font-black text-gray-800 border border-gray-100">
                         <Clock size={12} className="mr-2 text-[#FFD700]" />
                         {calculateDuration(session.startTime, session.endTime)}
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                       <p className="text-xl font-black text-[#1A1A1A] italic leading-none">{session.attendanceCount}</p>
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Scanned</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <button 
                         onClick={() => handleViewDetails(session._id)}
                         className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:bg-[#1A1A1A] hover:text-[#FFD700] transition-colors shadow-sm active:scale-90"
                       >
                          <ArrowRight size={20} />
                       </button>
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

export default TeacherHistory;
