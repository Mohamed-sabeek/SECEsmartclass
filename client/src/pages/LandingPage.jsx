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
  Award
} from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FeatureCard from '../components/FeatureCard';

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
  const features = [
    {
      icon: CheckCircle,
      title: 'Smart Attendance Tracking',
      description: 'Automated attendance system with real-time tracking and instant notifications.'
    },
    {
      icon: Users,
      title: 'Live Class Monitoring',
      description: 'Monitor active classes, student participation, and engagement in real-time.'
    },
    {
      icon: Brain,
      title: 'AI Insights & Reports',
      description: 'Get intelligent insights and predictive analytics powered by AI.'
    },
    {
      icon: Shield,
      title: 'Role-Based Dashboards',
      description: 'Customized dashboards for admins, teachers, and students with secure access.'
    },
    {
      icon: Video,
      title: 'Zoom Integration',
      description: 'Seamlessly integrate with Zoom for virtual class attendance tracking.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Charts',
      description: 'Comprehensive analytics with beautiful charts and exportable reports.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Admin Setup',
      description: 'Configure your institution, add departments, and manage users effortlessly.'
    },
    {
      number: '02',
      title: 'Teacher Starts Class',
      description: 'Teachers create classes, generate attendance codes, and monitor participation.'
    },
    {
      number: '03',
      title: 'Students Join & Track',
      description: 'Students mark attendance with unique codes and track their progress.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-[#1A1A1A] mb-6 leading-tight">
                Smart Attendance. <br />
                <span className="text-[#FFD700]">Powerful Insights.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Track, analyze, and optimize classroom attendance with AI-powered analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-[#FFD700] hover:bg-[#FFED4E] text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center">
                  Get Started
                  <ArrowRight className="ml-2" size={20} />
                </button>
                <button className="border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300">
                  View Demo
                </button>
              </div>
            </div>
            <div className="bg-[#F5F5F5] rounded-2xl p-8 h-96 flex items-center justify-center shadow-lg">
              <div className="text-center">
                <BarChart3 className="text-[#FFD700] mx-auto mb-4" size={64} />
                <p className="text-gray-600 font-semibold">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed for modern classrooms
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#FFD700] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold text-[#1A1A1A] mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-16 px-6 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">
              Real-Time Dashboard
            </h2>
            <p className="text-xl text-gray-600">
              Monitor everything at a glance
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <TrendingUp className="text-[#FFD700] mb-4" size={32} />
              <h3 className="text-3xl font-bold text-[#1A1A1A] mb-2">94.5%</h3>
              <p className="text-gray-600">Average Attendance</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <Clock className="text-[#FFD700] mb-4" size={32} />
              <h3 className="text-3xl font-bold text-[#1A1A1A] mb-2">24/7</h3>
              <p className="text-gray-600">Real-Time Tracking</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <Award className="text-[#FFD700] mb-4" size={32} />
              <h3 className="text-3xl font-bold text-[#1A1A1A] mb-2">1,200+</h3>
              <p className="text-gray-600">Active Students</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Insights Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-[#FFD700] to-[#FFED4E]">
        <div className="max-w-7xl mx-auto text-center">
          <Brain className="text-white mx-auto mb-6" size={64} />
          <h2 className="text-4xl font-bold text-white mb-4">
            AI-Powered Insights
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Leverage artificial intelligence to predict attendance patterns, identify at-risk students, and optimize classroom engagement.
          </p>
          <button className="bg-white text-[#FFD700] hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-all duration-300">
            Explore AI Features
          </button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6">
            Start building smarter classrooms today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of institutions transforming their attendance management
          </p>
          <button className="bg-[#FFD700] hover:bg-[#FFED4E] text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-300 inline-flex items-center">
            Get Started Now
            <ArrowRight className="ml-2" size={20} />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
