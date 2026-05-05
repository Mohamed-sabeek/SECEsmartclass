import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Clock, 
  Calendar, 
  BookOpen, 
  Users, 
  ChevronLeft, 
  Download, 
  CheckCircle2, 
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const TeacherSessionReport = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchReport();
  }, [sessionId]);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/sessions/report/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(response.data.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load session report');
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'In Progress';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin text-[#FFD700]" size={48} />
          <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Compiling Attendance Report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-10 text-center">
        <h3 className="text-2xl font-black text-[#1A1A1A]">Report not found</h3>
        <button onClick={() => navigate('/teacher')} className="mt-4 text-[#FFD700] font-bold">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto py-10 px-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <button 
          onClick={() => navigate('/teacher')}
          className="flex items-center space-x-2 text-gray-500 hover:text-[#1A1A1A] transition-colors group"
        >
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-gray-50 transition-all">
            <ChevronLeft size={20} />
          </div>
          <span className="font-black text-xs uppercase tracking-widest">Back to Console</span>
        </button>

        <button 
          onClick={() => window.print()}
          className="flex items-center justify-center space-x-3 bg-[#1A1A1A] text-white px-8 py-4 rounded-2xl font-black transition-all hover:bg-[#FFD700] hover:text-[#1A1A1A] shadow-xl shadow-gray-200 active:scale-95 text-xs uppercase tracking-widest"
        >
          <Download size={16} />
          <span>Export Report</span>
        </button>
      </div>

      {/* Session Metadata Card */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-10 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 rounded-full -mr-32 -mt-32"></div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="px-4 py-1.5 bg-[#FFD700]/10 rounded-full border border-[#FFD700]/20">
                <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest">Session Summary</span>
              </div>
              <div className="px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">Completed</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tighter italic uppercase">{report.subject}</h1>
            <div className="flex flex-wrap items-center gap-6 pt-2">
               <div className="flex items-center text-gray-500">
                  <Calendar size={18} className="text-[#FFD700] mr-2" />
                  <span className="text-sm font-bold">{formatDate(report.date)}</span>
               </div>
               <div className="flex items-center text-gray-500">
                  <Clock size={18} className="text-[#FFD700] mr-2" />
                  <span className="text-sm font-bold">{formatTime(report.startTime)} — {formatTime(report.endTime)}</span>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="bg-gray-50 rounded-[2rem] p-6 text-center border border-gray-100 min-w-[140px]">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Duration</p>
                <p className="text-3xl font-black text-[#1A1A1A]">{report.totalDuration}</p>
             </div>
             <div className="bg-[#1A1A1A] rounded-[2rem] p-6 text-center shadow-lg min-w-[140px]">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Students Present</p>
                <p className="text-3xl font-black text-white">{report.students.filter(s => s.status === 'Present').length}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden mb-20">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
           <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                 <Users className="text-[#FFD700]" size={20} />
              </div>
              <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight">ATTENDANCE ROSTER</h3>
           </div>
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{report.students.length} Total Registered Students</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Student Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">First Join</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Last Leave</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Duration</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {report.students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                     No attendance records found
                  </td>
                </tr>
              ) : (
                report.students.map((student, index) => (
                  <React.Fragment key={index}>
                    <tr className={`hover:bg-gray-50/50 transition-colors group ${expandedRows[index] ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${student.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {student.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#1A1A1A] group-hover:text-[#FFD700] transition-colors">{student.studentName}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-xs font-black text-gray-600 uppercase italic">
                           {student.firstJoinTime ? formatTime(student.firstJoinTime) : '—'}
                         </span>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-xs font-black text-gray-600 uppercase italic">
                           {student.lastLeaveTime ? formatTime(student.lastLeaveTime) : (student.status === 'Present' ? 'In Progress' : '—')}
                         </span>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col">
                            <span className={`text-xs font-black ${student.status === 'Present' ? 'text-[#1A1A1A]' : 'text-gray-300'}`}>
                              {student.attendedDuration}
                            </span>
                            {student.logCount > 1 && (
                              <span className="text-[9px] font-black text-[#FFD700] uppercase italic">{student.logCount} logs</span>
                            )}
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className={`flex items-center space-x-2 ${student.status === 'Present' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {student.status === 'Present' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                            <span className="text-[10px] font-black uppercase tracking-widest italic">{student.status}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        {student.status === 'Present' && (
                          <button 
                            onClick={() => toggleRow(index)}
                            className={`p-2 rounded-lg transition-all ${expandedRows[index] ? 'bg-[#1A1A1A] text-[#FFD700]' : 'bg-gray-100 text-gray-400 hover:text-[#1A1A1A]'}`}
                          >
                            {expandedRows[index] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {/* Expanded Logs Section */}
                    {expandedRows[index] && (
                      <tr className="bg-gray-50/50 animate-in slide-in-from-top-2 duration-300">
                        <td colSpan="6" className="px-8 py-6 pl-24">
                           <div className="flex items-center space-x-3 mb-4">
                              <Activity size={14} className="text-[#FFD700]" />
                              <h4 className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">Session Chronology:</h4>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {student.logs.map((log, logIdx) => (
                                <div key={logIdx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                                   <div className="flex items-center space-x-3">
                                      <div className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] font-black text-[#1A1A1A]">
                                        {logIdx + 1}
                                      </div>
                                      <div className="flex flex-col">
                                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Time Interval</span>
                                         <span className="text-[11px] font-black text-[#1A1A1A]">
                                           {formatTime(log.joinTime)} – {formatTime(log.leaveTime)}
                                         </span>
                                      </div>
                                   </div>
                                   <div className="flex flex-col items-end">
                                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Status</span>
                                      <span className={`text-[10px] font-black uppercase ${log.leaveTime ? 'text-emerald-500' : 'text-[#FFD700]'}`}>
                                         {log.leaveTime ? 'Closed' : 'Active'}
                                      </span>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherSessionReport;

