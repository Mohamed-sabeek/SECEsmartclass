import { useState, useEffect } from 'react';
import { 
  LogIn, 
  Mail, 
  Lock, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  Radio, 
  BarChart3, 
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import seceLogo from '../assets/sece-logo.webp';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in or handle expiry message
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reason') === 'expired') {
      setError('Your session has expired. Please login again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (isAuthenticated && role) {
      const routes = { admin: '/admin', teacher: '/teacher', student: '/student' };
      if (routes[role]) navigate(routes[role], { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email.trim()) return setError('Please enter your email address.');
    if (!formData.password) return setError('Please enter your password.');

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email: formData.email.trim(),
        password: formData.password
      });

      const { token, user } = response.data;
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      login(token, user);

      const routes = { admin: '/admin', teacher: '/teacher', student: '/student' };
      if (routes[user.role]) {
        navigate(routes[user.role], { replace: true });
      } else {
        setError('You do not have permission to access this portal.');
      }
    } catch (err) {
      if (!err.response) {
        setError('Unable to connect to server. Please check your connection.');
      } else if (err.response.status === 401) {
        setError(err.response.data.message || 'Incorrect email or password.');
      } else {
        setError(err.response.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const features = [
    { icon: CheckCircle, text: 'Smart Attendance' },
    { icon: Radio, text: 'Live Classrooms' },
    { icon: BarChart3, text: 'Engagement Analytics' },
    { icon: ShieldCheck, text: 'Academic Reports' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden font-sans">
      {/* Background Decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FFD700]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1A1A1A]/5 blur-[100px] rounded-full"></div>
      </div>

      {/* LEFT SIDE: Branding & Visuals (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1A1A1A] relative items-center justify-center p-16 overflow-hidden">
        {/* Animated Shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 border-2 border-[#FFD700] rounded-full animate-pulse"></div>
           <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border-2 border-[#FFD700] rounded-full animate-bounce duration-[5000ms]"></div>
        </div>

        <div className="relative z-10 max-w-xl">
           <div className="inline-flex items-center space-x-3 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-8 animate-in slide-in-from-top duration-700">
              <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse"></span>
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Institutional Node Active</span>
           </div>

           <h1 className="text-6xl font-black text-white leading-none tracking-tighter italic mb-8 animate-in slide-in-from-left duration-700">
             NEXT GEN <br />
             <span className="text-[#FFD700]">SMART CLASS</span> <br />
             ORCHESTRATION.
           </h1>

           <p className="text-gray-400 text-lg font-medium italic mb-12 animate-in slide-in-from-left duration-1000 delay-200">
             The most advanced academic tracking and real-time attendance ecosystem for SECE students and faculty.
           </p>

           <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-1000 delay-500">
              {features.map((item, i) => (
                <div key={i} className="flex items-center space-x-3 group">
                   <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#FFD700] border border-white/10 group-hover:bg-[#FFD700] group-hover:text-[#1A1A1A] transition-all duration-500">
                      <item.icon size={20} />
                   </div>
                   <span className="text-sm font-black text-white/80 uppercase tracking-widest">{item.text}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Decorative Grid */}
        <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
      </div>

      {/* RIGHT SIDE: Authentication Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="max-w-md w-full animate-in zoom-in-95 duration-700">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center space-x-2 text-gray-400 hover:text-[#1A1A1A] mb-12 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:-translate-x-1 transition-transform border border-gray-100">
               <ChevronLeft size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Back to portal</span>
          </button>

          <div className="mb-12 flex flex-col items-center text-center">
            <img 
              src={seceLogo} 
              alt="SECE Logo" 
              className="h-24 w-auto mb-8 object-contain drop-shadow-xl mx-auto" 
            />
            <h2 className="text-4xl font-black text-[#1A1A1A] tracking-tighter mb-2">
              Identity <span className="text-[#FFD700]">Verification</span>
            </h2>
            <p className="text-gray-400 font-medium italic">Sign in to access your digital academic environment</p>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/50 border border-white relative overflow-hidden">
            {/* Form Glass Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>

            {/* Error Message */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center animate-in shake duration-500">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <AlertCircle className="text-red-600" size={20} />
                </div>
                <p className="text-[10px] font-black text-red-700 uppercase tracking-tight leading-tight">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Authorized Email</label>
                <div className="relative group/field">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-[#FFD700] transition-colors" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all duration-300 font-bold text-sm text-[#1A1A1A] placeholder:text-gray-300 disabled:opacity-50"
                    placeholder="student@sece.ac.in"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Security Credentials</label>
                <div className="relative group/field">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-[#FFD700] transition-colors" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all duration-300 font-bold text-sm text-[#1A1A1A] placeholder:text-gray-300 disabled:opacity-50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-all duration-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-[#1A1A1A] hover:bg-[#FFD700] text-white hover:text-[#1A1A1A] py-5 rounded-2xl font-black transition-all duration-500 shadow-xl shadow-gray-200 hover:shadow-yellow-500/20 active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed uppercase tracking-[0.2em] text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 animate-spin" size={18} />
                    Securing Identity...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-3" size={18} />
                    Sign In to Portal
                  </>
                )}
              </button>
            </form>
          </div>


        </div>
      </div>
    </div>
  );
};

export default LoginPage;
