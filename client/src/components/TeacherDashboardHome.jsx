import { BookOpen, Video, Users, ArrowRight, TrendingUp, Zap, LayoutDashboard } from 'lucide-react';

const TeacherDashboardHome = ({ teacher, setActiveTab }) => {
  const stats = [
    { label: 'Assigned Classes', value: teacher?.assignedClasses?.length || 0, icon: BookOpen, color: 'blue' },
    { label: 'Total Sessions', value: teacher?.totalSessions || 0, icon: Video, color: 'emerald' },
    { label: 'Total Attendance', value: 0, icon: Users, color: 'purple' }
  ];

  return (
    <div className="animate-in fade-in duration-700">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-[#1A1A1A] rounded-[2.5rem] p-12 mb-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700] rounded-full filter blur-[120px] opacity-10 -mr-20 -mt-20 scale-125"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full filter blur-[100px] opacity-10 -ml-20 -mb-20"></div>
        
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="max-w-xl">
             <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] mb-6 animate-bounce transition-all">
                <Zap size={16} className="mr-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">Portal Active</span>
             </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              Hello, <span className="text-[#FFD700] italic">Prof. {teacher?.name?.split(' ')[0]}</span>
            </h2>
            <p className="text-gray-400 text-lg font-medium leading-relaxed mb-8">
              Welcome back to your academic command center. Ready to drive excellence in your classes today?
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => setActiveTab('live')}
                className="flex items-center bg-[#FFD700] hover:bg-[#FFED4E] text-[#1A1A1A] px-8 py-4 rounded-2xl font-black transition-all duration-300 shadow-xl shadow-yellow-500/10 active:scale-95 text-sm uppercase"
              >
                <Video size={20} className="mr-2" />
                Start Class Now
              </button>
              <button 
                onClick={() => setActiveTab('classes')}
                className="flex items-center bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-2xl font-black transition-all duration-300 backdrop-blur-md active:scale-95 text-sm uppercase"
              >
                View My Batches
              </button>
            </div>
          </div>
          <div className="hidden lg:block relative group">
            <div className="absolute inset-0 bg-[#FFD700] rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
            <div className="relative p-8 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl transition-transform duration-700 hover:rotate-2">
               <TrendingUp className="text-[#FFD700]" size={100} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="group relative bg-white p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
             <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700`}></div>
             <div className="flex items-center justify-between mb-8">
                <div className={`w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-[#1A1A1A] transition-colors duration-500`}>
                   <stat.icon size={26} className="text-[#FFD700]" />
                </div>
                <div className="text-right">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none block">System Metric</span>
                </div>
             </div>
             <h3 className="text-4xl font-black text-[#1A1A1A] mb-1 tracking-tighter italic">{stat.value}</h3>
             <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Insights Placeholder */}
      <div className="mt-12 p-10 bg-white rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
             <LayoutDashboard className="text-gray-300" size={32} />
          </div>
          <div className="text-center">
             <p className="text-gray-800 font-black text-lg">Next Step Recommendation</p>
             <p className="text-gray-500 text-sm max-w-sm">Check "Reports" for past performance or "Live Session" to begin a new class.</p>
          </div>
      </div>
    </div>
  );
};

export default TeacherDashboardHome;
