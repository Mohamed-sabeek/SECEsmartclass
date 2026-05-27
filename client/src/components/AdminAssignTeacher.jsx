import { useState, useEffect } from 'react';
import { Search, CheckCircle, AlertCircle, Users, LayoutGrid, Check, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useDebounce from '../hooks/useDebounce';
import Dropdown from './ui/Dropdown';
import TableSkeleton from './skeletons/TableSkeleton';

const AdminAssignTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedAssignments, setSelectedAssignments] = useState([]); // Array of { classId, subject }
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    year: ''
  });
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedClassSearch = useDebounce(filters.search, 300);

  useEffect(() => {
    fetchTeachers();
  }, [debouncedSearch]);

  useEffect(() => {
    fetchClasses();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data.departments || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

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
    // Pre-select already assigned classes with their subjects
    const existingAssignments = (teacher.classAssignments || []).map(a => ({
      classId: a.classId._id || a.classId,
      subject: a.subject
    }));

    // Fallback for legacy data without classAssignments
    if (existingAssignments.length === 0 && teacher.assignedClasses?.length > 0) {
      teacher.assignedClasses.forEach(cls => {
        existingAssignments.push({
          classId: typeof cls === 'string' ? cls : cls._id,
          subject: teacher.teacherDetails?.subjects?.[0] || ''
        });
      });
    }

    setSelectedAssignments(existingAssignments);
    setError('');
  };

  const toggleClass = (classId) => {
    const isAssigned = selectedAssignments.some(a => a.classId === classId);
    if (isAssigned) {
      setSelectedAssignments(selectedAssignments.filter(a => a.classId !== classId));
    } else {
      setSelectedAssignments([...selectedAssignments, { 
        classId, 
        subject: selectedTeacher?.teacherDetails?.subjects?.[0] || '' 
      }]);
    }
  };

  const updateAssignmentSubject = (classId, subject) => {
    setSelectedAssignments(selectedAssignments.map(a => 
      a.classId === classId ? { ...a, subject } : a
    ));
  };

  const handleAssign = async () => {
    if (!selectedTeacher) {
      toast.error('Please select a teacher first');
      return;
    }
    if (selectedAssignments.length === 0) {
      toast.error('Please select at least one class');
      return;
    }

    // Validate that all assignments have a subject
    const missingSubject = selectedAssignments.some(a => !a.subject);
    if (missingSubject) {
      toast.error('Please select a subject for all assigned classes');
      return;
    }

    try {
      setAssigning(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/users/assign-classes', {
        teacherId: selectedTeacher._id,
        classAssignments: selectedAssignments
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
      <div className="animate-pulse max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="h-9 w-64 bg-gray-200 rounded-2xl mb-3"></div>
          <div className="h-4 w-96 bg-gray-200 rounded-xl"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Teacher Selection Column Shimmer */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[1.5rem] shadow-xl border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <div className="w-5 h-5 bg-gray-200 rounded-md mr-2"></div>
                <div className="h-5 w-32 bg-gray-200 rounded-md"></div>
              </div>
              
              <div className="h-12 bg-gray-50 rounded-xl mb-4"></div>

              <div className="space-y-2 max-h-[400px]">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 bg-white border border-gray-100 rounded-xl space-y-2 shadow-sm">
                    <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
                    <div className="h-3 w-16 bg-gray-100 rounded-md"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Class Assignment Area Empty State Shimmer */}
          <div className="lg:col-span-8">
            <div className="h-full min-h-[600px] bg-gray-50/50 rounded-[1.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6">
                <div className="w-10 h-10 bg-gray-150 rounded-2xl"></div>
              </div>
              <div className="h-7 w-64 bg-gray-200 rounded-xl mb-3"></div>
              <div className="h-4 w-80 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
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

        {/* Class Assignment Area */}
        <div className="lg:col-span-8 space-y-6">
          {selectedTeacher ? (
            <div className="bg-white rounded-[1.5rem] shadow-xl border border-gray-100 p-8 animate-in slide-in-from-right-10 duration-500 min-h-[600px] flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-gray-50">
                <div>
                  <h3 className="text-xl font-black text-[#1A1A1A]">Assignment for {selectedTeacher.name}</h3>
                  <p className="text-gray-500 text-sm font-medium mt-1">Manage institutional batch allocations</p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-4">
                  <div className="px-4 py-2 bg-yellow-50 border border-[#FFD700]/20 rounded-xl text-[#FFD700] font-black text-xs uppercase tracking-widest">
                    {selectedAssignments.length} Assigned
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search classes..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#FFD700] transition-all text-xs font-bold"
                  />
                </div>
                <Dropdown
                  value={filters.department}
                  onChange={(val) => setFilters({...filters, department: val})}
                  options={[
                    { label: "All Departments", value: "" },
                    ...departments.map(dept => ({ label: dept.name, value: dept.code }))
                  ]}
                  placeholder="All Departments"
                  className="w-full"
                />
                <Dropdown
                  value={filters.year}
                  onChange={(val) => setFilters({...filters, year: val})}
                  options={[
                    { label: "All Years", value: "" },
                    { label: "1st Year", value: "1" },
                    { label: "2nd Year", value: "2" },
                    { label: "3rd Year", value: "3" },
                    { label: "4th Year", value: "4" }
                  ]}
                  placeholder="All Years"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                {/* Assigned Column */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                    Assigned Classes
                  </h4>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 pb-40 custom-scrollbar">
                    {classes.filter(cls => selectedAssignments.some(a => a.classId === cls._id)).length === 0 ? (
                      <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-xs font-bold text-gray-400 italic">No classes assigned yet</p>
                      </div>
                    ) : (
                      classes
                        .filter(cls => selectedAssignments.some(a => a.classId === cls._id))
                        .map(cls => {
                          const assignment = selectedAssignments.find(a => a.classId === cls._id);
                          return (
                            <div key={cls._id} className="group p-5 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mr-3">
                                    <LayoutGrid size={20} />
                                  </div>
                                  <div>
                                    <p className="font-black text-sm text-[#1A1A1A]">{cls.className}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                      {cls.departmentId?.code} — Yr {cls.year}
                                    </p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => toggleClass(cls._id)}
                                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                              
                              {/* Subject Selection for this assignment */}
                              <div className="relative">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1 italic">Assigned Subject</label>
                                <Dropdown
                                  value={assignment.subject}
                                  onChange={(val) => updateAssignmentSubject(cls._id, val)}
                                  options={selectedTeacher?.teacherDetails?.subjects?.map(sub => ({
                                    label: sub,
                                    value: sub
                                  })) || []}
                                  placeholder="Select Subject"
                                  className="w-full"
                                  buttonClassName="!py-2 !text-xs !font-bold !bg-gray-50 !border-none !rounded-xl"
                                />
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Available Column */}
                <div className="space-y-4 border-l border-gray-50 pl-8">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-300 mr-2"></div>
                    Available Classes
                  </h4>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 pb-40 custom-scrollbar">
                    {(() => {
                      const filtered = classes.filter(cls => {
                        const isNotAssigned = !selectedAssignments.some(a => a.classId === cls._id);
                        const matchesSearch = cls.className.toLowerCase().includes(debouncedClassSearch.toLowerCase());
                        const matchesDept = !filters.department || cls.departmentId?.code === filters.department;
                        const matchesYear = !filters.year || String(cls.year) === filters.year;
                        return isNotAssigned && matchesSearch && matchesDept && matchesYear;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-xs font-bold text-gray-400 italic">No available classes found</p>
                          </div>
                        );
                      }

                      return filtered.map(cls => (
                        <div key={cls._id} className="group p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-[#FFD700] group-hover:text-[#1A1A1A] flex items-center justify-center mr-3 transition-colors">
                                <LayoutGrid size={16} />
                              </div>
                              <div>
                                <p className="font-black text-sm text-[#1A1A1A]">{cls.className}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  {cls.departmentId?.code} — Yr {cls.year}
                                </p>
                              </div>
                            </div>
                            <button 
                              onClick={() => toggleClass(cls._id)}
                              className="p-2 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                            >
                              <CheckCircle size={16} />
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-50 flex gap-4">
                <button
                  onClick={() => {
                    setSelectedTeacher(null);
                    setSelectedAssignments([]);
                  }}
                  className="px-8 py-4 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all font-bold active:scale-95 text-sm"
                >
                  Discard Changes
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assigning}
                  className="flex-1 px-8 py-4 bg-[#FFD700] hover:bg-[#FFED4E] text-[#1A1A1A] rounded-xl transition-all duration-300 font-black shadow-xl hover:shadow-yellow-500/20 active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
                >
                  {assigning ? (
                    <div className="w-5 h-5 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Check size={20} className="mr-2" />
                  )}
                  {assigning ? 'Syncing...' : 'Save Assignments'}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[600px] bg-gray-50/50 rounded-[1.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6 text-gray-300">
                <Users size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-400 capitalize">Faculty Intelligence Directory</h3>
              <p className="text-gray-400 mt-2 max-w-xs font-medium italic">
                Select a staff member from the left navigation panel to start the academic bench configuration process.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAssignTeacher;
