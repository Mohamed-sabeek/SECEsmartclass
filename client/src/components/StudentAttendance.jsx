import { useState, useEffect } from 'react';
import { ClipboardCheck, Users, CheckCircle, XCircle, Loader2, Info, GraduationCap } from 'lucide-react';
import axios from 'axios';

const StudentAttendance = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/student/attendance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentageColor = (pct) => {
    if (pct >= 75) return 'text-green-500 bg-green-50 border-green-100';
    if (pct >= 50) return 'text-yellow-500 bg-yellow-50 border-yellow-100';
    return 'text-red-500 bg-red-50 border-red-100';
  };

  const getPercentageBarColor = (pct) => {
    if (pct >= 75) return 'bg-green-500';
    if (pct >= 50) return 'bg-[#FFD700]';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
        <Loader2 className="animate-spin text-[#FFD700]" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter">
          Academic <span className="text-[#FFD700]">Metric</span>
        </h2>
        <p className="text-gray-500 mt-2 font-medium italic">Your personalized synchronization index and participation analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
         <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center group hover:border-[#FFD700] transition-all duration-500">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Info className="text-blue-500" size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Classes</p>
            <h4 className="text-3xl font-black text-[#1A1A1A] italic">{stats?.totalClasses}</h4>
         </div>

         <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center group hover:border-green-500 transition-all duration-500">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <CheckCircle className="text-green-500" size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Present Log</p>
            <h4 className="text-3xl font-black text-[#1A1A1A] italic">{stats?.presentCount}</h4>
         </div>

         <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center group hover:border-red-500 transition-all duration-500">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <XCircle className="text-red-500" size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Absent Log</p>
            <h4 className="text-3xl font-black text-[#1A1A1A] italic">{stats?.absentCount}</h4>
         </div>

         <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center group hover:border-[#FFD700] transition-all duration-500">
            <div className="w-12 h-12 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <ClipboardCheck className="text-[#FFD700]" size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Efficiency Ratio</p>
            <h4 className="text-3xl font-black text-[#1A1A1A] italic">{stats?.percentage}%</h4>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl border border-gray-100 relative overflow-hidden group">
         <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex-1">
               <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-4 uppercase">Overall Participation Index</h3>
               <div className="w-full h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-1 mb-4">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${getPercentageBarColor(stats?.percentage)}`}
                    style={{ width: `${stats?.percentage}%` }}
                  ></div>
               </div>
               <p className="text-gray-500 text-sm font-medium italic">
                 {stats?.percentage >= 75 
                   ? "Outstanding engagement! You are maintaining an elite synchronization level. Keep up the consistent broadcast presence."
                   : stats?.percentage >= 50
                   ? "Stable participation. You are currently within the acceptable operational range, but there is clear room for optimization."
                   : "Critical signal loss. Your participation metrics are significantly below the required threshold. Urgent corrective action is advised."}
               </p>
            </div>
            <div className={`w-40 h-40 rounded-full border-8 border-gray-50 flex flex-col items-center justify-center shadow-inner ${getPercentageColor(stats?.percentage)}`}>
               <span className="text-4xl font-black italic">{stats?.percentage}%</span>
               <span className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">Sync Rate</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
