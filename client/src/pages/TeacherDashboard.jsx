import { useState, useEffect } from 'react';
import { 
  LogOut, 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  ClipboardCheck, 
  History, 
  Menu, 
  X,
  Users,
  Calendar,
  User as UserIcon,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

// Sub-components (will be moved to separate files later if needed)
import TeacherDashboardHome from '../components/TeacherDashboardHome';
import TeacherClasses from '../components/TeacherClasses';
import TeacherLiveSession from '../components/TeacherLiveSession';
import TeacherAttendance from '../components/TeacherAttendance';
import TeacherHistory from '../components/TeacherHistory';
import TeacherBatchRoster from '../components/TeacherBatchRoster';
import TeacherSessionDetails from '../components/TeacherSessionDetails';
import TeacherSessionReport from '../components/TeacherSessionReport';
import TeacherProfile from './teacher/TeacherProfile';
import { useParams, useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const { logout, user } = useAuth();
  const { tab, classId, sessionId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tab || 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'classes', label: 'My Classes', icon: BookOpen },
    { id: 'live', label: 'Live Session', icon: Video },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'history', label: 'Reports', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: UserIcon }
  ];

  const [preSelectedClassId, setPreSelectedClassId] = useState(null);
  const [preSelectedSubject, setPreSelectedSubject] = useState('');

  useEffect(() => {
    fetchProfile();
    
    // Sync state if tab param changes
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
    
    // Listen for tab switch events
    const handleSwitchTab = (e) => {
      const { tab: newTab, classId, subject } = e.detail;
      setActiveTab(newTab);
      if (classId) setPreSelectedClassId(classId);
      if (subject) setPreSelectedSubject(subject);
      
      // Update URL
      navigate(`/teacher/${newTab}`);
    };

    window.addEventListener('switchTab', handleSwitchTab);
    return () => window.removeEventListener('switchTab', handleSwitchTab);
  }, [tab]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Teacher Profile Data:", response.data.data);
      console.log("Assigned Classes:", response.data.data.assignedClasses);
      setTeacherData(response.data.data);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (classId) {
      return <TeacherBatchRoster />;
    }

    if (sessionId && sessionId !== 'undefined') {
      // Check if we are on the reports route
      if (window.location.pathname.includes('/reports/')) {
        return <TeacherSessionReport />;
      }
      return <TeacherSessionDetails />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <TeacherDashboardHome teacher={teacherData} setActiveTab={setActiveTab} />;
      case 'classes':
        return <TeacherClasses teacher={teacherData} assignedClasses={teacherData?.assignedClasses} />;
      case 'live':
        return <TeacherLiveSession 
          teacher={teacherData} 
          preSelectedClassId={preSelectedClassId}
          preSelectedSubject={preSelectedSubject}
        />;
      case 'attendance':
        return <TeacherAttendance teacher={teacherData} />;
      case 'history':
        return <TeacherHistory teacher={teacherData} />;
      case 'profile':
        return <TeacherProfile />;
      default:
        return <TeacherDashboardHome teacher={teacherData} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="h-screen bg-[#F5F5F5] flex overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:relative flex flex-col w-72 h-screen bg-white shadow-2xl z-50 transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-8 border-b border-gray-50 bg-gray-50/20">
          <div className="flex items-center mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#FFB700] rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20 rotate-3">
              <span className="text-white text-2xl font-black">S</span>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-black text-[#1A1A1A] tracking-tighter leading-none">
                SECE <span className="text-[#FFD700]">Teacher</span>
              </h1>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Smart Portal</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.path) {
                  navigate(item.path);
                } else {
                  setActiveTab(item.id);
                  navigate(`/teacher/${item.id}`);
                }
                setSidebarOpen(false);
              }}
              className={`w-full group flex items-center px-6 py-4 rounded-[1.5rem] transition-all duration-500 relative overflow-hidden ${
                activeTab === item.id 
                  ? 'bg-[#1A1A1A] text-white shadow-xl shadow-gray-200' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#1A1A1A]'
              }`}
            >
              {activeTab === item.id && (
                <div className="absolute left-0 top-0 w-1 h-full bg-[#FFD700] shadow-[4px_0_15px_rgba(255,215,0,0.5)]"></div>
              )}
              <item.icon className={`mr-4 transition-transform duration-500 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} size={22} />
              <span className="font-bold text-sm tracking-normal uppercase">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <button
            onClick={logout}
            className="w-full group flex items-center px-6 py-4 rounded-[1.5rem] bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-all duration-500 shadow-sm hover:shadow-red-200 font-black active:scale-95"
          >
            <LogOut size={20} className="mr-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm uppercase tracking-tight">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4 p-2 hover:bg-gray-50 rounded-xl transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} className="text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-[#FFD700]"></div>
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest italic">
                {menuItems.find(i => i.id === activeTab)?.label}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="w-px h-8 bg-gray-100 hidden sm:block"></div>
            <div className="flex items-center space-x-3">
               <Calendar size={18} className="text-[#FFD700]" />
               <span className="text-xs font-black text-[#1A1A1A] uppercase">
                 {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
               </span>
            </div>
          </div>
        </header>

        {/* Dynamic Sub-page Container */}
        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
