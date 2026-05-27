import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, BookOpen, User, Building2, Users } from 'lucide-react';
import { getOptimizedAvatar } from '../utils/imageUtils';
import ClassesSkeleton from './skeletons/ClassesSkeleton';

const StudentTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/student/teachers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeachers(response.data.data);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        toast.error('Failed to load teachers');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  if (loading) {
    return <ClassesSkeleton />;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter">
            MY <span className="text-[#FFD700]">TEACHERS</span>
          </h2>
          <p className="text-gray-500 font-medium italic mt-1">Faculties assigned to your class for the current academic session</p>
        </div>
      </div>

      {teachers.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 shadow-xl shadow-gray-200/50">
          <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ring-8 ring-gray-50/50">
            <User size={40} className="text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 tracking-tight">No Teachers Found</h3>
          <p className="text-gray-500 font-medium italic">There are no faculty members assigned to your class at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teachers.map((teacher) => (
            <div 
              key={teacher._id}
              className="group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:border-[#FFD700]/50 transition-all duration-500 relative overflow-hidden flex flex-col"
            >
              {/* Decorative Background Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

              <div className="flex items-center gap-5 mb-8 relative z-10">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden ring-4 ring-gray-50/50 group-hover:rotate-3 transition-transform duration-500">
                  {teacher.avatar ? (
                    <img src={getOptimizedAvatar(teacher.avatar)} alt={teacher.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-[#FFD700]" size={32} />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight group-hover:text-[#FFD700] transition-colors">
                    {teacher.name}
                  </h3>
                  <p className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.2em] italic">Faculty Assigned</p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-50 flex-1 relative z-10">
                <div className="flex items-center gap-4 text-gray-500 group/item">
                  <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover/item:bg-[#1A1A1A] transition-colors duration-300">
                    <Mail size={14} className="text-[#FFD700] shrink-0" />
                  </div>
                  <span className="text-xs font-black tracking-tight truncate">{teacher.email?.toLowerCase()}</span>
                </div>
                
                <div className="flex items-center gap-4 text-gray-500 group/item">
                   <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover/item:bg-[#1A1A1A] transition-colors duration-300">
                    <Building2 size={14} className="text-[#FFD700] shrink-0" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-tight">{teacher.department || 'Academic Faculty'}</span>
                </div>

                <div className="flex items-center gap-4 text-gray-500 group/item">
                   <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover/item:bg-[#1A1A1A] transition-colors duration-300">
                    <Users size={14} className="text-[#FFD700] shrink-0" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-tight">{teacher.className || 'N/A'}</span>
                </div>
              </div>

              {/* Subject Tag */}
              <div className="mt-8 pt-6 border-t border-gray-50">
                 <div className="inline-flex items-center px-4 py-2 bg-[#1A1A1A] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
                    <BookOpen size={12} className="mr-2 text-[#FFD700]" />
                    {teacher.subject}
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentTeachers;
