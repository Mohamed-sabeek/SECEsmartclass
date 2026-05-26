import { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Scan, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Video, 
  GraduationCap, 
  Lock,
  Zap,
  Clock,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentJoinSession = () => {
  const { user: currentUser } = useAuth();
  const [activeSession, setActiveSession] = useState(null);
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Jitsi States
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [jitsiData, setJitsiData] = useState(null);
  
  const jitsiApiRef = useRef(null);
  const hasConfirmedJoin = useRef(false);

  useEffect(() => {
    fetchActiveSession();
    // Refresh detection every 10 seconds if not in a meeting
    const interval = setInterval(() => {
      if (!meetingStarted) {
        fetchActiveSession();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [meetingStarted]);

  useEffect(() => {
    if (!meetingStarted || !jitsiData) return;

    const initializeMeeting = () => {
      if (!window.JitsiMeetExternalAPI) {
        console.error("❌ Jitsi API missing");
        setMeetingLoading(false);
        toast.error("Meeting engine not loaded. Please refresh.");
        return;
      }

      const container = document.getElementById("jitsi-container");
      if (!container) {
        console.error("❌ Jitsi container missing");
        // Retry once if container not found
        return;
      }

      try {
        const options = {
          roomName: jitsiData.room,
          width: '100%',
          height: 700,
          parentNode: container,
          jwt: jitsiData.token,
          userInfo: {
            displayName: currentUser?.name || 'Student'
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
          },
          configOverwrite: {
            startWithAudioMuted: true,
            disableInviteFunctions: true,
          }
        };

        const api = new window.JitsiMeetExternalAPI('8x8.vc', options);
        jitsiApiRef.current = api;
        
        // ✅ Hide loading overlay immediately after iframe initialization
        setMeetingLoading(false);

        api.addEventListeners({
          videoConferenceJoined: handleJoined,
          videoConferenceLeft: () => handleLeft(false), // Triggered by refresh/hangup - do NOT call backend leave
          participantJoined: (participant) => console.log('Participant joined:', participant),
          participantLeft: (participant) => console.log('Participant left:', participant)
        });
      } catch (error) {
        console.error("❌ Jitsi initialization failed", error);
        setMeetingLoading(false);
        toast.error("Failed to load meeting interface");
      }
    };

    // Small delay to ensure the DOM element #jitsi-container is rendered
    const timer = setTimeout(initializeMeeting, 500);
    return () => clearTimeout(timer);
  }, [meetingStarted, jitsiData]);

  // Engagement Monitoring: Tab Switch Tracking
  useEffect(() => {
    const handleVisibilityChange = async () => {
      // ONLY trigger when tab becomes hidden AND meeting is active
      if (document.visibilityState === 'hidden' && meetingStarted && activeSession && hasConfirmedJoin.current) {
        try {
          const token = localStorage.getItem('token');
          await axios.post('/api/engagement/tab-switch', 
            { sessionId: activeSession._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (error) {
          // Fail silently to not disturb the student experience
          console.warn('Engagement monitoring paused: ', error.message);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [meetingStarted, activeSession]);

  const fetchActiveSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/sessions/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const session = response.data.data;
      setActiveSession(session);
      
      // Auto-reconnect if session was active before refresh
      if (session && localStorage.getItem('student_session_active') === 'true' && !meetingStarted) {
        handleJoin(session);
      } else if (!session) {
        localStorage.removeItem('student_session_active');
      }
    } catch (error) {
      console.error('Error fetching active session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (providedSession = null) => {
    const sessionToJoin = providedSession || activeSession;
    if (!sessionToJoin) return;

    try {
      setJoining(true);
      const token = localStorage.getItem('token');
      
      // Fetch Secure Meeting Access Token
      const response = await axios.post('/api/sessions/token',
        { sessionId: sessionToJoin._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setJitsiData(response.data.data);
      setMeetingStarted(true);
      setMeetingLoading(true);
      localStorage.setItem('student_session_active', 'true');
      toast.success('Secure Channel Synchronized!');
      
    } catch (error) {
      console.error('Join error:', error);
      toast.error(error.response?.data?.message || 'Failed to initialize session');
    } finally {
      setJoining(false);
    }
  };

  const handleJoined = async () => {
    if (hasConfirmedJoin.current) return;
    hasConfirmedJoin.current = true;
    
    // ⏱️ Delay attendance recording by 3 seconds to ensure stable connection
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.post('/api/sessions/join', 
          { sessionId: activeSession._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Error recording join time:', error);
      }
    }, 3000);
  };

  const handleLeft = async (isExplicit = true) => {
    // Always clear local UI state
    setMeetingStarted(false);
    setMeetingLoading(false);
    hasConfirmedJoin.current = false;
    
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    setJitsiData(null);

    // ONLY call backend leave and clear storage if explicitly clicked "Exit" or Jitsi hangup
    if (isExplicit) {
      localStorage.removeItem('student_session_active');
      try {
        const token = localStorage.getItem('token');
        await axios.post(`/api/sessions/${activeSession._id}/leave`, 
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Session recorded successfully');
      } catch (error) {
        console.error('Error recording leave time:', error);
      }
    }
    
    // Refresh session data
    fetchActiveSession();
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FFD700]" size={40} />
      </div>
    );
  }

  // Meeting View
  if (meetingStarted) {
    return (
      <div className="animate-in fade-in duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-2 h-2 rounded-full ${!meetingLoading ? 'bg-green-500' : 'bg-[#FFD700] animate-pulse'}`}></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                {!meetingLoading ? 'SECURE CHANNEL ACTIVE' : 'INITIALIZING BROADCAST...'}
              </span>
            </div>
            <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter italic uppercase">
              {activeSession?.classId?.className} <span className="text-[#FFD700]">Live</span>
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] shadow-sm flex items-center">
                <Clock size={14} className="mr-2 text-[#FFD700]" />
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
             </div>
             <button 
               onClick={() => handleLeft(true)}
               className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center hover:bg-red-600 hover:text-white transition-all"
             >
                <X size={14} className="mr-2" />
                Exit Classroom
             </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white relative min-h-[700px] flex flex-col">
          {meetingLoading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#F8F9FA]/90 backdrop-blur-sm">
              <div className="relative">
                <Zap className="text-[#FFD700] animate-bounce mb-4" size={48} />
                <div className="absolute -inset-4 bg-[#FFD700]/20 rounded-full animate-ping"></div>
              </div>
              <p className="text-sm font-black text-[#1A1A1A] uppercase tracking-[0.3em] italic">
                {localStorage.getItem('student_session_active') === 'true' 
                  ? "Reconnecting to live classroom..." 
                  : "Syncing with Faculty Broadcast..."}
              </p>
              <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Securing End-to-End Tunnel</p>
            </div>
          )}
          <div 
            id="jitsi-container" 
            className="w-full h-[700px] rounded-3xl"
          ></div>
        </div>
      </div>
    );
  }

  // Join View
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
                     <p className="text-gray-400 text-sm font-medium italic mb-8 uppercase tracking-tighter">JWT Authentication Required</p>
                     
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
                     <button 
                        onClick={() => handleJoin()}
                        disabled={joining}
                        className="w-full aspect-square bg-[#1A1A1A] text-[#FFD700] rounded-[2.5rem] flex flex-col items-center justify-center group hover:bg-[#FFD700] hover:text-[#1A1A1A] transition-all duration-500 shadow-2xl shadow-gray-900/20 active:scale-95"
                     >
                        {joining ? (
                           <Loader2 className="animate-spin" size={40} />
                        ) : (
                           <>
                              <Video size={48} className="mb-4 group-hover:scale-110 transition-transform" />
                              <span className="text-sm font-black uppercase tracking-[0.2em] italic">Enter Classroom</span>
                           </>
                        )}
                     </button>
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
