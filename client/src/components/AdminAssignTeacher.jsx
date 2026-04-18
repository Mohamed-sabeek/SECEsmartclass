import { useState, useEffect } from 'react';
import { Search, CheckCircle, AlertCircle, Users, LayoutGrid, Check, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useDebounce from '../hooks/useDebounce';

const AdminAssignTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState([]);
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchTeachers();
  }, [debouncedSearch]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', { 
        headers: { Authorization: `Bearer ${token}` },
        params: { role: 'teacher', search: debouncedSearch, limit: 100 } // Limit for sidebar
      });
      setTeachers(response.data.data || []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      toast.error('Failed to load teachers');
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/classes', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setClasses(response.data.data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSelect = (teacher) => {
    setSelectedTeacher(teacher);
    // Pre-select already assigned classes (strip any junk data)
    const existingClasses = (teacher.assignedClasses || [])
      .map(cls => typeof cls === 'string' ? cls : cls._id)
      .filter(id => id && id.trim() !== "");
    setSelectedClasses(existingClasses);
    setError('');
  };

  const toggleClass = (classId) => {
    if (selectedClasses.includes(classId)) {
      setSelectedClasses(selectedClasses.filter(id => id !== classId));
    } else {
      setSelectedClasses([...selectedClasses, classId]);
    }
  };

  const handleAssign = async () => {
    if (!selectedTeacher) {
      toast.error('Please select a teacher first');
      return;
    }
    if (selectedClasses.length === 0) {
      toast.error('Please select at least one class');
      return;
    }

    try {
      setAssigning(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/users/assign-classes', {
        teacherId: selectedTeacher._id,
        classIds: selectedClasses
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(response.data.message);
      
      // Update local teacher data
      setTeachers(teachers.map(t => 
        t._id === selectedTeacher._id ? { ...t, assignedClasses: response.data.assignedClasses } : t
      ));
    } catch (err) {
      console.error('Assignment error:', err);
      toast.error(err.response?.data?.message || 'Failed to assign classes');
    } finally {
      setAssigning(false);
    }
  };

  const filteredTeachers = teachers; // Search handled by server now

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
          Class <span className="text-[#FFD700]">Assignment</span>
        </h2>
        <p className="text-gray-500 mt-2 font-medium italic">Assign faculty members to their respective batch batches</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Teacher Selection Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[1.5rem] shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-black text-[#1A1A1A] mb-4 flex items-center">
              <Users size={20} className="mr-2 text-[#FFD700]" />
              Select Faculty
            </h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#FFD700] transition-all text-sm font-bold"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredTeachers.map(teacher => (
                <button
                  key={teacher._id}
                  onClick={() => handleTeacherSelect(teacher)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 border-2 ${
                    selectedTeacher?._id === teacher._id
                      ? 'bg-[#1A1A1A] border-[#FFD700] text-white'
                      : 'bg-white border-transparent hover:bg-yellow-50 text-gray-700'
                  }`}
                >
                  <p className="font-black text-sm">{teacher.name}</p>
                  <p className={`text-xs ${selectedTeacher?._id === teacher._id ? 'text-gray-400' : 'text-gray-500'}`}>
                    {teacher.department}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Class Selection Column */}
        <div className="lg:col-span-8 space-y-6">
          {selectedTeacher ? (
            <div className="bg-white rounded-[1.5rem] shadow-xl border border-gray-100 p-8 animate-in slide-in-from-right-10 duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-gray-50">
                <div>
                  <h3 className="text-xl font-black text-[#1A1A1A]">Assign Classes to {selectedTeacher.name}</h3>
                  <p className="text-gray-500 text-sm font-medium mt-1">Choose the academic batches for this faculty member</p>
                </div>
                <div className="mt-4 sm:mt-0 px-4 py-2 bg-yellow-50 border border-[#FFD700]/20 rounded-xl text-[#FFD700] font-black text-xs uppercase tracking-widest">
                  {selectedClasses.length} Selected
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center shadow-sm">
                  <AlertCircle className="text-red-500 mr-3" size={20} />
                  <p className="text-red-800 font-bold text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {classes.map(cls => {
                  const isSelected = selectedClasses.includes(cls._id);
                  return (
                    <div
                      key={cls._id}
                      onClick={() => toggleClass(cls._id)}
                      className={`group cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 ${
                        isSelected
                          ? 'bg-yellow-50/50 border-[#FFD700] shadow-lg shadow-yellow-500/5'
                          : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-colors ${
                            isSelected ? 'bg-[#FFD700] text-[#1A1A1A]' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                          }`}>
                            <LayoutGrid size={20} />
                          </div>
                          <div>
                            <p className="font-black text-[#1A1A1A] leading-tight">{cls.className}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                              {cls.departmentId?.code || 'Dept'} — {cls.section}
                            </p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected ? 'bg-[#FFD700] scale-110' : 'border-2 border-gray-100'
                        }`}>
                          {isSelected && <Check size={14} className="text-[#1A1A1A] font-black" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSelectedTeacher(null);
                    setSelectedClasses([]);
                  }}
                  className="px-8 py-4 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all font-bold active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assigning}
                  className="flex-1 px-8 py-4 bg-[#FFD700] hover:bg-[#FFED4E] text-[#1A1A1A] rounded-xl transition-all duration-300 font-black shadow-xl hover:shadow-yellow-500/20 active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigning ? (
                    <div className="w-5 h-5 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Check size={20} className="mr-2" />
                  )}
                  {assigning ? 'Processing Commit...' : 'Assign Faculty Path'}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] bg-gray-50/50 rounded-[1.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6 text-gray-300">
                <Users size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-400 capitalize">No Faculty Selected</h3>
              <p className="text-gray-400 mt-2 max-w-xs font-medium italic">
                Choose a teacher from the directory on the left to manage their class assignments.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAssignTeacher;
