import { useState, useMemo } from 'react';

/**
 * Custom hook for pagination
 * @param {Array} data - Array of items to paginate
 * @param {number} itemsPerPage - Number of items per page
 * @returns {Object} Pagination state and methods
 */
const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Get current page data
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  // Go to next page
  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Go to previous page
  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  // Go to specific page
  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  // Reset to first page
  const resetPage = () => {
    setCurrentPage(1);
  };

  // Check if has next/prev page
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return {
    currentPage,
    totalPages,
    currentData,
    nextPage,
    prevPage,
    goToPage,
    resetPage,
    hasNextPage,
    hasPrevPage,
    itemsPerPage,
    totalItems: data.length
  };
};

export default usePagination;
