import React from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
  totalItems,
  itemsPerPage
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add pages around current
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4">
      {/* Items info */}
      <div className="text-sm text-[#B0BEC5]">
        Showing <span className="text-white font-semibold">{startItem}</span> to{' '}
        <span className="text-white font-semibold">{endItem}</span> of{' '}
        <span className="text-white font-semibold">{totalItems}</span> items
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className={`
            px-3 py-2 rounded-lg border transition-all duration-300
            ${hasPrevPage
              ? 'border-[#00D9FF]/30 text-[#00D9FF] hover:bg-[#00D9FF]/10 hover:border-[#00D9FF]'
              : 'border-[#1E3A5F] text-[#B0BEC5]/50 cursor-not-allowed'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-[#B0BEC5]">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`
                  px-4 py-2 rounded-lg border transition-all duration-300 min-w-[40px]
                  ${page === currentPage
                    ? 'bg-gradient-to-r from-[#00D9FF] to-[#7B61FF] border-transparent text-white font-semibold shadow-lg shadow-[#00D9FF]/30'
                    : 'border-[#1E3A5F] text-[#B0BEC5] hover:border-[#00D9FF] hover:text-[#00D9FF]'
                  }
                `}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className={`
            px-3 py-2 rounded-lg border transition-all duration-300
            ${hasNextPage
              ? 'border-[#00D9FF]/30 text-[#00D9FF] hover:bg-[#00D9FF]/10 hover:border-[#00D9FF]'
              : 'border-[#1E3A5F] text-[#B0BEC5]/50 cursor-not-allowed'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
