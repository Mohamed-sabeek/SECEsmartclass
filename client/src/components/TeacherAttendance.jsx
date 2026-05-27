import { useState, useEffect } from 'react';
import { ClipboardCheck, Search, Filter, Users, CheckCircle, XCircle, Loader2, Info, ArrowUpRight, GraduationCap } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Dropdown from './ui/Dropdown';
import Pagination from './common/Pagination';
import useDebounce from '../hooks/useDebounce';
import TableSkeleton from './skeletons/TableSkeleton';

const TeacherAttendance = ({ teacher }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ totalStudents: 0, avgPercentage: 0, totalSessions: 0 });
  const itemsPerPage = 8;

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    setCurrentPage(1);
    fetchAttendance(1);
  }, [debouncedSearch, selectedClass, selectedSection]);

  useEffect(() => {
    fetchAttendance(currentPage);
  }, [currentPage]);

  const fetchAttendance = async (page = currentPage) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/attendance/teacher', {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          classId: selectedClass,
          section: selectedSection,
          search: debouncedSearch,
          page,
          limit: itemsPerPage
        }
      });
      setAttendanceData(response.data.data || []);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages || 1);
      }
      if (response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance analytics');
    } finally {
      setLoading(false);
    }
  };

  const paginatedData = attendanceData;

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

  if (loading && attendanceData.length === 0) {
    return <TableSkeleton />;
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter">
            Attendance <span className="text-[#FFD700]">Tracking</span>
          </h2>
          <p className="text-gray-500 mt-2 font-medium italic">Detailed breakdown of student participation across your academic sessions</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#FFD700]/10 focus:border-[#FFD700] transition-all font-bold text-sm shadow-sm"
            />
          </div>
          
          <Dropdown
            value={selectedClass}
            onChange={(val) => {
              setSelectedClass(val);
              setSelectedSection('');
            }}
            options={[
              { label: "All Assigned Classes", value: "" },
              ...(teacher?.assignedClasses?.map(cls => ({
                label: `${cls.className} — Year ${cls.year}`,
                value: cls._id
              })) || [])
            ]}
            placeholder="All Assigned Classes"
            className="w-full sm:min-w-[200px]"
          />

          <Dropdown
            value={selectedSection}
            onChange={setSelectedSection}
            options={[
              { label: "All Sections", value: "" },
              ...(selectedClass && teacher?.assignedClasses?.find(c => c._id === selectedClass)?.sections
                ? teacher.assignedClasses.find(c => c._id === selectedClass).sections.map(s => ({
                    label: `Section ${s.name}`,
                    value: s.name
                  }))
                : [])
            ]}
            placeholder={selectedClass ? "All Sections" : "Choose Class First"}
            className="w-full sm:min-w-[150px]"
            disabled={!selectedClass}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex items-center group hover:border-[#FFD700] transition-all duration-500">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
            <Users className="text-blue-500" size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Students</p>
            <h4 className="text-3xl font-black text-[#1A1A1A] italic leading-none">{stats.totalStudents}</h4>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex items-center group hover:border-[#FFD700] transition-all duration-500">
          <div className="w-14 h-14 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
            <ClipboardCheck className="text-[#FFD700]" size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Attendance</p>
            <h4 className="text-3xl font-black text-[#1A1A1A] italic leading-none">{stats.avgPercentage}%</h4>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex items-center group hover:border-[#FFD700] transition-all duration-500">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
            <Info className="text-purple-500" size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Sessions</p>
            <h4 className="text-3xl font-black text-[#1A1A1A] italic leading-none">{stats.totalSessions}</h4>
          </div>
        </div>
      </div>

      {/* Analytics Table */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center font-black text-[#FFD700] italic uppercase tracking-[0.2em] text-sm animate-pulse">
            Refreshing Analytics...
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Student Identity</th>
                <th className="px-10 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Section</th>
                <th className="px-10 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Total</th>
                <th className="px-10 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Present</th>
                <th className="px-10 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Absent</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Participation Metric</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-10 py-24 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <GraduationCap className="text-gray-200" size={40} />
                    </div>
                    <p className="text-xl font-black text-gray-800 tracking-tight italic">No Attendance Data Found</p>
                    <p className="text-gray-400 text-sm mt-1 font-medium italic">Try adjusting filters or starting a live session</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((data) => (
                  <tr key={data.studentId} className="group hover:bg-yellow-50/20 transition-all duration-300">
                    <td className="px-10 py-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-[#1A1A1A] transition-colors overflow-hidden">
                          <span className="text-xs font-black text-gray-400 group-hover:text-[#FFD700] uppercase tracking-tighter">
                            {data.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#1A1A1A] leading-tight">{data.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{data.rollNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center text-sm font-black text-gray-600 italic uppercase">{data.section}</td>
                    <td className="px-10 py-6 text-center text-sm font-black text-gray-800 italic uppercase">{data.totalClasses}</td>
                    <td className="px-10 py-6 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100">
                        <CheckCircle size={10} className="mr-1.5" />
                        {data.presentCount}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100">
                        <XCircle size={10} className="mr-1.5" />
                        {data.absentCount}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col space-y-2 min-w-[120px]">
                        <div className="flex justify-between items-end">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${getPercentageColor(data.percentage)}`}>
                            {data.percentage}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${getPercentageBarColor(data.percentage)}`}
                            style={{ width: `${data.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button className="p-3 bg-gray-50 rounded-xl text-gray-300 hover:bg-[#1A1A1A] hover:text-[#FFD700] transition-all transform hover:rotate-12">
                        <ArrowUpRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {paginatedData.length > 0 && (
          <div className="py-4 bg-white border-t border-gray-100">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendance;
