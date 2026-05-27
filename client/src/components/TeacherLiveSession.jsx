import { useState, useEffect, useRef } from 'react';
import { Video, Zap, Clock, Users, Play, Square, Loader2, AlertCircle, BookOpen, Calendar } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Dropdown from './ui/Dropdown';

const TeacherLiveSession = ({ teacher, preSelectedClassId, preSelectedSubject }) => {
  const navigate = useNavigate();
  const [activeSession, setActiveSession] = useState(null);
  const [jitsiData, setJitsiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedClass, setSelectedClass] = useState(preSelectedClassId || '');
  const [selectedSection, setSelectedSection] = useState('');
  const [subject, setSubject] = useState(preSelectedSubject || '');

  // Schedule Session States
  const [scheduleClass, setScheduleClass] = useState('');
  const [scheduleSection, setScheduleSection] = useState('');
  const [scheduleSubject, setScheduleSubject] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    if (preSelectedClassId) setSelectedClass(preSelectedClassId);
    if (preSelectedSubject) setSubject(preSelectedSubject);
  }, [preSelectedClassId, preSelectedSubject]);

  // Helper: get available sections for a class (from assignments or class object)
  const getSectionsForClass = (classId, assignments, assignedClasses) => {
    if (!classId) return [];
    const assigned = assignments
      ?.filter(a => (a.classId?._id || a.classId).toString() === classId.toString())
      ?.map(a => a.section)
      ?.filter(Boolean) || [];
    const uniqueAssigned = [...new Set(assigned)];
    if (uniqueAssigned.length > 0) return uniqueAssigned;
    const clsObj = assignedClasses?.find(c => c._id.toString() === classId.toString());
    return clsObj?.sections?.map(s => s.name).filter(Boolean) || [];
  };

  // Smart UX: Auto-select subject and section when class is chosen based on assignments
  useEffect(() => {
    if (!selectedClass || activeSession) return;

    const assignedAssignments = teacher?.classAssignments
      ?.filter(a => (a.classId?._id || a.classId).toString() === selectedClass.toString()) || [];

    const availableSections = getSectionsForClass(selectedClass, teacher?.classAssignments, teacher?.assignedClasses);

    if (availableSections.length === 0) {
      // No sections configured — auto-select 'none'
      setSelectedSection('none');
    } else if (assignedAssignments.length > 0) {
      setSelectedSection(assignedAssignments[0].section || '');
    } else {
      setSelectedSection('');
    }

    if (assignedAssignments.length > 0) {
      setSubject(assignedAssignments[0].subject || '');
    }
  }, [selectedClass, teacher, activeSession]);

  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const isEndingRef = useRef(false);

  useEffect(() => {
    fetchActiveSession();
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (activeSession && activeSession._id) {
      fetchMeetingToken();
    }
  }, [activeSession]);

  useEffect(() => {
    if (jitsiData && jitsiContainerRef.current && !jitsiApiRef.current) {
      initializeJitsi();
    }
  }, [jitsiData]);

  const fetchActiveSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/sessions/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const session = response.data.data;
      setActiveSession(session);
      if (session) {
        setSubject(session.subject || '');
        setSelectedClass(session.classId?._id || '');
        setSelectedSection(session.section || '');
        // Persist session active state
        localStorage.setItem('teacher_session_active', 'true');
      } else {
        localStorage.removeItem('teacher_session_active');
      }
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
      setJitsiData(response.data.data);
    } catch (error) {
      console.error('Error fetching Jitsi token:', error);
      toast.error('Failed to initialize secure meeting');
    }
  };

  const initializeJitsi = () => {
    if (!window.JitsiMeetExternalAPI) {
      console.error('Jitsi Meet External API not loaded');
      return;
    }

    const options = {
      roomName: jitsiData.room,
      width: '100%',
      height: 650,
      parentNode: jitsiContainerRef.current,
      jwt: jitsiData.token,
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

    api.addEventListeners({
      videoConferenceLeft: handleConferenceLeft,
      readyToClose: handleConferenceLeft
    });
  };

  const handleConferenceLeft = () => {
    setJitsiData(null);
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
  };

  const handleStartClass = async () => {
    if (!selectedClass) {
      toast.error('Please select a class to start');
      return;
    }
    if (!selectedSection) {
      toast.error('Please select a section to start');
      return;
    }
    // 'none' is valid — means class has no sections

    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/sessions', 
        { 
          classId: selectedClass,
          section: selectedSection,
          subject: subject
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setActiveSession(response.data.data);
      localStorage.setItem('teacher_session_active', 'true');
      toast.success('Live Session Started! Notifications sent to students.');
    } catch (error) {
      console.error('Error starting class:', error);
      toast.error(error.response?.data?.message || 'Failed to start class');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScheduleSession = async () => {
    if (!scheduleClass || !scheduleSection || !scheduleSubject || !scheduleDate || !startTime || !endTime) {
      toast.error('Please fill all scheduling fields');
      return;
    }

    try {
      setIsScheduling(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/sessions/schedule', 
        { 
          classId: scheduleClass,
          section: scheduleSection,
          subject: scheduleSubject,
          scheduledDate: scheduleDate,
          startTime,
          endTime
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Session Scheduled! Notifications sent to students.');
      setScheduleClass('');
      setScheduleSection('');
      setScheduleSubject('');
      setScheduleDate('');
      setStartTime('');
      setEndTime('');
    } catch (error) {
      console.error('Error scheduling class:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule class');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleEndClass = async (fromJitsi = false) => {
    if (!activeSession || isEndingRef.current) return;
    
    try {
      isEndingRef.current = true;
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      
      await axios.patch(`/api/sessions/${activeSession._id}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!fromJitsi && jitsiApiRef.current) {
        jitsiApiRef.current.executeCommand('hangup');
      }

      const sessionId = activeSession._id;
      setActiveSession(null);
      setJitsiData(null);
      localStorage.removeItem('teacher_session_active');
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
      
      toast.success('Session ended successfully');
      navigate(`/teacher/reports/${sessionId}`);
    } catch (error) {
       console.error('Error ending session:', error);
       if (error.response?.status === 400 && error.response?.data?.message === 'Session already ended') {
         navigate(`/teacher/reports/${activeSession._id}`);
       } else {
         toast.error('Failed to end session');
         isEndingRef.current = false;
       }
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
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-12">
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-12 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full -mr-20 -mt-20 group-hover:bg-yellow-400/10 transition-colors"></div>
                
                <div className="max-w-4xl">
                  <div className="w-16 h-16 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center mb-8 rotate-3">
                    <Zap className="text-[#FFD700]" size={32} />
                  </div>
                  <h3 className="text-4xl font-black text-[#1A1A1A] mb-4 tracking-tighter italic">Initialize Broadcast</h3>
                  <p className="text-gray-500 text-lg mb-10 font-bold uppercase tracking-widest text-[10px]">Select class, section, and subject to start your digital session</p>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="relative group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block italic">Target Batch</label>
                        <Dropdown
                          value={selectedClass}
                          onChange={(val) => {
                            setSelectedClass(val);
                            setSelectedSection('');
                          }}
                          options={teacher?.assignedClasses?.map(cls => ({
                            label: `${cls.className} — Year ${cls.year}`,
                            value: cls._id
                          })) || []}
                          placeholder="-- Choose Class --"
                          className="w-full"
                          buttonClassName="!rounded-2xl !py-5 !bg-gray-50 !border-none !text-lg !font-black !tracking-tight !text-[#1A1A1A] !uppercase"
                        />
                      </div>
                      <div className="relative group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block italic">Target Section</label>
                        {(() => {
                          const sections = getSectionsForClass(selectedClass, teacher?.classAssignments, teacher?.assignedClasses);
                          const hasNoSections = selectedClass && sections.length === 0;
                          if (hasNoSections) {
                            return (
                              <div className="w-full rounded-2xl py-5 px-6 bg-gray-100 border-none text-lg font-black tracking-tight text-gray-400 uppercase cursor-not-allowed flex items-center">
                                None (Auto-selected)
                              </div>
                            );
                          }
                          return (
                            <Dropdown
                              value={selectedSection}
                              onChange={setSelectedSection}
                              options={sections.map(s => ({ label: `Section ${s}`, value: s }))}
                              placeholder={selectedClass ? "-- Choose Section --" : "-- Choose Class First --"}
                              className="w-full"
                              disabled={!selectedClass}
                              buttonClassName="!rounded-2xl !py-5 !bg-gray-50 !border-none !text-lg !font-black !tracking-tight !text-[#1A1A1A] !uppercase"
                            />
                          );
                        })()}
                      </div>
                      <div className="relative group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block italic">Subject Name</label>
                        <Dropdown
                          value={subject}
                          onChange={setSubject}
                          options={(() => {
                            if (!selectedClass) return teacher?.teacherDetails?.subjects?.map(sub => ({ label: sub, value: sub })) || [];
                            const assigned = teacher?.classAssignments
                              ?.filter(a => (a.classId?._id || a.classId).toString() === selectedClass.toString() && (!selectedSection || a.section === selectedSection))
                              ?.map(a => a.subject) || [];
                            const displaySubjects = assigned.length > 0 ? assigned : (teacher?.teacherDetails?.subjects || []);
                            return displaySubjects.map(sub => ({ label: sub, value: sub }));
                          })()}
                          placeholder="-- Choose Subject --"
                          className="w-full"
                          buttonClassName="!rounded-2xl !py-5 !bg-gray-50 !border-none !text-lg !font-black !tracking-tight !text-[#1A1A1A] !uppercase"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleStartClass}
                      disabled={isProcessing || !selectedClass || !selectedSection || !subject}
                      // selectedSection is auto-set to 'none' when class has no sections
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

          <div className="grid grid-cols-1 mt-10">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-12 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 rounded-full -mr-20 -mt-20 transition-colors"></div>
              
              <div className="max-w-4xl relative z-10">
                <div className="w-16 h-16 bg-[#1A1A1A] rounded-2xl flex items-center justify-center mb-8 rotate-3">
                  <Calendar className="text-[#FFD700]" size={32} />
                </div>
                <h3 className="text-4xl font-black text-[#1A1A1A] mb-4 tracking-tighter italic">Schedule Academic Session</h3>
                <p className="text-gray-500 text-lg mb-10 font-bold uppercase tracking-widest text-[10px]">Plan future classes and notify students automatically</p>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative group">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block italic">Select Class</label>
                      <Dropdown
                        value={scheduleClass}
                        onChange={(val) => {
                          setScheduleClass(val);
                          setScheduleSection('');
                        }}
                        options={teacher?.assignedClasses?.map(cls => ({
                          label: `${cls.className} — Year ${cls.year}`,
                          value: cls._id
                        })) || []}
                        placeholder="-- Choose Class --"
                        className="w-full"
                        buttonClassName="!rounded-2xl !py-5 !bg-gray-50 !border-none !text-lg !font-black !tracking-tight !text-[#1A1A1A] !uppercase"
                      />
                    </div>
                    <div className="relative group">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block italic">Select Section</label>
                      {(() => {
                        const sections = getSectionsForClass(scheduleClass, teacher?.classAssignments, teacher?.assignedClasses);
                        const hasNoSections = scheduleClass && sections.length === 0;
                        if (hasNoSections) {
                          // Auto-set scheduleSection to 'none' if not already
                          if (scheduleSection !== 'none') setScheduleSection('none');
                          return (
                            <div className="w-full rounded-2xl py-5 px-6 bg-gray-100 border-none text-lg font-black tracking-tight text-gray-400 uppercase cursor-not-allowed flex items-center">
                              None (Auto-selected)
                            </div>
                          );
                        }
                        return (
                          <Dropdown
                            value={scheduleSection}
                            onChange={setScheduleSection}
                            options={sections.map(s => ({ label: `Section ${s}`, value: s }))}
                            placeholder={scheduleClass ? "-- Choose Section --" : "-- Choose Class First --"}
                            className="w-full"
                            disabled={!scheduleClass}
                            buttonClassName="!rounded-2xl !py-5 !bg-gray-50 !border-none !text-lg !font-black !tracking-tight !text-[#1A1A1A] !uppercase"
                          />
                        );
                      })()}
                    </div>
                    <div className="relative group">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block italic">Select Subject</label>
                      <Dropdown
                        value={scheduleSubject}
                        onChange={setScheduleSubject}
                        options={(() => {
                          if (!scheduleClass) return teacher?.teacherDetails?.subjects?.map(sub => ({ label: sub, value: sub })) || [];
                          const assigned = teacher?.classAssignments
                            ?.filter(a => (a.classId?._id || a.classId).toString() === scheduleClass.toString() && (!scheduleSection || a.section === scheduleSection))
                            ?.map(a => a.subject) || [];
                          const displaySubjects = assigned.length > 0 ? assigned : (teacher?.teacherDetails?.subjects || []);
                          return displaySubjects.map(sub => ({ label: sub, value: sub }));
                        })()}
                        placeholder="-- Choose Subject --"
                        className="w-full"
                        buttonClassName="!rounded-2xl !py-5 !bg-gray-50 !border-none !text-lg !font-black !tracking-tight !text-[#1A1A1A] !uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block italic">Select Date</label>
                      <input 
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full rounded-2xl py-5 px-6 bg-gray-50 border-none text-lg font-black tracking-tight text-[#1A1A1A] uppercase focus:ring-2 focus:ring-[#FFD700] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block italic">Start Time</label>
                      <input 
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full rounded-2xl py-5 px-6 bg-gray-50 border-none text-lg font-black tracking-tight text-[#1A1A1A] uppercase focus:ring-2 focus:ring-[#FFD700] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block italic">End Time</label>
                      <input 
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full rounded-2xl py-5 px-6 bg-gray-50 border-none text-lg font-black tracking-tight text-[#1A1A1A] uppercase focus:ring-2 focus:ring-[#FFD700] outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleScheduleSession}
                    disabled={isScheduling || !scheduleClass || !scheduleSection || !scheduleSubject || !scheduleDate || !startTime || !endTime}
                    className="group relative w-full flex items-center justify-center bg-white border-2 border-gray-100 text-[#1A1A1A] hover:bg-gray-50 px-10 py-6 rounded-2xl font-black transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] text-sm overflow-hidden mt-4"
                  >
                    {isScheduling ? (
                      <Loader2 className="animate-spin mr-3" size={20} />
                    ) : (
                      <Calendar className="mr-3 text-[#FFD700]" size={20} />
                    )}
                    Schedule Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          {/* Active Session Display */}
          <div className="bg-[#1A1A1A] rounded-[2.5rem] shadow-2xl p-10 border border-white/5 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-[#FFD700] font-black uppercase tracking-[0.3em] text-[10px] italic">Live Instruction: {activeSession.subject}</span>
                </div>
                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                  {activeSession.classId?.className} {activeSession.section && `(Section ${activeSession.section})`}
                </h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 italic">Session Code: <span className="text-white font-black ml-1">{activeSession.sessionCode}</span></p>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 text-center">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">Presence Synced</p>
                  <p className="text-xl font-black text-white italic leading-none">{activeSession.attendanceCount || 0}</p>
                </div>
                <button 
                  onClick={() => handleEndClass(false)}
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
          <div className="bg-white rounded-[2.5rem] shadow-2xl border-4 border-[#1A1A1A] overflow-hidden relative">
            <div 
              ref={jitsiContainerRef}
              className="h-[650px] w-full bg-[#1A1A1A]"
            >
              {!jitsiData && (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="animate-spin text-[#FFD700]" size={40} />
                  <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">
                    {localStorage.getItem('teacher_session_active') === 'true' 
                      ? "Reconnecting to live classroom..." 
                      : "Securing meeting perimeter..."}
                  </p>
                </div>
              )}
            </div>
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
