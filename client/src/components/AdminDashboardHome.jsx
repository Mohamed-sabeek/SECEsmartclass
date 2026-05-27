import { Building2, Users, GraduationCap, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardCardSkeleton from './skeletons/DashboardCardSkeleton';

const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    departments: 0,
    teachers: 0,
    students: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch counts from backend
      const [deptRes, teacherRes, studentRes] = await Promise.all([
        axios.get('/api/departments/count', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/users/count?role=teacher', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/users/count?role=student', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats({
        departments: deptRes.data.count || 0,
        teachers: teacherRes.data.count || 0,
        students: studentRes.data.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardCardSkeleton />;
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-[#1A1A1A] rounded-[2.5rem] p-10 mb-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700] rounded-full filter blur-[100px] opacity-10 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full filter blur-[80px] opacity-10 -ml-20 -mb-20"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight leading-tight">
              Command <span className="text-[#FFD700]">Center</span>
            </h2>
            <p className="text-gray-400 text-xl font-medium leading-relaxed">
              Managing the future of education at SECE. Here's a real-time overview of your institutional ecosystem.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              <TrendingUp className="text-[#FFD700]" size={64} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="group relative bg-white p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Building2 className="text-blue-600" size={32} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Units</span>
            </div>
          </div>
          <h3 className="text-3xl font-black text-gray-800 mb-1">{stats.departments}</h3>
          <p className="text-gray-500 font-bold text-base">Departments</p>
        </div>

        <div className="group relative bg-white p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-8">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Users className="text-emerald-600" size={32} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Faculty Members</span>
            </div>
          </div>
          <h3 className="text-3xl font-black text-gray-800 mb-1">{stats.teachers}</h3>
          <p className="text-gray-500 font-bold text-base">Teachers</p>
        </div>

        <div className="group relative bg-white p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-8">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <GraduationCap className="text-purple-600" size={32} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrolled Students</span>
            </div>
          </div>
          <h3 className="text-3xl font-black text-gray-800 mb-1">{stats.students}</h3>
          <p className="text-gray-500 font-bold text-base">Students</p>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardHome;
