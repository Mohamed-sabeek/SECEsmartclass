import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, BookOpen, User } from 'lucide-react';

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">MY TEACHERS</h2>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-[0.2em] mt-1">Faculties assigned to your class</p>
        </div>
      </div>

      {teachers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-md">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Teachers Found</h3>
          <p className="text-gray-500 font-medium">There are no teachers assigned to your class at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div 
              key={teacher._id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden">
                  {teacher.avatar ? (
                    <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-[#FFD700]" size={28} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A1A]">
                    {teacher.name}
                  </h3>
                  <p className="text-xs font-black text-[#FFD700] uppercase tracking-widest">{teacher.subject}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3 text-gray-500">
                  <Mail size={16} className="text-gray-400 shrink-0" />
                  <span className="text-sm font-medium truncate">{teacher.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <BookOpen size={16} className="text-gray-400 shrink-0" />
                  <span className="text-sm font-medium">{teacher.subject}</span>
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
