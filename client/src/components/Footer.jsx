const Footer = () => {
  return (
    <footer className="bg-[#1A1A1A] text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-black text-white mb-4 tracking-tighter leading-none">
              SECE <span className="text-[#FFD700]">SmartClass</span>
            </h3>
            <p className="text-gray-400 font-medium leading-relaxed max-w-sm">
              The next generation of academic orchestration and real-time institutional analytics.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-gray-400 hover:text-[#FFD700] transition-all duration-300">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-gray-400 hover:text-[#FFD700] transition-all duration-300">
                  How It Works
                </a>
              </li>

            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-[#FFD700] transition-all duration-300">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#FFD700] transition-all duration-300">
                  Contact
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-400 hover:text-[#FFD700] transition-all duration-300">
                  Login
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 SECE SmartClass. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
