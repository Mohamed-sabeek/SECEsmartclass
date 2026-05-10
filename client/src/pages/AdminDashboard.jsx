import { LogOut, LayoutDashboard, Building2, Users, GraduationCap, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import AdminDashboardHome from '../components/AdminDashboardHome';
import AdminDepartments from '../components/AdminDepartments';
import AdminTeachers from '../components/AdminTeachers';
import AdminStudents from '../components/AdminStudents';
import AdminClasses from '../components/AdminClasses';
import AdminAssignTeacher from '../components/AdminAssignTeacher';
import { LayoutGrid, ClipboardCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams();
  const [activeTab, setActiveTab] = useState(tab || 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'teachers', label: 'Teachers', icon: Users },
    { id: 'classes', label: 'Classes', icon: LayoutGrid },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'assign-teachers', label: 'Assign Teachers', icon: ClipboardCheck },
  ];

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardHome />;
      case 'departments':
        return <AdminDepartments />;
      case 'teachers':
        return <AdminTeachers />;
      case 'classes':
        return <AdminClasses />;
      case 'students':
        return <AdminStudents />;
      case 'assign-teachers':
        return <AdminAssignTeacher />;
      default:
        return <AdminDashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans">
      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 fixed top-0 left-0 right-0 z-50 h-20 flex items-center shadow-sm">
        <div className="w-full px-8 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden mr-6 p-2 rounded-xl bg-gray-50 text-gray-600 hover:text-[#FFD700] transition-all"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-tr from-[#FFD700] to-[#FFED4E] rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-yellow-800/10 group-hover:rotate-12 transition-transform duration-500">
                <LayoutDashboard className="text-[#1A1A1A]" size={22} />
              </div>
              <h1 className="text-2xl font-black tracking-tight">
                SECE <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFD700] to-[#FFED4E] font-black">SmartClass</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-bold opacity-80 uppercase tracking-widest text-[10px]">Administrator</span>
              <span className="text-sm font-black">Super Control</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center border-2 border-white shadow-inner">
              <Users size={24} className="text-gray-400" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-20">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/50 backdrop-blur-2xl border-r border-gray-100 transform transition-all duration-500 ease-in-out mt-20 h-[calc(100vh-5rem)] flex flex-col p-6 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="mb-8 px-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      navigate(`/admin/${item.id}`);
                      setSidebarOpen(false);
                    }}
                    className={`w-full group flex items-center px-5 py-4 rounded-[1.25rem] transition-all duration-500 relative overflow-hidden ${
                      isActive
                        ? 'bg-[#1A1A1A] text-white shadow-xl shadow-gray-200'
                        : 'text-gray-500 hover:text-[#FFD700] hover:bg-yellow-50/50'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFD700]"></div>
                    )}
                    <Icon 
                      size={20} 
                      className={`mr-4 transition-transform duration-500 ${isActive ? 'scale-110 text-[#FFD700]' : 'group-hover:scale-110'}`} 
                    />
                    <span className="font-bold tracking-tight">{item.label}</span>
                    {!isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-[#FFD700] transition-colors"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto px-2">
            <button
              onClick={logout}
              className="w-full group flex items-center px-6 py-5 rounded-[1.5rem] bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-all duration-500 shadow-sm hover:shadow-red-200 font-black tracking-normal active:scale-95"
            >
              <LogOut size={22} className="mr-4 group-hover:-translate-x-1 transition-transform" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-[#1A1A1A]/20 backdrop-blur-sm z-30 lg:hidden mt-20"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 p-8 lg:p-12 min-h-[calc(100vh-5rem)]">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
