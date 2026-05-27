import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Mail, Hash, BookOpen, Calendar, User as UserIcon, GraduationCap, Building2, Camera, Edit2, Save, X, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import defaultAvatar from "../../assets/default-avatar.webp";
import ChangePasswordForm from "../../components/ChangePasswordForm";
import { useAuth } from "../../context/AuthContext";
import { getOptimizedAvatar } from "../../utils/imageUtils";
import ProfileSkeleton from "../../components/skeletons/ProfileSkeleton";

const getYearLabel = (year) => {
  if (year === 1) return "1st Year";
  if (year === 2) return "2nd Year";
  if (year === 3) return "3rd Year";
  if (year === 4) return "4th Year";
  return "N/A";
};

const StudentProfile = () => {
  const { profileData, fetchProfile, updateUserInfo } = useAuth();
  const [user, setUser] = useState(profileData);
  const [loading, setLoading] = useState(!profileData);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        if (active) {
          setUser(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
        toast.error("Failed to load profile");
        if (active) {
          setLoading(false);
        }
      }
    };
    
    loadProfile();
    
    return () => {
      active = false;
    };
  }, [fetchProfile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }

      const res = await axios.put("/api/users/profile/avatar", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success("Profile updated successfully");
      setEditMode(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Update local state and sync with AuthContext
      updateUserInfo({ avatar: res.data.avatar });
      setUser(prev => ({ ...prev, avatar: res.data.avatar }));
    } catch (error) {
      console.error("Update failed", error);
      console.error("Error Detail:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) return <p className="p-4 text-center mt-10 text-gray-500 font-bold">Failed to load profile data.</p>;

  return (
    <div className="animate-in fade-in duration-700 max-w-6xl mx-auto">
      {/* Banner Section */}
      <div className="bg-[#1A1A1A] rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden mb-10 border border-white/5">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none hidden md:block">
           <UserIcon size={150} className="text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-10">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="w-48 h-48 rounded-[2.5rem] bg-gradient-to-br from-[#FFD700] to-[#FFB700] p-1 shadow-2xl shadow-yellow-500/20 transform rotate-2 hover:rotate-0 transition-all duration-500 overflow-hidden">
              <div className="w-full h-full bg-white rounded-[2.3rem] flex items-center justify-center overflow-hidden relative">
                <img 
                  src={previewUrl || getOptimizedAvatar(user.avatar)} 
                  alt="Profile" 
                  onError={(e) => {
                    e.currentTarget.src = defaultAvatar;
                  }}
                  className="w-full h-full object-cover"
                />

                {editMode && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                  >
                    <Camera className="text-[#FFD700] mb-2" size={32} />
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Change Photo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pencil Button */}
            {!editMode && (
              <button 
                onClick={() => setEditMode(true)}
                className="absolute -top-3 -right-3 w-10 h-10 bg-[#FFD700] text-[#1A1A1A] rounded-xl flex items-center justify-center shadow-lg hover:bg-[#FFED4E] transition-all hover:scale-110 z-20 border-4 border-[#1A1A1A]"
                title="Edit Photo"
              >
                <Edit2 size={16} />
              </button>
            )}

            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          
          <div className="text-center md:text-left flex-1 pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <span className="inline-flex items-center px-4 py-1.5 bg-[#FFD700] text-[#1A1A1A] text-[10px] font-black uppercase tracking-widest rounded-full mb-4 italic">
                  <GraduationCap size={14} className="mr-2" />
                  Student Identity
                </span>
                <h2 className="text-5xl font-black text-white italic tracking-tighter leading-none">
                  {user.name}
                </h2>
              </div>
              
              <div className="flex items-center justify-center gap-3">
                {editMode && (
                  <>
                    <button 
                      onClick={handleCancel}
                      className="flex items-center bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-3 rounded-2xl transition-all duration-300 font-bold text-sm border border-red-500/20"
                    >
                      <X size={18} className="mr-2" />
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center bg-[#FFD700] hover:bg-[#FFED4E] text-[#1A1A1A] px-8 py-3 rounded-2xl transition-all duration-300 font-black text-sm shadow-xl shadow-yellow-500/10 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 size={18} className="mr-2 animate-spin" />
                      ) : (
                        <Save size={18} className="mr-2" />
                      )}
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-400 font-medium italic">
              <Mail size={18} className="text-[#FFD700]" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-gray-100 relative overflow-hidden group mb-12">
        <h3 className="text-2xl font-black text-[#1A1A1A] mb-8 uppercase tracking-widest italic flex items-center">
          <GraduationCap size={28} className="mr-3 text-[#FFD700]" />
          Academic Record
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 hover:border-[#FFD700] transition-all duration-500 group/card">
            <div className="flex items-start flex-col space-y-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover/card:scale-110 transition-transform">
                <Hash size={24} className="text-gray-400 group-hover/card:text-[#FFD700] transition-colors" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Roll Number</p>
                <p className="text-2xl font-black text-[#1A1A1A] italic">
                  {user.studentDetails?.rollNumber || user.studentDetails?.rollNo || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 hover:border-[#FFD700] transition-all duration-500 group/card">
            <div className="flex items-start flex-col space-y-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover/card:scale-110 transition-transform">
                <BookOpen size={24} className="text-gray-400 group-hover/card:text-[#FFD700] transition-colors" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Class Enrolled</p>
                <p className="text-2xl font-black text-[#1A1A1A] italic">
                  {user.classId?.className || user.studentDetails?.class || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 hover:border-[#FFD700] transition-all duration-500 group/card">
            <div className="flex items-start flex-col space-y-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover/card:scale-110 transition-transform">
                <Calendar size={24} className="text-gray-400 group-hover/card:text-[#FFD700] transition-colors" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Batch & Level</p>
                <p className="text-2xl font-black text-[#1A1A1A] italic">
                  {user.studentDetails?.admissionYear ? (
                    <>
                      {user.studentDetails.admissionYear} - {user.studentDetails.admissionYear + 4}
                      <span className="text-sm text-gray-400 ml-2 font-bold">
                        ({getYearLabel(user.studentDetails.currentYear)})
                      </span>
                    </>
                  ) : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 hover:border-[#FFD700] transition-all duration-500 group/card">
            <div className="flex items-start flex-col space-y-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover/card:scale-110 transition-transform">
                <Building2 size={24} className="text-gray-400 group-hover/card:text-[#FFD700] transition-colors" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Department</p>
                <p className="text-2xl font-black text-[#1A1A1A] italic">
                  {user.classId?.departmentId?.name || user.department || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <ChangePasswordForm />
      </div>
    </div>
  );
};

export default StudentProfile;
