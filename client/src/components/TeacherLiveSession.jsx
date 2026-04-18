import { useState, useEffect } from 'react';
import { Video, Zap, Clock, Users, Play, Square, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TeacherLiveSession = ({ teacher }) => {
  const [activeSession, setActiveSession] = useState(null);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    fetchActiveSession();
  }, []);

  useEffect(() => {
    if (activeSession && activeSession._id) {
      fetchMeetingToken();
    }
  }, [activeSession]);

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

  const fetchMeetingToken = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/sessions/token', 
        { sessionId: activeSession._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeetingUrl(response.data.data.meetingUrl);
    } catch (error) {
      console.error('Error fetching Jitsi token:', error);
      toast.error('Failed to initialize secure meeting');
    }
  };

  const handleStartClass = async () => {
    if (!selectedClass) {
      toast.error('Please select a class to start');
      return;
    }

    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/sessions', 
        { classId: selectedClass },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setActiveSession(response.data.data);
      toast.success('Live Session Started!');
    } catch (error) {
      console.error('Error starting class:', error);
      toast.error(error.response?.data?.message || 'Failed to start class');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndClass = async () => {
    if (!activeSession) return;

    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      await axios.patch(`/api/sessions/${activeSession._id}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setActiveSession(null);
      setMeetingUrl('');
      setSelectedClass('');
      toast.success('Session ended successfully');
    } catch (error) {
       console.error('Error ending session:', error);
       toast.error('Failed to end session');
    } finally {
      setIsProcessing(false);
    }
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
          Live <span className="text-[#FFD700]">Session Command</span>
        </h2>
        <p className="text-gray-500 mt-2 font-medium italic">Broadcast your academic presence and track real-time attendance</p>
      </div>

      {!activeSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-12">
             <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-12 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full -mr-20 -mt-20 group-hover:bg-yellow-400/10 transition-colors"></div>
                
                <div className="max-w-2xl">
                   <div className="w-16 h-16 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center mb-8 rotate-3">
                      <Zap className="text-[#FFD700]" size={32} />
                   </div>
                   <h3 className="text-4xl font-black text-[#1A1A1A] mb-4 tracking-tighter italic">Initialize Broadcast</h3>
                   <p className="text-gray-500 text-lg mb-10 font-bold uppercase tracking-widest text-[10px]">Select a batch to start your digital attendance session</p>
                   
                   <div className="space-y-6">
                      <div className="relative group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block italic">Select Target Batch</label>
                        <select 
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-lg font-black text-[#1A1A1A] focus:ring-4 focus:ring-[#FFD700]/10 transition-all appearance-none uppercase tracking-tight outline-none"
                        >
                          <option value="">-- Choose Assigned Class --</option>
                          {teacher?.assignedClasses?.map(cls => (
                            <option key={cls._id} value={cls._id}>
                              {cls.className} — Year {cls.year} ({cls.section})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button 
                        onClick={handleStartClass}
                        disabled={isProcessing || !selectedClass}
                        className="group relative w-full flex items-center justify-center bg-[#1A1A1A] hover:bg-[#FFD700] text-white hover:text-[#1A1A1A] px-10 py-6 rounded-2xl font-black transition-all duration-500 shadow-xl shadow-gray-200 hover:shadow-yellow-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] text-sm overflow-hidden"
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                         {isProcessing ? (
                           <Loader2 className="animate-spin mr-3" size={20} />
                         ) : (
                           <Play className="mr-3" size={20} />
                         )}
                         Start Broadcast Class
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
           {/* Active Session Display */}
           <div className="bg-[#1A1A1A] rounded-[2.5rem] shadow-2xl p-10 border border-white/5 relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                 <div>
                    <div className="flex items-center space-x-3 mb-2">
                       <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                       <span className="text-[#FFD700] font-black uppercase tracking-[0.3em] text-[10px] italic">Live Instruction In Progress</span>
                    </div>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                      {activeSession.classId?.className}
                    </h3>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 italic">Session Code: <span className="text-white font-black ml-1">{activeSession.sessionCode}</span></p>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 text-center">
                       <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">Presence Synced</p>
                       <p className="text-xl font-black text-white italic leading-none">{activeSession.attendanceCount || 0}</p>
                    </div>
                    <button 
                      onClick={handleEndClass}
                      disabled={isProcessing}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black transition-all duration-300 shadow-xl shadow-red-900/10 active:scale-95 flex items-center justify-center uppercase tracking-widest text-[10px]"
                    >
                      {isProcessing ? (
                        <Loader2 className="animate-spin mr-3" size={16} />
                      ) : (
                        <Square size={14} className="mr-3" />
                      )}
                      End Broadcast
                    </button>
                 </div>
              </div>
           </div>

           {/* Video Meeting Interface */}
           <div className="bg-white rounded-[2.5rem] shadow-2xl border-4 border-[#1A1A1A] overflow-hidden relative group">
              {!meetingUrl ? (
                <div className="h-[650px] flex flex-col items-center justify-center space-y-4 bg-gray-50">
                   <Loader2 className="animate-spin text-[#FFD700]" size={40} />
                   <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-[0.2em] italic">Securing meeting perimeter...</p>
                </div>
              ) : (
                <iframe
                  src={`${meetingUrl}&config.startWithAudioMuted=true&config.startWithVideoMuted=false`}
                  width="100%"
                  height="650px"
                  allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                  className="w-full border-none"
                  style={{ backgroundColor: '#1A1A1A' }}
                  title="Live Classroom Broadcast"
                />
              )}
           </div>

           <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="text-[#FFD700]" size={24} />
                 </div>
                 <div>
                    <h5 className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest leading-none mb-1 text-center md:text-left">Role Enforced Broadcast</h5>
                    <p className="text-xs text-gray-400 font-medium italic text-center md:text-left">JWT-based authentication is active. You are joined as the Moderator with administrative session controls.</p>
                 </div>
              </div>
              <div className="flex items-center space-x-2">
                 <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mr-2">Broadcasting to</span>
                 <span className="px-4 py-2 bg-gray-50 rounded-lg text-[9px] font-black text-gray-800 uppercase tracking-widest border border-gray-100 italic font-black">Secure Jitsi Node</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TeacherLiveSession;
