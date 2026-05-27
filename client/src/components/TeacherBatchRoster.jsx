import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, GraduationCap, Calendar, Search, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Pagination from './common/Pagination';
import TableSkeleton from './skeletons/TableSkeleton';
import useDebounce from '../hooks/useDebounce';

const getYearLabel = (year) => {
  if (year === 1) return "1st Year";
  if (year === 2) return "2nd Year";
  if (year === 3) return "3rd Year";
  if (year === 4) return "4th Year";
  return "N/A";
};

const TeacherBatchRoster = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 8;

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (classId) fetchRoster();
  }, [classId]);

  // Reset page on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const studentRes = await axios.get(`/api/teacher/class/${classId}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const studentList = studentRes.data.data || [];
      setStudents(studentList);
      if (studentList.length > 0 && studentList[0].classId) {
        setClassInfo(studentList[0].classId);
      }
    } catch (error) {
      console.error('Error fetching roster:', error);
      toast.error('Failed to load student roster');
    } finally {
      setLoading(false);
    }
  };

  // Client-side filter by name or roll number
  const filteredStudents = students.filter(s => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.studentDetails?.rollNo?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginated = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <TableSkeleton />;

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <button
            onClick={() => navigate('/teacher')}
            className="flex items-center text-gray-500 hover:text-[#1A1A1A] mb-4 transition-colors font-bold text-sm uppercase tracking-widest"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </button>
          <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter">
            Student <span className="text-[#FFD700]">Roster</span>
          </h2>
          <p className="text-gray-500 mt-2 font-medium italic uppercase tracking-widest text-[10px]">
            {classInfo ? (
              <span className="flex items-center gap-2">
                <span className="text-[#1A1A1A] font-black underline decoration-[#FFD700] decoration-2 underline-offset-4">
                  {classInfo.departmentId?.name || classInfo.className}
                </span>
                <span className="text-gray-300">|</span>
                <span>Batch {new Date().getFullYear() - (classInfo.year || 1)} - {new Date().getFullYear() - (classInfo.year || 1) + 4}</span>
              </span>
            ) : 'Viewing student roll call'}
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#FFD700]/10 focus:border-[#FFD700] transition-all font-bold text-sm shadow-sm w-64 outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Count badge */}
          <div className="bg-white px-8 py-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
              <Users className="text-[#FFD700]" size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-[#1A1A1A] leading-none italic">
                {debouncedSearch ? `${filteredStudents.length}` : students.length}
                {debouncedSearch && <span className="text-base text-gray-400 ml-1">/ {students.length}</span>}
              </p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrolled Students</p>
            </div>
          </div>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-24 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="text-gray-300" size={40} />
          </div>
          {searchTerm ? (
            <>
              <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 tracking-tight">No Results Found</h3>
              <p className="text-gray-500 max-w-sm mx-auto font-medium italic">
                No students match "<span className="font-black text-[#1A1A1A]">{searchTerm}</span>". Try a different name or roll number.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-6 px-6 py-3 bg-[#FFD700] text-[#1A1A1A] rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#FFED4E] transition-all"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 tracking-tight">No Students Found</h3>
              <p className="text-gray-500 max-w-sm mx-auto font-medium italic">This batch currently has no students assigned by the administrator.</p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">#</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">Student Details</th>
                  <th className="px-10 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">Roll Number</th>
                  <th className="px-10 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">Batch</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((student, idx) => (
                  <tr key={student._id} className="group hover:bg-yellow-50/20 transition-all duration-300">
                    <td className="px-10 py-6">
                      <span className="text-xs font-black text-gray-300 italic">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-[#1A1A1A] transition-colors overflow-hidden flex-shrink-0">
                          <span className="text-xs font-black text-gray-400 group-hover:text-[#FFD700] italic">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          {/* Highlight search match in name */}
                          <p className="text-sm font-black text-gray-800 uppercase tracking-tight">
                            {highlightMatch(student.name, debouncedSearch)}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 tracking-widest">{student.email?.toLowerCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-black text-[#1A1A1A] border border-gray-100 italic">
                        {highlightMatch(student.studentDetails?.rollNo || 'N/A', debouncedSearch)}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="text-xs font-black text-gray-700 italic">
                        {student.studentDetails?.admissionYear
                          ? `${student.studentDetails.admissionYear} - ${student.studentDetails.admissionYear + 4}`
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="inline-flex items-center space-x-2">
                        <Calendar size={14} className="text-[#FFD700]" />
                        <span className="text-xs font-black text-gray-700">
                          {getYearLabel(student.studentDetails?.currentYear)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length > itemsPerPage && (
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

// Highlight matched substring in text
function highlightMatch(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[#FFD700]/40 text-[#1A1A1A] rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default TeacherBatchRoster;
