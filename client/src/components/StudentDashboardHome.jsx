import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CheckCircle, 
  Clock, 
  GraduationCap, 
  Radio, 
  Video, 
  ArrowRight,
  Calendar
} from 'lucide-react';
import axios from 'axios';
import { formatDate } from '../utils/dateUtils';

const StudentDashboardHome = ({ user }) => {
  const [stats, setStats] = useState({
    totalClasses: 0,
    attendedClasses: 0,
    percentage: 0
  });
  const [activeSession, setActiveSession] = useState(null);
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/student/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching student stats:', error);
    }
  };

  const fetchActiveSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/sessions/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveSession(response.data.data);
    } catch (error) {
      console.error('Error fetching active session:', error);
    }
  };

  const fetchScheduledSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/sessions/scheduled', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScheduledSessions(response.data.data);
    } catch (error) {
      console.error('Error fetching scheduled sessions:', error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
    fetchActiveSession();
    fetchScheduledSessions();
    
    // Set up polling for active sessions
    const interval = setInterval(fetchActiveSession, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinScheduledClass = () => {
    const event = new CustomEvent('switchTab', { detail: 'join' });
    window.dispatchEvent(event);
  };

  const handleAutoJoin = () => {
    const event = new CustomEvent('switchTab', { detail: 'join' });
    window.dispatchEvent(event);
  };

  const activeScheduledSessions = (scheduledSessions || []).filter(session => {
    const scheduledDateObj = new Date(session.scheduledDate);
    const endDateTime = new Date(scheduledDateObj);
    const [endH, endM] = session.endTime.split(':');
    endDateTime.setHours(parseInt(endH, 10), parseInt(endM, 10), 0, 0);

    const isAfterEnd = now > endDateTime;
    const isCompleted = session.status === 'COMPLETED';

    return !isAfterEnd && !isCompleted;
  });

  const statItems = [
    { label: 'Total Broadacasts', value: stats.totalClasses, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Sessions Attended', value: stats.attendedClasses, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Participation %', value: `${stats.percentage}%`, icon: GraduationCap, color: 'text-[#FFD700]', bg: 'bg-[#FFD700]/10' },
  ];

  return (
    <div className="animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="bg-[#1A1A1A] rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden mb-10 border border-white/5">
        <div className="absolute top-0 right-0 p-10 opacity-10">
           <GraduationCap size={150} className="text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           <div>
              <span className="inline-flex items-center px-4 py-1.5 bg-[#FFD700] text-[#1A1A1A] text-[10px] font-black uppercase tracking-widest rounded-full mb-6 italic">
                 Portal Pulse Active
              </span>
              <h2 className="text-5xl font-black text-white italic tracking-tighter leading-none mb-4">
                 Hello, <span className="text-[#FFD700]">{user?.name?.split(' ')[0]}</span>
              </h2>
              <p className="text-gray-400 text-lg font-medium italic max-w-xl">
                Welcome back to your academic command center. Ready to drive excellence in your classes today?
              </p>
           </div>

           {/* Active Class Notification Card */}
           {activeSession && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:min-w-[300px] animate-in zoom-in duration-500">
                 <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-2 h-2 ${activeSession.isJoined ? 'bg-green-500' : 'bg-red-500 animate-ping'} rounded-full`}></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                      {activeSession.isJoined ? 'Sync Active' : 'Live Broadcast'}
                    </span>
                 </div>
                 <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2 italic">
                    {activeSession.classId?.className}
                 </h4>
                 <p className="text-xs text-gray-400 mb-6 font-medium">Faculty: {activeSession.teacherId?.name}</p>
                                  {activeSession.isJoined ? (
                    <div className="flex flex-col gap-3">
                       <div className="w-full py-4 bg-green-500/20 border border-green-500/30 text-green-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2">
                          <CheckCircle size={14} />
                          <span>Presence Synchronized</span>
                       </div>
                       <button 
                         onClick={handleAutoJoin}
                         className="w-full py-3 bg-[#1A1A1A] text-[#FFD700] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center border border-white/10"
                       >
                          Open Secure Meeting
                       </button>
                    </div>
                 ) : (
                    <button 
                      onClick={handleAutoJoin}
                      className="w-full py-4 bg-[#FFD700] text-[#1A1A1A] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center shadow-lg shadow-yellow-500/10 font-black active:scale-95"
                    >
                       Join Session Now
                    </button>
                 )}
              </div>
           )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {statItems.map((item, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex items-center group hover:border-[#FFD700] transition-all duration-500">
             <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform`}>
                <item.icon className={item.color} size={28} />
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                <h4 className="text-3xl font-black text-[#1A1A1A] italic leading-none">{item.value}</h4>
             </div>
          </div>
        ))}
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Join Info Card */}
         <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110"></div>
            <div className="flex flex-col items-center md:items-start relative z-10">
               <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                  <Radio className="text-[#FFD700]" size={24} />
               </div>
               <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight mb-2 uppercase">Role-Based Class Access</h3>
               <p className="text-gray-500 text-sm font-medium italic mb-8">Attendance is now secured with JWT authentication. You join sessions as a 'Participant' while faculty retain 'Moderator' controls.</p>
               <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 bg-gray-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#FFD700] italic">
                     JWT Secured
                  </div>
                  <div className="px-4 py-2 bg-gray-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 italic">
                     Authorized Nodes
                  </div>
               </div>
            </div>
         </div>

         {/* Class Status Card */}
         <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 relative overflow-hidden group">
            {activeSession ? (
               <div className="flex flex-col items-center md:items-start">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
                     <Video className="text-red-500" size={24} />
                  </div>
                  <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight mb-2 uppercase">Live broadcast in progress</h3>
                  <p className="text-gray-500 text-sm font-medium italic mb-8">Your faculty has started a session for <span className="text-[#1A1A1A] font-bold uppercase">{activeSession.classId?.className}</span>. Sync now to start learning.</p>
                  
                  <div className="flex items-center space-x-2 text-[10px] font-black text-[#FFD700] uppercase tracking-widest italic animate-bounce">
                     <ArrowRight size={14} />
                     <span>Secure Channel Detected</span>
                  </div>
               </div>
            ) : (
               <div className="flex flex-col items-center md:items-start text-center md:text-left h-full justify-center opacity-40 grayscale">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                     <Video className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight mb-2 uppercase">No Active Broadcasts</h3>
                  <p className="text-gray-500 text-sm font-medium italic">We'll alert you as soon as a faculty member starts a session for your class.</p>
               </div>
            )}
         </div>
      </div>

      {/* Upcoming Scheduled Sessions */}
      {activeScheduledSessions && activeScheduledSessions.length > 0 ? (
        <div className="mt-8 bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 relative overflow-hidden">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
               <Calendar className="text-[#FFD700]" size={24} />
            </div>
            <div>
               <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight uppercase">Upcoming Scheduled Classes</h3>
               <p className="text-gray-500 text-xs font-medium italic">Classes planned by your faculty</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {activeScheduledSessions.map((session, idx) => {
                const formatTime12h = (time24) => {
                  const [hourStr, minute] = time24.split(':');
                  let hour = parseInt(hourStr, 10);
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  hour = hour % 12 || 12;
                  return `${hour}:${minute} ${ampm}`;
                };

                const scheduledDateObj = new Date(session.scheduledDate);
                 
                const startDateTime = new Date(scheduledDateObj);
                const [startH, startM] = session.startTime.split(':');
                startDateTime.setHours(parseInt(startH, 10), parseInt(startM, 10), 0, 0);

                const endDateTime = new Date(scheduledDateObj);
                const [endH, endM] = session.endTime.split(':');
                endDateTime.setHours(parseInt(endH, 10), parseInt(endM, 10), 0, 0);

                const isBeforeStart = now < startDateTime;
                const isLive = now >= startDateTime && now <= endDateTime;

                return (
                <div key={idx} className="bg-gray-50 rounded-3xl p-6 border border-gray-100 hover:border-[#FFD700]/30 transition-colors">
                   <span className="inline-block px-3 py-1 bg-white rounded-lg text-[9px] font-black uppercase tracking-widest text-[#FFD700] mb-4 shadow-sm italic">
                      {formatDate(session.scheduledDate)}
                   </span>
                   <h4 className="text-lg font-black text-[#1A1A1A] italic mb-1 uppercase leading-none">{session.subject}</h4>
                   <p className="text-gray-500 text-xs font-bold mb-4">{session.teacher?.name}</p>
                   
                   <div className="flex items-center space-x-2 text-[#1A1A1A] bg-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm mb-4">
                      <Clock size={14} className="text-gray-400" />
                      <span>{formatTime12h(session.startTime)} - {formatTime12h(session.endTime)}</span>
                   </div>
                   
                   {isLive && (
                     <button 
                       onClick={handleJoinScheduledClass}
                       className="w-full mt-2 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                     >
                       <Radio size={14} className="mr-2" />
                       Join Class
                     </button>
                   )}
                   {isBeforeStart && (
                     <button 
                       disabled
                       className="w-full mt-2 flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed"
                     >
                       <Clock size={14} className="mr-2" />
                       Waiting For Class To Start
                     </button>
                   )}
                </div>
                )
             })}
          </div>
        </div>
      ) : (
        <div className="mt-12 p-10 bg-white rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
               <Calendar className="text-gray-300" size={32} />
            </div>
            <div className="text-center">
               <p className="text-gray-800 font-black text-lg">No Upcoming Scheduled Classes</p>
               <p className="text-gray-500 text-sm max-w-sm mt-1">We will alert you when your faculty schedules an upcoming session.</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboardHome;
