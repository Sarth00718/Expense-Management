import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Loader from '../common/Loader';
import { exportReport } from '../../services/analyticsService';

const ExportModal = ({ isOpen, onClose }) => {
  const [format, setFormat] = useState('pdf');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare filters
      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (category) filters.category = category;
      if (status) filters.status = status;

      // Call export API
      const blob = await exportReport(format, filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expense-report-${Date.now()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Close modal after successful export
      setTimeout(() => {
        onClose();
        // Reset form
        setStartDate('');
        setEndDate('');
        setCategory('');
        setStatus('');
      }, 500);
    } catch (err) {
      console.error('Export error:', err);
      setError(err.response?.data?.error?.message || 'Failed to export report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Export Report">
      <div className="space-y-4">
        {/* Format Selection */}
        <div>
          <label className="block text-text-secondary text-sm mb-2">
            Export Format
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="pdf"
                checked={format === 'pdf'}
                onChange={(e) => setFormat(e.target.value)}
                className="w-4 h-4 text-accent focus:ring-accent"
                disabled={loading}
              />
              <span className="text-white">PDF</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="excel"
                checked={format === 'excel'}
                onChange={(e) => setFormat(e.target.value)}
                className="w-4 h-4 text-accent focus:ring-accent"
                disabled={loading}
              />
              <span className="text-white">Excel</span>
            </label>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-text-secondary text-sm mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-text-secondary text-sm mb-2">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-text-secondary text-sm mb-2">
            Category (Optional)
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 bg-secondary border border-accent/30 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
          >
            <option value="">All Categories</option>
            <option value="travel">Travel</option>
            <option value="food">Food</option>
            <option value="office_supplies">Office Supplies</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-text-secondary text-sm mb-2">
            Status (Optional)
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 bg-secondary border border-accent/30 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-error/10 border border-error rounded-lg">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader size="sm" />
                <span>Exporting...</span>
              </div>
            ) : (
              `Export ${format.toUpperCase()}`
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportModal;
