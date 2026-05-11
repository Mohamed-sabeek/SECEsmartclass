import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, GraduationCap, Mail, Calendar } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    if (classId) {
      fetchRoster();
    }
  }, [classId]);

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // 1. Fetch Students using the new RESTful teacher-specific endpoint
      const studentRes = await axios.get(`/api/teacher/class/${classId}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const studentList = studentRes.data.data || [];
      setStudents(studentList);

      // 2. Fetch Class Info (from the first student if available)
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

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
        <Loader2 className="animate-spin text-[#FFD700]" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                {classInfo.section && classInfo.section !== 'NA' && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span>Section {classInfo.section}</span>
                  </>
                )}
              </span>
            ) : (
              'Viewing student roll call'
            )}
          </p>
        </div>
        
        <div className="bg-white px-8 py-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
           <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
              <Users className="text-[#FFD700]" size={24} />
           </div>
           <div>
              <p className="text-2xl font-black text-[#1A1A1A] leading-none italic">{students.length}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrolled Students</p>
           </div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <GraduationCap className="text-gray-300" size={40} />
            </div>
            <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 tracking-tight">No Students Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto font-medium italic">This batch currently has no students assigned by the administrator.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 font-black">Student Details</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 text-center font-black">Roll Number</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 text-center font-black">Batch</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 font-black">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student) => (
                  <tr key={student._id} className="group hover:bg-yellow-50/20 transition-all duration-300">
                    <td className="px-10 py-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-[#1A1A1A] transition-colors overflow-hidden">
                           <span className="text-xs font-black text-gray-400 group-hover:text-[#FFD700] italic">
                             {student.name.charAt(0)}
                           </span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{student.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 tracking-widest">{student.email?.toLowerCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-black text-[#1A1A1A] border border-gray-100 italic">
                        {student.studentDetails?.rollNo || 'N/A'}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="text-xs font-black text-gray-700 italic">
                        {student.studentDetails?.admissionYear ? `${student.studentDetails.admissionYear} - ${student.studentDetails.admissionYear + 4}` : 'N/A'}
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
        </div>
      )}
    </div>
  );
};

export default TeacherBatchRoster;
