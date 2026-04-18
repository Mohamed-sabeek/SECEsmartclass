import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  GraduationCap, 
  ChevronRight, 
  LayoutGrid, 
  Play, 
  Clock, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TeacherClasses = ({ assignedClasses }) => {
  const navigate = useNavigate();
  const [activeSession, setActiveSession] = useState(null);
  const [loadingActive, setLoadingActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null); // stores classId being processed

  useEffect(() => {
    fetchActiveSession();
  }, []);

  const fetchActiveSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/sessions/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveSession(response.data.data);
    } catch (error) {
      console.error('Error fetching active session:', error);
    } finally {
      setLoadingActive(false);
    }
  };

  const handleStartClass = async (classId) => {
    if (activeSession) {
      toast.error('You already have another class live!');
      return;
    }

    try {
      setIsProcessing(classId);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/sessions', 
        { classId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setActiveSession(response.data.data);
      toast.success('Class Started Successfully!');
    } catch (error) {
      console.error('Error starting class:', error);
      toast.error(error.response?.data?.message || 'Failed to start class');
    } finally {
      setIsProcessing(null);
    }
  };

  if (!assignedClasses || assignedClasses.length === 0) {
    return (
      <div className="animate-in fade-in duration-700 h-96 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-gray-200 shadow-sm">
        <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6 ring-8 ring-gray-50/50">
          <BookOpen className="text-gray-300" size={40} />
        </div>
        <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 tracking-tight">No Batches Assigned</h3>
        <p className="text-gray-500 max-w-sm text-center font-medium">Please contact the administrator to get your academic classes assigned to your portal.</p>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom duration-700">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter">
            My <span className="text-[#FFD700]">Academic Benches</span>
          </h2>
          <p className="text-gray-500 mt-2 font-medium italic">Overview of all batches currently assigned under your faculty profile</p>
        </div>
        
        {activeSession && (
          <div className="flex items-center space-x-3 bg-[#1A1A1A] px-6 py-3 rounded-2xl shadow-lg border border-[#FFD700]/20 animate-pulse">
             <div className="w-2 h-2 rounded-full bg-red-500"></div>
             <span className="text-white text-[10px] font-black uppercase tracking-widest italic">Live Session Active</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {assignedClasses.map((cls) => {
          const isLive = activeSession?.classId?._id === cls._id || activeSession?.classId === cls._id;
          
          return (
            <div key={cls._id} className={`group relative bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-50 overflow-hidden flex flex-col ${isLive ? 'ring-4 ring-[#FFD700]/20 scale-[1.02]' : ''}`}>
              <div className={`h-3 ${isLive ? 'bg-red-500 animate-pulse' : 'bg-[#FFD700]'}`}></div>
              
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-[#1A1A1A] group-hover:rotate-6 transition-all duration-500 ${isLive ? 'bg-[#1A1A1A]' : ''}`}>
                     <GraduationCap className={isLive ? 'text-[#FFD700]' : 'text-[#FFD700]'} size={28} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-4 py-2 rounded-xl bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500 border border-gray-100">
                      {cls.departmentId?.code || 'DEPT'}
                    </span>
                    {isLive && (
                      <span className="mt-2 text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                        🟢 Live Now
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 tracking-tighter leading-tight group-hover:text-[#FFD700] transition-colors">{cls.className}</h3>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em] mb-6">{cls.departmentId?.name || 'Department'}</p>

                <div className="space-y-4 pt-6 border-t border-gray-50">
                  <div className="flex items-center text-gray-600">
                     <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3">
                        <LayoutGrid size={14} className="text-[#FFD700]" />
                     </div>
                     <span className="text-xs font-black uppercase tracking-widest leading-none">Year {cls.year} — Section {cls.section}</span>
                  </div>
                  {isLive && (
                    <div className="flex items-center text-emerald-600 pt-2">
                       <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mr-3">
                          <Clock size={14} className="text-emerald-500" />
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-widest leading-none italic">Started {new Date(activeSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                {isLive ? (
                   <div className="bg-emerald-50 border-t border-emerald-100 p-6 flex items-center justify-center space-x-2 text-emerald-600">
                      <CheckCircle2 size={18} />
                      <span className="text-xs font-black uppercase tracking-widest">In Progress</span>
                   </div>
                ) : (
                  <button 
                    onClick={() => handleStartClass(cls._id)}
                    disabled={activeSession !== null || isProcessing === cls._id}
                    className="w-full py-6 bg-[#1A1A1A] text-white hover:bg-[#FFD700] hover:text-[#1A1A1A] transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:grayscale disabled:hover:bg-[#1A1A1A] disabled:hover:text-white"
                  >
                     {isProcessing === cls._id ? (
                       <Loader2 className="animate-spin" size={18} />
                     ) : (
                       <Play size={18} fill="currentColor" />
                     )}
                     <span className="text-xs font-black uppercase tracking-[0.2em]">Start Class</span>
                  </button>
                )}
                
                <button 
                  onClick={() => navigate(`/teacher/class/${cls._id}`)}
                  className="w-full py-6 px-10 bg-gray-50 hover:bg-white text-gray-600 hover:text-[#1A1A1A] transition-all duration-300 flex items-center justify-between border-t border-gray-100"
                >
                   <span className="text-xs font-black uppercase tracking-[0.2em]">View Roster</span>
                   <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherClasses;
