import { useState } from 'react';
import { Lock, ShieldCheck, ShieldAlert, Loader2, Save, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ChangePasswordForm = () => {
  const { updateUserInfo } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('New passwords do not match');
    }

    if (formData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put('/api/auth/change-password', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Password updated successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Update local auth state to remove warning banner
      updateUserInfo({ mustChangePassword: false });
      
    } catch (error) {
      console.error('Password update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all duration-300 font-bold text-sm text-[#1A1A1A] placeholder:text-gray-300 placeholder:italic";

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 relative overflow-hidden group h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110 pointer-events-none"></div>
      
      <h3 className="text-2xl font-black text-[#1A1A1A] mb-8 uppercase tracking-widest italic flex items-center relative z-10">
        <ShieldCheck size={28} className="mr-3 text-[#FFD700]" />
        Security Settings
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Current Password</label>
          <div className="relative group/field">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-[#FFD700] transition-colors">
              <Lock size={20} />
            </div>
            <input
              type={showPasswords.current ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              className={inputClasses}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
            >
              {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">New Password</label>
            <div className="relative group/field">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-[#FFD700] transition-colors">
                <ShieldCheck size={20} />
              </div>
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className={inputClasses}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Confirm New Password</label>
            <div className="relative group/field">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-[#FFD700] transition-colors">
                <ShieldAlert size={20} />
              </div>
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat new password"
                className={inputClasses}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1A1A1A] hover:bg-[#FFD700] text-white hover:text-[#1A1A1A] py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 shadow-xl shadow-gray-200 hover:shadow-yellow-500/20 active:scale-[0.98] disabled:opacity-50"
        >
          <div className="flex items-center justify-center space-x-3 px-4">
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Save size={18} className="shrink-0" />
                <span>Update Security Credentials</span>
              </>
            )}
          </div>
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
