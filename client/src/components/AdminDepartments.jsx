import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, AlertCircle, Building2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDepartments = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    hod: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data.departments || []);
      setError('');
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setModalMode('add');
    setSelectedItem(null);
    setFormData({ name: '', code: '', hod: '' });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      hod: item.hod
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/departments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Department deleted successfully');
        fetchDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
        toast.error(error.response?.data?.message || 'Failed to delete department');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (modalMode === 'add') {
        await axios.post('/api/departments', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Department created successfully!');
      } else {
        await axios.put(`/api/departments/${selectedItem._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Department updated successfully!');
      }
      setShowModal(false);
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error(error.response?.data?.message || 'Failed to save department');
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

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
            Institutional <span className="text-[#FFD700]">Departments</span>
          </h2>
          <p className="text-gray-500 mt-1 text-sm font-medium italic">Configure and manage academic administrative units</p>
        </div>
        <button
          onClick={handleAdd}
          className="group relative flex items-center bg-[#1A1A1A] hover:bg-[#FFD700] text-white hover:text-[#1A1A1A] px-6 py-3 rounded-xl transition-all duration-300 shadow-xl hover:shadow-yellow-500/20 font-bold overflow-hidden text-sm"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <Plus size={20} className="mr-2" />
          Add Department
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center shadow-sm">
          <AlertCircle className="text-red-500 mr-3" size={24} />
          <p className="text-red-800 font-bold">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-[1.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/10">
          <div className="relative group max-w-lg">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#FFD700] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-6 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700]/10 focus:border-[#FFD700] transition-all text-base shadow-sm font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="text-gray-300" size={48} />
            </div>
            <p className="text-gray-800 text-2xl font-bold">No Departments Found</p>
            <p className="text-gray-500 mt-2 text-lg">Try adjusting your search or add a new unit</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/30">
                  <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Department Unit</th>
                  <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Identifier</th>
                  <th className="px-10 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Head Admin</th>
                  <th className="px-10 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDepartments.map((dept) => (
                  <tr key={dept._id} className="group hover:bg-yellow-50/30 transition-all duration-300">
                    <td className="px-10 py-5">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-[#FFD700] font-black text-sm mr-4 shadow-lg group-hover:rotate-6 transition-transform">
                          {dept.name.charAt(0)}
                        </div>
                        <span className="text-base font-bold text-[#1A1A1A]">{dept.name}</span>
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <span className="px-3 py-1 bg-white border border-gray-100 text-gray-800 rounded-lg font-black text-[10px] shadow-sm group-hover:border-[#FFD700] transition-colors">
                        {dept.code}
                      </span>
                    </td>
                    <td className="px-10 py-5 text-gray-600 font-bold text-sm">{dept.hod}</td>
                    <td className="px-10 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(dept)}
                          className="p-2.5 text-gray-400 hover:text-[#FFD700] hover:bg-white rounded-xl transition-all duration-300 hover:shadow-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(dept._id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-10 transform transition-all animate-in zoom-in-95 duration-500 relative">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
                  {modalMode === 'add' ? 'Setup Unit' : 'Modify Unit'}
                </h3>
                <p className="text-gray-400 font-medium">Configure institutional department parameters</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 transition-all shadow-sm active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Official Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all font-bold text-lg"
                  placeholder="e.g. Mechanical Engineering"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Unit Code</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all font-black"
                    placeholder="CSE"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Head of Dept</label>
                  <input
                    type="text"
                    name="hod"
                    value={formData.hod}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all font-bold"
                    placeholder="Dr. Rajesh"
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-[2] px-8 py-5 bg-[#FFD700] text-[#1A1A1A] rounded-xl transition-all duration-300 font-black text-lg shadow-xl active:scale-95 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#FFED4E]'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : (modalMode === 'add' ? 'Create Unit' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepartments;
