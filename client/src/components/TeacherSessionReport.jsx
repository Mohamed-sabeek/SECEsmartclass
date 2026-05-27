import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatTime, formatDate } from '../utils/dateUtils';
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
  Activity,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import Dropdown from './ui/Dropdown';
import SessionReportSkeleton from './skeletons/SessionReportSkeleton';

const TeacherSessionReport = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  
  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');

  useEffect(() => {
    fetchReport();
  }, [sessionId]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
      link.setAttribute('download', `Report-${report?.subject || 'Attendance'}.xlsx`);
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

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/sessions/report/${sessionId}/export/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Report-${report?.subject || 'Attendance'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF Export error:', error);
      toast.error('Failed to export PDF report');
    } finally {
      setExportingPDF(false);
    }
  };

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



  const getFilteredAndSortedStudents = () => {
    if (!report) return [];
    
    let result = [...report.students];

    // Search Filter
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(s => 
        s.studentName.toLowerCase().includes(term) || 
        s.email.toLowerCase().includes(term)
      );
    }

    // Status Filter
    if (statusFilter !== 'All') {
      result = result.filter(s => s.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.studentName.localeCompare(b.studentName);
        case 'name-desc':
          return b.studentName.localeCompare(a.studentName);
        case 'percentage-desc':
          return (b.attendancePercentage || 0) - (a.attendancePercentage || 0);
        case 'percentage-asc':
          return (a.attendancePercentage || 0) - (b.attendancePercentage || 0);
        case 'duration-desc':
          const getSecs = (dur) => {
            if (!dur) return 0;
            const parts = dur.split(' ');
            let total = 0;
            if (parts.includes('mins')) total += parseInt(parts[parts.indexOf('mins') - 1]) * 60;
            if (parts.includes('secs')) total += parseInt(parts[parts.indexOf('secs') - 1]);
            return total;
          };
          return getSecs(b.attendedDuration) - getSecs(a.attendedDuration);
        default:
          return 0;
      }
    });

    return result;
  };

  if (loading) {
    return <SessionReportSkeleton />;
  }

  const filteredStudents = getFilteredAndSortedStudents();

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

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {/* Excel Export Button */}
            <button 
              onClick={handleExportExcel}
              disabled={exportingExcel || exportingPDF}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-white border border-gray-100 text-[#1A1A1A] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {exportingExcel ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Activity size={16} className="mr-2 text-[#FFD700]" />}
              {exportingExcel ? 'Processing...' : 'Export Excel'}
            </button>

            {/* PDF Export Button */}
            <button 
              onClick={handleExportPDF}
              disabled={exportingExcel || exportingPDF}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-[#1A1A1A] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#FFD700] hover:text-[#1A1A1A] transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {exportingPDF ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Download size={16} className="mr-2" />}
              {exportingPDF ? 'Generating...' : 'Export PDF'}
            </button>
        </div>
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

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
             <div className="bg-gray-50 rounded-[2rem] p-6 text-center border border-gray-100 w-full sm:min-w-[140px]">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Duration</p>
                <p className="text-3xl font-black text-[#1A1A1A]">{report.totalDuration}</p>
             </div>
             <div className="bg-[#1A1A1A] rounded-[2rem] p-6 text-center shadow-lg w-full sm:min-w-[140px]">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Present Count</p>
                <p className="text-3xl font-black text-white">{report.students.filter(s => s.status === 'Present').length}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="relative group">
           <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FFD700] transition-colors" size={18} />
           <input 
             type="text"
             placeholder="Search by name, email or roll..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-14 pr-6 py-5 rounded-[2rem] bg-white border border-gray-100 shadow-sm text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD700]/10 focus:border-[#FFD700] transition-all"
           />
        </div>

        <Dropdown 
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'All Statuses', value: 'All' },
            { label: 'Present Only', value: 'Present' },
            { label: 'Absent Only', value: 'Absent' }
          ]}
          buttonClassName="!rounded-[2rem] !py-5 !bg-white !border-gray-100 !font-bold !text-sm !shadow-sm"
        />

        <Dropdown 
          value={sortBy}
          onChange={setSortBy}
          options={[
            { label: 'Sort: Name (A-Z)', value: 'name-asc' },
            { label: 'Sort: Name (Z-A)', value: 'name-desc' },
            { label: 'Sort: Percentage (High)', value: 'percentage-desc' },
            { label: 'Sort: Percentage (Low)', value: 'percentage-asc' },
            { label: 'Sort: Duration (Longest)', value: 'duration-desc' }
          ]}
          buttonClassName="!rounded-[2rem] !py-5 !bg-white !border-gray-100 !font-bold !text-sm !shadow-sm"
        />
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden mb-20">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight flex items-center">
              <Activity className="text-[#FFD700] mr-3" size={20} />
              ATTENDANCE ROSTER
              {debouncedSearch && <span className="ml-4 px-3 py-1 bg-yellow-50 text-[#FFD700] rounded-lg text-[10px] italic">Results for "{debouncedSearch}"</span>}
            </h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{filteredStudents.length} Students Listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Student Identity</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">First Join</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Last Leave</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Duration & %</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Engagement</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-24 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                         <XCircle className="text-gray-200" size={32} />
                      </div>
                      <p className="text-gray-400 font-black uppercase tracking-widest text-xs italic">No matching records found for current filters</p>
                      <button onClick={() => { setSearchTerm(''); setStatusFilter('All'); }} className="mt-4 text-[#FFD700] font-black text-[10px] uppercase tracking-widest hover:underline">Clear Search</button>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <React.Fragment key={index}>
                    <tr className={`hover:bg-gray-50/50 transition-all duration-300 group ${expandedRows[index] ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-10 py-6">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-sm group-hover:rotate-6 transition-transform ${student.status === 'Present' ? 'bg-[#1A1A1A] text-[#FFD700]' : 'bg-gray-50 text-gray-300'}`}>
                            {student.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-base font-black text-[#1A1A1A] tracking-tight">{student.studentName}</p>
                            <p className="text-[10px] font-bold text-gray-400 tracking-tighter">{student.email?.toLowerCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                         <span className="text-xs font-black text-gray-800 italic uppercase">
                           {student.firstJoinTime ? formatTime(student.firstJoinTime) : '—'}
                         </span>

                      </td>
                      <td className="px-10 py-6 text-center">
                         <span className="text-xs font-black text-gray-800 italic uppercase">
                           {student.lastLeaveTime ? formatTime(student.lastLeaveTime) : (student.status === 'Present' ? 'Live' : '—')}
                         </span>
                      </td>
                      <td className="px-10 py-6 text-center">
                         <div className="flex flex-col items-center">
                            <span className={`text-xs font-black ${student.status === 'Present' ? 'text-[#1A1A1A]' : 'text-gray-300'}`}>
                              {student.attendedDuration}
                            </span>
                            {student.attendancePercentage !== undefined && (
                              <div className="w-20 h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                 <div 
                                   className={`h-full transition-all duration-1000 ${student.attendancePercentage >= 70 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                                   style={{ width: `${student.attendancePercentage}%` }}
                                 ></div>
                              </div>
                            )}
                            <span className="text-[9px] font-black text-gray-400 mt-1 italic">{student.attendancePercentage}% score</span>
                         </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                         <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl border ${student.status === 'Present' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-500'}`}>
                            {student.status === 'Present' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">{student.status}</span>
                         </div>
                      </td>

                      <td className="px-10 py-6 text-center">
                        <div className="flex flex-col items-center">
                           <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                             student.tabSwitchCount === 0 ? 'bg-green-50 text-green-600' :
                             student.tabSwitchCount < 3 ? 'bg-blue-50 text-blue-600' :
                             student.tabSwitchCount < 6 ? 'bg-yellow-50 text-yellow-600' :
                             'bg-red-50 text-red-600'
                           }`}>
                              {student.tabSwitchCount} {student.tabSwitchCount === 1 ? 'Switch' : 'Switches'}
                           </div>
                           <span className="text-[8px] font-black text-gray-400 mt-1 uppercase italic tracking-widest">Tab Visibility</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        {student.logs?.length > 0 && (
                          <button 
                            onClick={() => toggleRow(index)}
                            className={`p-3 rounded-2xl transition-all shadow-sm ${expandedRows[index] ? 'bg-[#1A1A1A] text-[#FFD700] rotate-180' : 'bg-gray-50 text-gray-400 hover:bg-[#FFD700] hover:text-[#1A1A1A]'}`}
                          >
                            <ChevronDown size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {/* Expanded Audit Log */}
                    {expandedRows[index] && (
                      <tr className="bg-gray-50/30 animate-in slide-in-from-top-4 duration-500">
                        <td colSpan="6" className="px-10 py-10">
                           <div className="max-w-4xl mx-auto">
                              <div className="flex items-center space-x-3 mb-6">
                                 <div className="w-8 h-8 bg-[#1A1A1A] rounded-xl flex items-center justify-center">
                                    <Activity size={16} className="text-[#FFD700]" />
                                 </div>
                                 <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-[0.3em] italic">Precision Audit Sequence</h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 {student.logs.map((log, logIdx) => (
                                   <div key={logIdx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl flex flex-col space-y-4 group/log hover:border-[#FFD700] transition-colors">
                                      <div className="flex justify-between items-center">
                                         <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Entry #{logIdx + 1}</span>
                                         <div className={`w-2 h-2 rounded-full ${log.leaveTime ? 'bg-emerald-500' : 'bg-[#FFD700] animate-pulse'}`}></div>
                                      </div>
                                      <div className="flex justify-between items-end pt-2">
                                         <div className="space-y-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic leading-none">Clock In</p>
                                            <p className="text-sm font-black text-[#1A1A1A] italic uppercase">{formatTime(log.joinTime)}</p>
                                         </div>
                                         <ArrowRight size={14} className="text-gray-200 group-hover/log:translate-x-1 transition-transform mb-1" />
                                         <div className="space-y-1 text-right">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic leading-none">Clock Out</p>
                                            <p className="text-sm font-black text-[#1A1A1A] italic uppercase">{formatTime(log.leaveTime)}</p>
                                         </div>
                                      </div>
                                   </div>
                                 ))}
                              </div>
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

