import { useState, useEffect } from 'react';
import { Radio, Scan, Loader2, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Video, GraduationCap, Lock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentJoinSession = () => {
  const [activeSession, setActiveSession] = useState(null);
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveSession();
    // Refresh detection every 10 seconds
    const interval = setInterval(fetchActiveSession, 10000);
    return () => clearInterval(interval);
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
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!activeSession) return;

    try {
      setJoining(true);
      const token = localStorage.getItem('token');
      
      // 1. Sync Attendance
      await axios.post('/api/sessions/join', 
        { sessionId: activeSession._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // 2. Fetch Secure Meeting Access Token
      const jitsiResponse = await axios.post('/api/sessions/token',
        { sessionId: activeSession._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Attendance and Secure Channel Synchronized!');
      
      // 3. Open Secure Room
      if (jitsiResponse.data.data.meetingUrl) {
        window.open(jitsiResponse.data.data.meetingUrl, '_blank');
      }
      
      fetchActiveSession(); // Re-fetch to get isJoined status
    } catch (error) {
      console.error('Join error:', error);
      toast.error(error.response?.data?.message || 'Failed to join session');
    } finally {
      setJoining(false);
    }
  };

  const handleRejoin = async () => {
    if (!activeSession) return;
    try {
      const token = localStorage.getItem('token');
      const jitsiResponse = await axios.post('/api/sessions/token',
        { sessionId: activeSession._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (jitsiResponse.data.data.meetingUrl) {
        window.open(jitsiResponse.data.data.meetingUrl, '_blank');
      }
    } catch (error) {
      toast.error('Failed to regenerate secure access token');
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FFD700]" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom duration-700 max-w-4xl mx-auto py-6">
      <div className="text-center mb-12">
         <div className="w-20 h-20 bg-[#FFD700]/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Radio className="text-[#FFD700]" size={32} />
         </div>
         <h2 className="text-4xl font-black text-[#1A1A1A] tracking-tighter mb-4 italic">
            Broadcast <span className="text-[#FFD700]">Synchronization</span>
          </h2>
          <p className="text-gray-500 font-medium italic">Automatically detect and join live academic sessions broadcasted for your batch</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
         {activeSession ? (
            <div className={`bg-white rounded-[3rem] p-12 shadow-2xl border-2 transition-all duration-500 ${activeSession.isJoined ? 'border-green-100' : 'border-[#FFD700] shadow-yellow-200/50'}`}>
               <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="flex-1 text-center md:text-left">
                     <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
                        <div className={`w-3 h-3 rounded-full ${activeSession.isJoined ? 'bg-green-500' : 'bg-red-500 animate-ping'}`}></div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest italic">
                          {activeSession.isJoined ? 'SECURE CHANNEL ACTIVE' : 'LIVE BROADCAST DETECTED'}
                        </span>
                     </div>
                     <h3 className="text-5xl font-black text-[#1A1A1A] tracking-tighter italic uppercase mb-2">
                        {activeSession.classId?.className}
                     </h3>
                     <p className="text-gray-500 text-lg font-bold italic mb-0">Faculty Representative: {activeSession.teacherId?.name}</p>
                     <p className="text-gray-400 text-sm font-medium italic mb-8 uppercase tracking-tighter italic">JWT Authentication Required</p>
                     
                     <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <div className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] shadow-sm flex items-center">
                           <ShieldCheck size={14} className="mr-2 text-green-500" />
                           Identity Encrypted
                        </div>
                        <div className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] shadow-sm flex items-center">
                           <GraduationCap size={14} className="mr-2 text-[#FFD700]" />
                           Role: Participant
                        </div>
                     </div>
                  </div>

                  <div className="md:w-72 w-full">
                     {activeSession.isJoined ? (
                        <div className="flex flex-col gap-4 animate-in zoom-in">
                           <div className="bg-green-500 rounded-[2rem] p-8 text-center shadow-xl shadow-green-200/50">
                              <CheckCircle2 className="text-white mx-auto mb-4" size={40} />
                              <p className="text-white text-[10px] font-black uppercase tracking-widest italic leading-none">Access<br/>Synchronized</p>
                           </div>
                           <button 
                             onClick={handleRejoin}
                             className="w-full py-4 bg-[#1A1A1A] text-[#FFD700] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FFD700] hover:text-[#1A1A1A] transition-all flex items-center justify-center"
                           >
                              <Video size={16} className="mr-2" />
                              Launch Meeting
                           </button>
                        </div>
                     ) : (
                        <button 
                           onClick={handleJoin}
                           disabled={joining}
                           className="w-full aspect-square bg-[#1A1A1A] text-[#FFD700] rounded-[2.5rem] flex flex-col items-center justify-center group hover:bg-[#FFD700] hover:text-[#1A1A1A] transition-all duration-500 shadow-2xl shadow-gray-900/20 active:scale-95"
                        >
                           {joining ? (
                              <Loader2 className="animate-spin" size={40} />
                           ) : (
                              <>
                                 <Video size={48} className="mb-4 group-hover:scale-110 transition-transform" />
                                 <span className="text-sm font-black uppercase tracking-[0.2em] italic">GET TOKEN & JOIN</span>
                              </>
                           )}
                        </button>
                     )}
                  </div>
               </div>
            </div>
         ) : (
            <div className="bg-white rounded-[3rem] p-24 shadow-xl border border-gray-100 text-center opacity-70">
               <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-inner">
                  <Scan className="text-gray-300" size={40} />
               </div>
               <h3 className="text-2xl font-black text-gray-400 tracking-tight uppercase mb-2 italic">Scanning Secure Nodes...</h3>
               <p className="text-gray-400 font-medium italic max-w-sm mx-auto">Class presence options will appear automatically as soon as a faculty member starts your session.</p>
               <div className="mt-12 flex justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-bounce"></div>
               </div>
            </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-60">
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex items-start">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm">
                  <ShieldCheck size={20} className="text-[#FFD700]" />
               </div>
               <div>
                  <h5 className="text-[11px] font-black uppercase tracking-[0.1em] text-[#1A1A1A] mb-1 italic">Role-Based Security</h5>
                  <p className="text-[10px] text-gray-400 font-medium italic">Enforcing 'Participant' and 'Moderator' classroom levels</p>
               </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex items-start">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm">
                  <AlertCircle size={20} className="text-[#FFD700]" />
               </div>
               <div>
                  <h5 className="text-[11px] font-black uppercase tracking-[0.1em] text-[#1A1A1A] mb-1 italic">JWT Auth Chain</h5>
                  <p className="text-[10px] text-gray-400 font-medium italic">Dynamically signed meeting links for every academic session</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default StudentJoinSession;
