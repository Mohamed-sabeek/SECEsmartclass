import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, X, AlertCircle, Users, Filter, Upload } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import defaultAvatar from '../assets/default-avatar.jpg';
import useDebounce from '../hooks/useDebounce';
import Pagination from './common/Pagination';
import Dropdown from './ui/Dropdown';
import { getOptimizedAvatar } from '../utils/imageUtils';

const AdminTeachers = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [filters, setFilters] = useState({ departmentId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    subjects: [] // Now an array
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchTeachers(1);
  }, [debouncedSearch, filters]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchTeachers = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          role: 'teacher',
          page,
          search: debouncedSearch,
          departmentId: filters.departmentId
        }
      });
      
      const { data, totalPages, totalCount } = response.data;
      setTeachers(data || []);
      setPagination({ page, totalPages, totalCount });
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleAdd = () => {
    setModalMode('add');
    setSelectedItem(null);
    setFormData({ name: '', email: '', department: '', subjects: [] });
    setTagInput('');
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    setFormData({
      name: item.name,
      email: item.email,
      department: item.department,
      subjects: item.teacherDetails?.subjects || []
    });
    setTagInput('');
    setShowModal(true);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !formData.subjects.includes(val)) {
        setFormData({
          ...formData,
          subjects: [...formData.subjects, val]
        });
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && formData.subjects.length > 0) {
      const newTags = [...formData.subjects];
      newTags.pop();
      setFormData({ ...formData, subjects: newTags });
    }
  };

  const removeTag = (indexToRemove) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, index) => index !== indexToRemove)
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Teacher record removed successfully');
        fetchTeachers(pagination.page);
      } catch (error) {
        console.error('Error deleting teacher:', error);
        toast.error('Failed to delete teacher');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (formData.subjects.length === 0) {
      toast.error('At least one subject is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const payload = {
        ...formData,
        role: 'teacher'
      };

      if (modalMode === 'add') {
        const response = await axios.post('/api/users', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`Teacher account created!`);
      } else {
        await axios.put(`/api/users/${selectedItem._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Teacher record updated successfully!');
      }
      setShowModal(false);
      fetchTeachers(pagination.page);
    } catch (error) {
      console.error('Error saving teacher:', error);
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
            Teachers <span className="text-[#FFD700]">Directory</span>
          </h2>
          <p className="text-gray-500 mt-1 text-sm font-medium italic">Manage academic staff and department assignments</p>
        </div>
        <button
          onClick={handleAdd}
          className="group relative flex items-center bg-[#1A1A1A] hover:bg-[#FFD700] text-white hover:text-[#1A1A1A] px-6 py-3 rounded-xl transition-all duration-300 shadow-xl hover:shadow-yellow-500/20 font-bold overflow-hidden text-sm"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <Plus size={20} className="mr-2" />
          Add Faculty
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-xl border border-gray-100 overflow-hidden mb-10">
        <div className="p-8 border-b border-gray-50 bg-gray-50/20">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#FFD700] transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search faculty members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#FFD700]/10 focus:border-[#FFD700] transition-all text-base shadow-sm font-bold"
              />
            </div>
            
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
          </div>
        </div>

        {!loading && filteredTeachers.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="text-gray-300" size={48} />
            </div>
            <p className="text-gray-800 text-2xl font-bold">No Faculty Found</p>
            <p className="text-gray-500 mt-2 text-lg">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/30">
                  <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Identity</th>
                  <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Department</th>
                  <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Subjects</th>
                  <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Assigned Classes</th>
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
                        <div className="h-4 w-20 bg-gray-200 rounded-lg"></div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="h-6 w-32 bg-gray-200 rounded-xl"></div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="h-4 w-24 bg-gray-200 rounded-lg"></div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="h-8 w-20 bg-gray-200 rounded-lg mx-auto"></div>
                      </td>
                    </tr>
                  ))
                :
                  filteredTeachers.map((teacher) => (
                  <tr key={teacher._id} className="group hover:bg-yellow-50/30 transition-all duration-300">
                    <td className="px-10 py-5">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-[#FFD700] font-black text-sm mr-4 shadow-lg group-hover:rotate-6 transition-transform overflow-hidden">
                          <img 
                            src={getOptimizedAvatar(teacher.avatar)} 
                            alt={teacher.name} 
                            onError={(e) => {
                              e.currentTarget.src = defaultAvatar;
                            }}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-[#1A1A1A]">{teacher.name}</span>
                          <span className="text-gray-400 text-xs font-medium">{teacher.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <span className="px-3 py-1 bg-white border border-gray-100 text-gray-800 rounded-lg font-black text-[10px] shadow-sm group-hover:border-[#FFD700] transition-colors uppercase">
                        {teacher.department}
                      </span>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex flex-wrap gap-1 items-center">
                        {teacher.teacherDetails?.subjects?.length > 0 ? (
                          teacher.teacherDetails.subjects.map((sub, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md text-[10px] font-black uppercase border border-gray-100 italic">
                              {sub}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-300 italic text-xs">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                        {teacher.assignedClasses?.length > 0 ? (
                          <>
                            {teacher.assignedClasses.slice(0, 2).map((cls) => (
                              <span 
                                key={cls._id} 
                                className="px-2 py-0.5 bg-yellow-50 border border-yellow-200 text-[#1A1A1A] rounded-lg font-bold text-[10px] whitespace-nowrap"
                                title={`Year ${cls.year} — ${cls.className} (${cls.section})`}
                              >
                                {cls.className} ({cls.section})
                              </span>
                            ))}
                            {teacher.assignedClasses.length > 2 && (
                              <span 
                                className="px-2 py-0.5 bg-[#1A1A1A] text-[#FFD700] rounded-lg font-black text-[9px] cursor-help"
                                title={teacher.assignedClasses.slice(2).map(c => `${c.className} (${c.section})`).join(', ')}
                              >
                                +{teacher.assignedClasses.length - 2} more
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 italic text-[10px] font-medium tracking-tight">Not Assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="p-2.5 text-gray-400 hover:text-[#FFD700] hover:bg-white rounded-xl transition-all duration-300 hover:shadow-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher._id)}
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
          onPageChange={fetchTeachers}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-10 transform transition-all animate-in zoom-in-95 duration-500 relative transition-all">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
                  {modalMode === 'add' ? 'Register' : 'Edit'} Faculty
                </h3>
                <p className="text-gray-400 font-medium">Provide the professional details below</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setTagInput('');
                }}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 transition-all shadow-sm active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all font-bold text-lg shadow-sm"
                    placeholder="Dr. Rajesh Kumar"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all font-bold text-lg shadow-sm"
                    placeholder="rajesh@sece.ac.in"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Department</label>
                  <Dropdown
                    value={formData.department}
                    onChange={(val) => setFormData({...formData, department: val})}
                    options={departments.map(dept => ({ label: dept.name, value: dept.code }))}
                    placeholder="Select Dept"
                    className="w-full"
                    buttonClassName="!rounded-xl !py-4 !bg-gray-50 !border-gray-100 !font-black !text-lg !shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Subjects</label>
                  <div className="min-h-[120px] p-4 bg-gray-50 border border-gray-100 rounded-xl focus-within:ring-2 focus-within:ring-[#FFD700] transition-all">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.subjects.map((sub, index) => (
                        <span 
                          key={index} 
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFD700] text-[#1A1A1A] rounded-lg font-black text-xs shadow-sm animate-in zoom-in-75 duration-200"
                        >
                          {sub}
                          <button 
                            type="button" 
                            onClick={() => removeTag(index)}
                            className="hover:bg-[#1A1A1A] hover:text-white rounded-full p-0.5 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      className="w-full bg-transparent outline-none font-bold text-base placeholder:text-gray-300"
                      placeholder={formData.subjects.length === 0 ? "Type & press Enter..." : "Add more..."}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 font-bold italic ml-1 flex items-center gap-1">
                    <AlertCircle size={10} />
                    Press <span className="text-[#1A1A1A]">Enter</span> or <span className="text-[#1A1A1A]">Comma</span> to add tags
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-10">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setTagInput('');
                  }}
                  className="flex-1 px-8 py-5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all font-bold text-lg active:scale-95"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-[2] px-8 py-5 bg-[#FFD700] hover:bg-[#FFED4E] text-[#1A1A1A] rounded-xl transition-all duration-300 font-black text-lg shadow-xl active:scale-95"
                >
                  {modalMode === 'add' ? 'Confirm Details' : 'Update Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeachers;
