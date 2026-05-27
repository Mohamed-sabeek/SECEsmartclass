import { useState, useEffect, useRef } from 'react';
import { Plus, Search, X, AlertCircle, GraduationCap, LayoutGrid, Edit2, Trash2, Upload, Filter, ChevronRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import defaultAvatar from '../assets/default-avatar.jpg';
import Dropdown from './ui/Dropdown';
import useDebounce from '../hooks/useDebounce';
import Pagination from './common/Pagination';
import { getOptimizedAvatar } from '../utils/imageUtils';

const getYearLabel = (year) => {
  if (year === 1) return "1st Year";
  if (year === 2) return "2nd Year";
  if (year === 3) return "3rd Year";
  if (year === 4) return "4th Year";
  return "N/A";
};

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [filters, setFilters] = useState({ classId: '', departmentId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNo: '',
    classId: '',
    section: '',
    admissionYear: '',
    currentYear: ''
  });

  useEffect(() => {
    fetchStudents(1);
  }, [debouncedSearch, filters]);

  const fetchStudents = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          role: 'student',
          page,
          search: debouncedSearch,
          classId: filters.classId,
          departmentId: filters.departmentId
        }
      });
      
      const { data, totalPages, totalCount } = response.data;
      setStudents(data || []);
      setPagination({ page, totalPages, totalCount });
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(response.data.data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const [departments, setDepartments] = useState([]);
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

  useEffect(() => {
    fetchClasses();
    fetchDepartments();
  }, []);

  const handleEdit = (student) => {
    setModalMode('edit');
    setSelectedItem(student);
    setFormData({
      name: student.name,
      email: student.email,
      rollNo: student.studentDetails?.rollNo || '',
      classId: student.classId?._id || student.classId || '',
      section: student.section || '',
      admissionYear: student.studentDetails?.admissionYear || '',
      currentYear: student.studentDetails?.currentYear ? String(student.studentDetails.currentYear) : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Student record removed successfully');
        fetchStudents(pagination.page);
      } catch (err) {
        console.error('Error deleting student:', err);
        toast.error(err.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      if (!formData.classId) {
        toast.error('Please select a class for assignment');
        return;
      }
      if (!formData.section) {
        toast.error('Please select a section');
        return;
      }

      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        role: 'student',
        admissionYear: Number(formData.admissionYear),
        currentYear: Number(formData.currentYear)
      };

      if (modalMode === 'add') {
        const response = await axios.post('/api/users', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`Student enrolled successfully!`);
      } else {
        await axios.put(`/api/users/${selectedItem._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Student record updated successfully!');
      }

      setFormData({ name: '', email: '', rollNo: '', classId: '', section: '', admissionYear: '', currentYear: '' });
      setShowModal(false);
      // On add → go to page 1 so the new student is visible.
      // On edit → stay on the current page so the user isn't jumped back.
      fetchStudents(modalMode === 'add' ? 1 : pagination.page);
    } catch (err) {
      console.error('Error enrolling student:', err);
      toast.error(err.response?.data?.message || 'Failed to enroll student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('role', 'student');

    const loadingToast = toast.loading('Uploading students...');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/users/bulk-upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success(response.data.message, { id: loadingToast, duration: 5000 });
      fetchStudents(1);
    } catch (err) {
      console.error('Bulk upload error:', err);
      toast.error('Bulk upload failed', { id: loadingToast });
    }
    // Reset input
    e.target.value = null;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.studentDetails?.rollNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
            Student <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFD700] to-[#FFED4E]">Management</span>
          </h2>
          <p className="text-gray-500 mt-1 text-sm font-medium italic">Assign academic batches and manage credentials</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleBulkUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group flex items-center bg-[#1A1A1A] hover:bg-gray-800 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-xl font-bold text-sm"
          >
            <Upload size={18} className="mr-2" />
            Bulk Upload
          </button>
          <button
            onClick={() => {
              setModalMode('add');
              setFormData({ name: '', email: '', rollNo: '', classId: '', section: '', admissionYear: '', currentYear: '' });
              setShowModal(true);
            }}
            className="group flex items-center bg-[#FFD700] hover:bg-[#FFED4E] text-[#1A1A1A] px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 font-bold active:scale-95 text-sm"
          >
            <Plus size={20} className="mr-2" />
            Enroll Student
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center shadow-sm">
          <AlertCircle className="text-red-500 mr-3" size={24} />
          <p className="text-red-800 font-bold">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-[1.5rem] shadow-xl border border-gray-100 overflow-hidden mb-10">
        <div className="p-8 border-b border-gray-50 bg-gray-50/20">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#FFD700] transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search by name, email or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#FFD700]/10 focus:border-[#FFD700] transition-all text-base shadow-sm font-bold"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Dropdown
                value={filters.departmentId}
                onChange={(val) => setFilters({...filters, departmentId: val})}
                options={[
                  { label: "All Departments", value: "" },
                  ...departments.map(dept => ({ label: dept.name, value: dept.code }))
                ]}
                placeholder="All Departments"
                className="min-w-[200px]"
              />

              <Dropdown
                value={filters.classId}
                onChange={(val) => setFilters({...filters, classId: val})}
                options={[
                  { label: "All Classes", value: "" },
                  ...classes.map(cls => ({ label: `Year ${cls.year} — ${cls.className}`, value: cls._id }))
                ]}
                placeholder="All Classes"
                className="min-w-[200px]"
              />
            </div>
          </div>
        </div>

        {!loading && filteredStudents.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="text-gray-300" size={48} />
            </div>
            <p className="text-gray-800 text-2xl font-bold">No Students Found</p>
            <p className="text-gray-500 mt-2 text-lg">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/30">
                  <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Identity</th>
                  <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Academic Batch</th>
                  <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Registration No</th>
                  <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Level</th>
                  <th className="px-10 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ?
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-10 py-5">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-xl bg-gray-105 mr-4"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-200 rounded-lg"></div>
                            <div className="h-3 w-24 bg-gray-200 rounded-lg"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="h-4 w-32 bg-gray-200 rounded-lg"></div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="h-4 w-24 bg-gray-250 rounded-lg"></div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="h-4 w-20 bg-gray-200 rounded-lg"></div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="h-8 w-20 bg-gray-200 rounded-lg mx-auto"></div>
                      </td>
                    </tr>
                  ))
                :
                  filteredStudents.map((student) => (
                  <tr key={student._id} className="group hover:bg-yellow-50/30 transition-all duration-300">
                    <td className="px-10 py-5">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#FFD700] font-black text-base mr-4 border-2 border-white shadow-sm group-hover:bg-[#FFD700] group-hover:text-[#1A1A1A] transition-colors overflow-hidden">
                          <img 
                            src={getOptimizedAvatar(student.avatar)} 
                            alt={student.name} 
                            onError={(e) => {
                              e.currentTarget.src = defaultAvatar;
                            }}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-[#1A1A1A]">{student.name}</span>
                          <span className="text-gray-400 text-xs font-medium">{student.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex items-center p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm group-hover:border-[#FFD700]/30 transition-colors">
                        <LayoutGrid size={16} className="text-[#FFD700] mr-2.5" />
                        <span className="text-[#1A1A1A] font-bold text-sm">
                          {student.classId ? 
                            `${student.classId.className} (S-${student.section || '?'})` : 
                            'Unassigned'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <span className="px-4 py-1.5 bg-gray-50/80 rounded-lg text-[#1A1A1A] font-black text-xs tracking-widest border border-gray-100 uppercase">
                        {student.studentDetails?.rollNo || 'N/A'}
                      </span>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex flex-col">
                        <span className="text-gray-700 font-black text-sm">
                          {student.studentDetails?.admissionYear 
                            ? `${student.studentDetails.admissionYear} - ${student.studentDetails.admissionYear + 4}` 
                            : 'N/A'}
                        </span>
                        <span className="text-gray-400 text-[9px] uppercase font-bold tracking-widest mt-0.5">
                          {getYearLabel(student.studentDetails?.currentYear)}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-3 text-gray-400 hover:text-[#FFD700] hover:bg-white rounded-xl transition-all duration-300 hover:shadow-lg"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="p-3 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all duration-300 hover:shadow-lg"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <Pagination 
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={fetchStudents}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-0 overflow-hidden transform transition-all animate-in zoom-in-95 duration-500 relative">
            <div className="bg-gray-50/50 py-10 px-8 border-b border-gray-100 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="flex justify-between items-center relative">
                <div>
                  <h3 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
                    {modalMode === 'add' ? 'Student Enrollment' : 'Edit Records'}
                  </h3>
                  <p className="text-gray-400 font-medium mt-1">
                    {modalMode === 'add' ? 'Link student to an academic batch' : 'Update institutional details'}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-gray-400 hover:text-red-500 transition-all shadow-sm active:scale-90"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Full Identity Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all font-bold text-lg"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Institutional Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all font-bold text-lg"
                    placeholder="student@sece.ac.in"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Registration Roll No</label>
                  <input
                    type="text"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all font-black text-lg tracking-widest"
                    placeholder="E.g. 24IT029"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Admission Year</label>
                  <input
                    type="number"
                    name="admissionYear"
                    value={formData.admissionYear}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all font-bold text-lg"
                    placeholder="e.g. 2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Current Year</label>
                  <Dropdown
                    value={formData.currentYear}
                    onChange={(val) => setFormData({...formData, currentYear: val})}
                    options={[
                      { label: "1st Year", value: "1" },
                      { label: "2nd Year", value: "2" },
                      { label: "3rd Year", value: "3" },
                      { label: "4th Year", value: "4" }
                    ]}
                    placeholder="Select Year"
                    className="w-full"
                    buttonClassName="!rounded-xl !py-4 !bg-gray-50/50 !border-gray-200 !font-bold !text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 text-[#FFD700]">Official Class Assignment</label>
                  <Dropdown
                    value={formData.classId}
                    onChange={(val) => {
                      setFormData({...formData, classId: val, section: ''});
                    }}
                    options={classes.map(cls => ({
                      label: `${cls.className}`,
                      value: cls._id
                    }))}
                    placeholder="Choose a Class"
                    className="w-full"
                    buttonClassName="!rounded-xl !py-4 !bg-gray-50/50 !border-gray-200 !font-black !text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 text-[#FFD700]">Section Assignment</label>
                  <Dropdown
                    value={formData.section}
                    onChange={(val) => setFormData({...formData, section: val})}
                    options={
                      formData.classId && classes.find(c => c._id === formData.classId)?.sections
                        ? classes.find(c => c._id === formData.classId).sections.map(s => ({ label: `Section ${s.name}`, value: s.name }))
                        : []
                    }
                    placeholder={formData.classId ? "Select Section" : "Choose Class First"}
                    className="w-full"
                    disabled={!formData.classId}
                    buttonClassName="!rounded-xl !py-4 !bg-gray-50/50 !border-gray-200 !font-black !text-lg"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-5 bg-[#FFD700] text-[#1A1A1A] rounded-xl transition-all duration-300 font-black text-xl shadow-xl shadow-yellow-500/20 active:scale-[0.98] ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#FFED4E]'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : (modalMode === 'add' ? 'Confirm Enrollment' : 'Update Record')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
