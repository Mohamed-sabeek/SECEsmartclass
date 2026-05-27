import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatTime, formatDate } from '../utils/dateUtils';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  User, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Download,
  Info
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import TableSkeleton from './skeletons/TableSkeleton';

const TeacherSessionDetails = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingExcel, setExportingExcel] = useState(false);

  useEffect(() => {
    if (sessionId && sessionId !== 'undefined') {
      fetchSessionDetails();
    }
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSession(response.data.data.session);
      setAttendance(response.data.data.attendance);
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast.error('Failed to load session details');
      navigate('/teacher/history');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/sessions/report/${sessionId}/export/excel`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Report-${session.subject || 'Attendance'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel exported successfully');
    } catch (error) {
      console.error('Excel Export error:', error);
      toast.error('Failed to export Excel report');
    } finally {
      setExportingExcel(false);
    }
  };

  const calculateDuration = (start, end) => {
    if (!end) return 'Ongoing';
    const diffMs = new Date(end) - new Date(start);
    const totalSeconds = Math.floor(diffMs / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    
    if (mins < 60) {
      return mins > 0 ? `${mins} mins ${secs} secs` : `${secs} secs`;
    }
    
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        {/* Top Navigation Shimmer */}
        <div className="h-6 w-36 bg-gray-200 rounded-md mb-8"></div>

        {/* Main Header Card Shimmer */}
        <div className="bg-[#1A1A1A] rounded-[2.5rem] p-12 shadow-2xl mb-10 border border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4 flex-1">
              <div className="h-6 w-32 bg-gray-700 rounded-lg"></div>
              <div className="h-12 w-3/4 bg-gray-700 rounded-xl"></div>
              <div className="h-4 w-48 bg-gray-800 rounded-md"></div>
            </div>

            <div className="grid grid-cols-2 gap-8 md:gap-12 shrink-0 w-full md:w-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-24 bg-gray-700 rounded-md"></div>
                  <div className="h-5 w-32 bg-gray-800 rounded-md"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Log Table Shimmer */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex justify-between items-center">
            <div className="h-6 w-40 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-36 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="divide-y divide-gray-50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-10 py-6 flex items-center justify-between">
                <div className="h-8 w-24 bg-gray-100 rounded-lg"></div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-250 rounded-full"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-16 bg-gray-100 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom duration-700">
      {/* Top Navigation */}
      <button 
        onClick={() => navigate('/teacher/history')}
        className="group flex items-center text-gray-400 hover:text-[#1A1A1A] mb-8 font-black uppercase tracking-widest text-xs transition-colors"
      >
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Archives
      </button>

      {/* Main Header Card */}
      <div className="bg-[#1A1A1A] rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden mb-10 border border-white/5">
        <div className="absolute top-0 right-0 p-10 opacity-10">
           <Info size={120} className="text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <span className="inline-flex items-center px-3 py-1 bg-[#FFD700] text-[#1A1A1A] text-[10px] font-black uppercase tracking-widest rounded-lg mb-4 italic">
                Session Transcript
              </span>
              <h1 className="text-5xl font-black text-white italic tracking-tighter leading-none mb-2">
                {session.classId?.className}
              </h1>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">
                {session.classId?.year} Year — Section {session.section || 'All'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 md:gap-12">
               <div className="space-y-1">
                  <div className="flex items-center text-gray-500 mb-1">
                     <Calendar size={14} className="mr-2" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Date broadcast</span>
                  </div>
                  <p className="text-lg font-black text-white italic">
                    {formatDate(session.startTime)}
                  </p>
               </div>
               <div className="space-y-1">
                  <div className="flex items-center text-gray-500 mb-1">
                     <Clock size={14} className="mr-2" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Efficiency Window</span>
                  </div>
                  <p className="text-lg font-black text-white italic">{calculateDuration(session.startTime, session.endTime)}</p>
               </div>
               <div className="space-y-1">
                  <div className="flex items-center text-gray-500 mb-1">
                     <User size={14} className="mr-2" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Faculty Lead</span>
                  </div>
                  <p className="text-lg font-black text-white italic">{session.teacherId?.name}</p>
               </div>
               <div className="space-y-1">
                  <div className="flex items-center text-gray-500 mb-1">
                     <Users size={14} className="mr-2" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Attendance</span>
                  </div>
                  <p className="text-lg font-black text-[#FFD700] italic">{attendance.length} Scanned</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex justify-between items-center">
           <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight">Academic <span className="text-[#FFD700]">Roster</span></h3>
           <button 
             onClick={handleExportExcel}
             disabled={exportingExcel}
             className="flex items-center px-6 py-3 bg-[#1A1A1A] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#FFD700] hover:text-[#1A1A1A] transition-all shadow-lg active:scale-95 disabled:opacity-50"
           >
              {exportingExcel ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Download size={16} className="mr-2" />}
              {exportingExcel ? 'Exporting...' : 'Export Excel'}
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Roll Number</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Student Identity</th>
                <th className="px-10 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Broadcast Status</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-10 py-20 text-center text-gray-400 font-medium italic">
                    No individual student records were captured for this session.
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record._id} className="group hover:bg-yellow-50/20 transition-all duration-300">
                    <td className="px-10 py-6">
                      <span className="bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-black text-[#1A1A1A] border border-gray-100 uppercase tracking-widest">
                        {record.studentId?.studentDetails?.rollNo || 'N/A'}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-[#FFD700] flex items-center justify-center text-[10px] font-black mr-3 shadow-lg group-hover:scale-110 transition-transform">
                          {record.studentId?.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-[#1A1A1A]">{record.studentId?.name}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="inline-flex items-center px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                        <CheckCircle size={12} className="mr-1.5" />
                        Present
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase italic">
                      {formatTime(record.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherSessionDetails;
