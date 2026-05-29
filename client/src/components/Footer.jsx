import { Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1A1A1A] text-white py-16 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-black text-white mb-4 tracking-tighter leading-none">
              SECE <span className="text-[#FFD700]">SmartClass</span>
            </h3>
            <p className="text-gray-400 font-medium leading-relaxed max-w-sm text-sm">
              The next generation of academic orchestration and real-time institutional analytics. Designed to elevate campus productivity.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-bold mb-5 text-[#FFD700] uppercase tracking-widest text-xs">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#features" className="text-gray-400 hover:text-[#FFD700] font-medium transition-all duration-300">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-gray-400 hover:text-[#FFD700] font-medium transition-all duration-300">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold mb-5 text-[#FFD700] uppercase tracking-widest text-xs">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-[#FFD700] font-medium transition-all duration-300">
                  About Us
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-400 hover:text-[#FFD700] font-medium transition-all duration-300">
                  Login Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div id="support" className="scroll-mt-10">
            <h4 className="font-bold mb-5 text-[#FFD700] uppercase tracking-widest text-xs">Support</h4>
            <p className="text-gray-400 text-xs leading-relaxed mb-4 font-medium">
              For technical issues, account access problems, or classroom assistance, contact our support desk directly.
            </p>
            <div className="flex items-center gap-2 group/email">
              <Mail className="text-[#FFD700] shrink-0 transition-transform duration-300 group-hover/email:scale-110" size={16} />
              <a 
                href="mailto:safeeofficial1730@gmail.com" 
                className="text-white hover:text-[#FFD700] text-xs font-bold transition-all duration-300 border-b border-dashed border-gray-700 hover:border-[#FFD700] tracking-wide"
              >
                safeeofficial1730@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800/60 mt-12 pt-8 text-center text-gray-400 text-xs font-medium tracking-wider">
          <p>&copy; {new Date().getFullYear()} SECE SmartClass. All academic records are institutional property.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
