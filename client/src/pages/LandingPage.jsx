import { 
  CheckCircle, 
  Users, 
  BarChart3, 
  Brain, 
  Video, 
  Shield,
  ArrowRight,
  TrendingUp,
  Clock,
  Award,
  UserCheck,
  BarChart
} from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'teacher') {
        navigate('/teacher', { replace: true });
      } else if (role === 'student') {
        navigate('/student', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);
  const roles = [
    {
      title: 'For Students',
      icon: Users,
      features: [
        'View attendance percentage in real-time',
        'Track complete class & subject history',
        'Get instant alerts for low attendance'
      ],
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'For Teachers',
      icon: CheckCircle,
      features: [
        'Mark attendance easily with one click',
        'Generate automated class & batch reports',
        'Quickly identify defaulters and low engagement'
      ],
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'For Admin',
      icon: Shield,
      features: [
        'Manage departments, users and classes',
        'Monitor overall institutional performance',
        'Assign teachers and manage batch schedules'
      ],
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Teacher Starts Class',
      icon: UserCheck,
      description: 'Create and start a live session for your assigned students.'
    },
    {
      number: '02',
      title: 'Students Join Instantly',
      icon: Users,
      description: 'Students join via portal and attendance is tracked automatically.'
    },
    {
      number: '03',
      title: 'Attendance Captured',
      icon: CheckCircle,
      description: 'Presence is recorded securely in real-time in our database.'
    },
    {
      number: '04',
      title: 'Insights & Reports',
      icon: BarChart,
      description: 'View attendance percentage, trends, and defaulter alerts.'
    }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden">

        <div className="max-w-7xl mx-auto relative z-10 text-center flex flex-col items-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-black text-[#1A1A1A] mb-10 leading-[1.1] tracking-tight">
              Smart Classroom <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500]">
                Management for SECE
              </span>
            </h1>
            <p className="text-xl md:text-3xl text-gray-500 mb-12 leading-relaxed font-medium max-w-2xl mx-auto">
              Track attendance, monitor performance, and manage classes efficiently—built specifically for Students, Teachers, and Admins.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => navigate('/login')}
                className="bg-[#1A1A1A] hover:bg-[#FFD700] text-white hover:text-[#1A1A1A] px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95"
              >
                Login to Dashboard
                <ArrowRight className="ml-2" size={28} />
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="bg-white border-2 border-gray-100 text-[#1A1A1A] hover:border-[#FFD700] px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg hover:scale-105 active:scale-95"
              >
                Explore Features
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 px-6 bg-[#FBFBFB] border-y border-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-[#FFD700] font-black tracking-[0.2em] uppercase text-sm mb-4 block">
              Roles & Capabilities
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-6 tracking-tight">
              Built for Every User
            </h2>
            <div className="w-20 h-1.5 bg-[#FFD700] mx-auto rounded-full mb-8"></div>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Tailored dashboards and tools designed specifically for students, faculty, and administration.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((roleItem, index) => (
              <div key={index} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                <div className={`w-16 h-16 ${roleItem.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  <roleItem.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-[#1A1A1A] mb-6 tracking-tight">{roleItem.title}</h3>
                <ul className="space-y-4">
                  {roleItem.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-500 font-medium leading-relaxed">
                      <CheckCircle className="text-green-500 mt-1 shrink-0" size={18} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 md:py-32 px-6 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-24">
            <span className="text-[#FFD700] font-black tracking-[0.2em] uppercase text-sm mb-4 block">
              Workflow
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-6 tracking-tight">
              Classroom Flow
            </h2>
            <div className="w-20 h-1.5 bg-[#FFD700] mx-auto rounded-full mb-8"></div>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Our seamless orchestration ensures that attendance is the least of your worries.
            </p>
          </div>

          {/* Timeline Container */}
          <div className="relative">
            {/* Desktop Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0">
              <div className="w-full h-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] opacity-20"></div>
            </div>

            {/* Mobile Connecting Line */}
            <div className="md:hidden absolute left-8 top-0 h-full w-1 bg-gray-100 z-0">
              <div className="h-full w-full bg-gradient-to-b from-[#FFD700] to-[#FFA500] opacity-20"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
              {steps.map((step, index) => (
                <div key={index} className="group">
                  <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative h-full">
                    {/* Step Number Circle */}
                    <div className="absolute -top-6 left-8 w-12 h-12 bg-[#1A1A1A] text-[#FFD700] rounded-2xl flex items-center justify-center text-xl font-black shadow-xl group-hover:bg-[#FFD700] group-hover:text-[#1A1A1A] transition-colors duration-300">
                      {step.number}
                    </div>

                    <div className="mt-4 mb-6 w-16 h-16 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <step.icon className="text-[#FFD700]" size={32} />
                    </div>

                    <h3 className="text-xl font-black text-[#1A1A1A] mb-4 tracking-tight leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-gray-500 font-medium leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-[#1A1A1A] mb-6 tracking-tighter leading-tight">
            Track Attendance. <br />
            <span className="text-[#FFD700]">Stay Above 75%.</span>
          </h2>
          <p className="text-xl text-gray-600 mt-4 mb-10 font-medium leading-relaxed max-w-2xl mx-auto">
            SECE SmartClass helps students and teachers track attendance, manage classes, and monitor performance easily.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-[#1A1A1A] hover:bg-[#FFD700] text-white hover:text-[#1A1A1A] px-12 py-5 rounded-2xl font-black text-xl transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 flex items-center mx-auto"
          >
            Login to Dashboard
            <ArrowRight className="ml-3" size={28} />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
