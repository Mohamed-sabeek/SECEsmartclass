import { useState, useEffect, useRef } from 'react';
import { History, Calendar, Clock, Loader2, ArrowRight, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Dropdown from './ui/Dropdown';
import Pagination from './common/Pagination';

const TeacherHistory = ({ teacher }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    classId: '',
    subject: '',
    month: '',
    date: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const dateInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPage(1);
    fetchHistory();
  }, [filters]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/sessions/history', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      setHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      classId: '',
      subject: '',
      month: '',
      date: ''
    });
  };

  const handleViewDetails = (id) => {
    navigate(`/teacher/reports/${id}`);
  };

  const calculateDuration = (start, end) => {
    if (!end) return 'Active';
    const diffMs = new Date(end) - new Date(start);
    const totalSeconds = Math.floor(diffMs / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return mins > 0 ? `${mins} mins ${secs} secs` : `${secs} secs`;
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const yearOptions = [new Date().getFullYear(), new Date().getFullYear() - 1];
  const monthOptions = yearOptions.flatMap(year => 
    months.map(month => ({
      label: `${month} ${year}`,
      value: `${month} ${year}`
    }))
  );

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  const totalPages = Math.ceil(history.length / itemsPerPage) || 1;
  const paginatedHistory = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="animate-in slide-in-from-bottom duration-700">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter">
            Academic <span className="text-[#FFD700]">Artifacts</span>
          </h2>
          <p className="text-gray-500 mt-2 font-medium italic text-sm">Log of all previously broadcasted sessions and teaching records</p>
        </div>
        {activeFilterCount > 0 && (
          <button 
            onClick={handleReset}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-[#FFD700] text-gray-500 hover:text-[#1A1A1A] rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm"
          >
            <X size={14} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Dropdown
          value={filters.classId}
          onChange={(val) => setFilters(prev => ({ ...prev, classId: val }))}
          options={[
            { label: 'All Classes', value: '' },
            ...(teacher?.assignedClasses?.map(cls => ({
              label: `${cls.className} (${cls.section})`,
              value: cls._id
            })) || [])
          ]}
          placeholder="Filter by Class"
        />
        <Dropdown
          value={filters.subject}
          onChange={(val) => setFilters(prev => ({ ...prev, subject: val }))}
          options={[
            { label: 'All Subjects', value: '' },
            ...(teacher?.teacherDetails?.subjects?.map(sub => ({
              label: sub,
              value: sub
            })) || [])
          ]}
          placeholder="Filter by Subject"
        />
        <Dropdown
          value={filters.month}
          onChange={(val) => setFilters(prev => ({ ...prev, month: val }))}
          options={[
            { label: 'All Months', value: '' },
            ...monthOptions
          ]}
          placeholder="Filter by Month"
        />

        <div className="relative group">
          <button 
            onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-[#FFD700] hover:scale-110 transition-transform z-20"
          >
            <Calendar size={14} />
          </button>
          <input 
            ref={dateInputRef}
            type="date"
            value={filters.date}
            onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
            className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest focus:outline-none focus:border-[#FFD700] transition-colors cursor-pointer relative date-input-field"
            style={{ colorScheme: 'light' }}
          />
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

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 animate-in fade-in duration-500">
           {filters.classId && (
             <span className="flex items-center space-x-2 px-4 py-2 bg-[#1A1A1A] text-[#FFD700] rounded-xl text-[9px] font-black uppercase tracking-widest italic">
                <span>Class: {teacher?.assignedClasses?.find(c => c._id === filters.classId)?.className}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, classId: '' }))}><X size={10} /></button>
             </span>
           )}
           {filters.subject && (
             <span className="flex items-center space-x-2 px-4 py-2 bg-[#1A1A1A] text-[#FFD700] rounded-xl text-[9px] font-black uppercase tracking-widest italic">
                <span>Subject: {filters.subject}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, subject: '' }))}><X size={10} /></button>
             </span>
           )}
           {filters.month && (
             <span className="flex items-center space-x-2 px-4 py-2 bg-[#1A1A1A] text-[#FFD700] rounded-xl text-[9px] font-black uppercase tracking-widest italic">
                <span>Month: {filters.month}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, month: '' }))}><X size={10} /></button>
             </span>
           )}
           {filters.date && (
             <span className="flex items-center space-x-2 px-4 py-2 bg-[#1A1A1A] text-[#FFD700] rounded-xl text-[9px] font-black uppercase tracking-widest italic">
                <span>Date: {filters.date}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, date: '' }))}><X size={10} /></button>
             </span>
           )}
        </div>
      )}

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
           <Loader2 className="animate-spin text-[#FFD700] mb-4" size={40} />
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Syncing with academic archives...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <History className="text-gray-300" size={40} />
            </div>
            <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 tracking-tight">
              {activeFilterCount > 0 ? "No Sessions Found" : "Archives Empty"}
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto font-medium italic text-lg leading-snug">
              {activeFilterCount > 0 
                ? "Try adjusting your filters to find the specific session you're looking for." 
                : "Your academic teaching history will appear here once you complete your first broadcast session."}
            </p>
            {activeFilterCount > 0 && (
              <button 
                onClick={handleReset}
                className="mt-8 text-[#FFD700] font-black uppercase tracking-widest text-xs hover:underline underline-offset-4"
              >
                Clear all filters
              </button>
            )}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden mb-10">
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
                {paginatedHistory.map((session) => (
                  <tr key={session._id} className="group hover:bg-yellow-50/20 transition-all duration-300">
                    <td className="px-10 py-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-[#1A1A1A] transition-colors">
                           <Calendar size={18} className="text-[#FFD700]" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{session.classId?.className || 'Deleted Class'}</p>
                          <div className="flex items-center space-x-2 mt-1">
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{session.classId?.year} Year — {session.classId?.section}</span>
                             <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                             <span className="text-[10px] font-black text-[#FFD700] uppercase italic">{session.subject}</span>
                          </div>
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
          
          {history.length > 0 && (
            <div className="py-4 bg-white border-t border-gray-100">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherHistory;
