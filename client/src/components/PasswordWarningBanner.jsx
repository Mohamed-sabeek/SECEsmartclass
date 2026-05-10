import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PasswordWarningBanner = ({ onActionClick }) => {
  const { mustChangePassword } = useAuth();

  if (!mustChangePassword) return null;

  return (
    <div className="mb-8 animate-in slide-in-from-top duration-500">
      <div className="bg-amber-50 border-2 border-amber-200 rounded-[2rem] p-6 shadow-sm relative overflow-hidden group">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -mr-16 -mt-16 group-hover:bg-amber-200/30 transition-colors duration-500"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner group-hover:rotate-12 transition-transform duration-500">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h4 className="text-lg font-black text-amber-900 tracking-tight leading-none mb-1 uppercase italic">Security Alert</h4>
              <p className="text-amber-700/80 text-sm font-medium italic">
                You are currently using the default password. Please update your password to secure your account.
              </p>
            </div>
          </div>
          
          <button 
            onClick={onActionClick}
            className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-amber-900/10 active:scale-95 group/btn"
          >
            <span>Update Now</span>
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordWarningBanner;
