import { useState, useEffect } from 'react';
import { Plus, Search, X, AlertCircle, LayoutGrid, Building2, Edit2, Trash2, Filter } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useDebounce from '../hooks/useDebounce';
import Dropdown from './ui/Dropdown';

const AdminClasses = () => {
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ departmentId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const [formData, setFormData] = useState({
    className: '',
    departmentId: '',
    year: '',
    section: ''
  });

  useEffect(() => {
    fetchClasses();
  }, [debouncedSearch, filters.departmentId]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/classes', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          departmentId: filters.departmentId,
          search: debouncedSearch
        }
      });
      setClasses(response.data.data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      toast.error('Failed to load classes');
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
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const handleAdd = () => {
    setModalMode('add');
    setSelectedId(null);
    setFormData({
      className: '',
      departmentId: '',
      year: '',
      section: ''
    });
    setShowModal(true);
  };

  const handleEdit = (cls) => {
    setModalMode('edit');
    setSelectedId(cls._id);
    setFormData({
      className: cls.className,
      departmentId: cls.departmentId?._id || '',
      year: cls.year,
      section: cls.section
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class? This will affect students assigned to this class!')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/classes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Class deleted successfully!');
        fetchClasses();
      } catch (err) {
        console.error('Error deleting class:', err);
        toast.error(err.response?.data?.message || 'Failed to delete class');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!formData.className || !formData.departmentId || !formData.year || !formData.section) {
        toast.error('All fields are required');
        return;
      }

      if (modalMode === 'add') {
        await axios.post('/api/classes', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Class created successfully!');
      } else {
        await axios.put(`/api/classes/${selectedId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Class updated successfully!');
      }

      setFormData({ className: '', departmentId: '', year: '', section: '' });
      setShowModal(false);
      fetchClasses();
    } catch (err) {
      console.error('Error processing class:', err);
      toast.error(err.response?.data?.message || 'Verification failed');
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

  const filteredClasses = classes.filter(cls => 
    cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cls.departmentId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
            Class <span className="text-[#FFD700]">Management</span>
          </h2>
          <p className="text-gray-500 mt-1 text-sm font-medium italic">Create academic batches and assign departments</p>
        </div>
        <button
          onClick={handleAdd}
          className="group relative flex items-center bg-[#1A1A1A] hover:bg-[#FFD700] text-white hover:text-[#1A1A1A] px-6 py-3 rounded-xl transition-all duration-300 shadow-xl hover:shadow-yellow-500/20 font-bold overflow-hidden text-sm"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <Plus size={20} className="mr-2" />
          Create New Class
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-[1.5rem] shadow-xl overflow-hidden mb-10">
        <div className="p-8 border-b border-gray-50 bg-gray-50/20">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#FFD700] transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search classes..."
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
                ...departments.map(dept => ({ label: dept.name, value: dept._id }))
              ]}
              placeholder="All Departments"
              className="min-w-[200px]"
            />
          </div>
        </div>

        {!loading && filteredClasses.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutGrid className="text-gray-300" size={48} />
            </div>
            <p className="text-gray-800 text-2xl font-bold">No Classes Found</p>
            <p className="text-gray-500 mt-2 text-lg">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/30">
                  <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Class Identity</th>
                  <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Department</th>
                  <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Level / Year</th>
                  <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Section</th>
                  <th className="px-10 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ?
                  [1, 2, 3, 4].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-10 py-5">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-xl bg-gray-105 mr-4"></div>
                          <div className="h-4 w-32 bg-gray-250 rounded-lg"></div>
                        </div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="h-4 w-40 bg-gray-200 rounded-lg"></div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="h-4 w-20 bg-gray-200 rounded-lg"></div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="h-4 w-12 bg-gray-200 rounded-lg"></div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="h-8 w-20 bg-gray-200 rounded-lg mx-auto"></div>
                      </td>
                    </tr>
                  ))
                :
                  filteredClasses.map((cls) => (
                  <tr key={cls._id} className="group hover:bg-yellow-50/30 transition-all duration-300 cursor-default">
                    <td className="px-10 py-5">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-[#FFD700] font-black text-sm mr-4 shadow-lg shadow-gray-200 group-hover:rotate-6 transition-transform">
                          {cls.className.charAt(0)}
                        </div>
                        <span className="text-base font-extrabold text-[#1A1A1A] tracking-tight">{cls.className}</span>
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex items-center">
                        <Building2 size={16} className="text-gray-400 mr-2" />
                        <span className="text-gray-700 font-bold text-sm">{cls.departmentId?.name || 'Unassigned'}</span>
                        {cls.departmentId?.code && (
                          <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-black rounded uppercase">
                            {cls.departmentId.code}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-5 text-base font-bold text-gray-600">
                      Year <span className="text-[#1A1A1A]">{cls.year}</span>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex flex-col group-hover:translate-x-1 transition-transform">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Unit Section</span>
                        <div className="flex items-center">
                          <span className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[#1A1A1A] font-black text-xs shadow-sm group-hover:border-[#FFD700] group-hover:bg-white transition-all">
                            {cls.section}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(cls)}
                          className="p-2.5 text-gray-400 hover:text-[#FFD700] hover:bg-white rounded-xl transition-all duration-300 hover:shadow-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cls._id)}
                          className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all duration-300 hover:shadow-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full p-12 transform transition-all animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFD700]/10 rounded-full -mr-12 -mt-12 blur-3xl"></div>
            
            <div className="flex justify-between items-center mb-10 relative">
              <div>
                <h3 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
                  {modalMode === 'add' ? 'Register Class' : 'Modify Class'}
                </h3>
                <p className="text-gray-400 font-medium mt-1">Configure academic batch details</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300 active:scale-95"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Class Display Name</label>
                <input
                  type="text"
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:bg-white transition-all text-gray-800 font-bold text-lg"
                  placeholder="e.g. 2nd IT-A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Allocated Department</label>
                <Dropdown
                  value={formData.departmentId}
                  onChange={(val) => setFormData({...formData, departmentId: val})}
                  options={departments.map(dept => ({ label: `${dept.name} (${dept.code})`, value: dept._id }))}
                  placeholder="Select Department"
                  className="w-full"
                  buttonClassName="!rounded-2xl !py-4 !bg-gray-50 !border-none !text-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Academic Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:bg-white transition-all text-gray-800 font-bold text-lg"
                    placeholder="e.g. 2"
                    min="1"
                    max="5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Section</label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:bg-white transition-all text-gray-800 font-bold text-lg"
                    placeholder="e.g. A"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-8 py-5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all font-bold text-lg active:scale-95"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-[2] px-8 py-5 bg-[#FFD700] text-[#1A1A1A] rounded-xl transition-all duration-300 font-black text-lg shadow-xl active:scale-95 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#FFED4E] hover:shadow-yellow-500/20'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : (modalMode === 'add' ? 'Commit Entry' : 'Update Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClasses;
