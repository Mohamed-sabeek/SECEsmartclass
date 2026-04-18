import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between px-10 py-6 border-t border-gray-50 bg-gray-50/20">
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold text-gray-500">
          Page <span className="text-[#1A1A1A]">{currentPage}</span> of <span className="text-[#1A1A1A]">{totalPages}</span>
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-100 bg-white text-gray-500 hover:text-[#FFD700] hover:border-[#FFD700] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex items-center gap-1">
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm transition-all shadow-sm ${
                currentPage === page
                  ? 'bg-[#1A1A1A] text-[#FFD700] border-[#1A1A1A]'
                  : 'bg-white text-gray-400 border border-gray-100 hover:border-[#FFD700] hover:text-[#FFD700]'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-100 bg-white text-gray-500 hover:text-[#FFD700] hover:border-[#FFD700] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
