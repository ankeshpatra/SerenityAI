import React, { useState } from 'react';
import { Flag, X, AlertTriangle, CheckCircle } from 'lucide-react';

interface ReportModalProps {
  contentId: string;
  contentType: 'post' | 'comment' | 'user';
  onClose: () => void;
  onSubmit: (report: ReportData) => void;
}

export interface ReportData {
  contentId: string;
  contentType: string;
  reason: string;
  details: string;
  timestamp: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ contentId, contentType, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reportReasons = [
    'Harassment or Bullying',
    'Hate Speech',
    'Self-Harm Content',
    'Spam or Scam',
    'Medical Misinformation',
    'Inappropriate Content',
    'Impersonation',
    'Other'
  ];

  const handleSubmit = () => {
    if (!reason) return;

    const report: ReportData = {
      contentId,
      contentType,
      reason,
      details,
      timestamp: new Date().toISOString()
    };

    // Save to localStorage (in production, this would be an API call)
    const reports = JSON.parse(localStorage.getItem('community_reports') || '[]');
    reports.push(report);
    localStorage.setItem('community_reports', JSON.stringify(reports));

    onSubmit(report);
    setSubmitted(true);

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800/95 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-500/20 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Report Submitted</h2>
          <p className="text-white/70">
            Thank you for helping keep our community safe. We'll review this report within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/95 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-red-500/20 p-3 rounded-full">
            <Flag className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Report Content</h2>
            <p className="text-white/60 text-sm">Help us keep the community safe</p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-cyan-400/10 border border-cyan-400/30 rounded-lg p-3 mb-6 flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-cyan-300 flex-shrink-0 mt-0.5" />
          <p className="text-white/80 text-sm">
            False reports may result in action against your account. Please report responsibly.
          </p>
        </div>

        {/* Reason Selection */}
        <div className="mb-6">
          <label className="text-white font-semibold mb-3 block">
            Why are you reporting this {contentType}?
          </label>
          <div className="space-y-2">
            {reportReasons.map((reasonOption) => (
              <label
                key={reasonOption}
                className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 p-3 rounded-lg cursor-pointer border border-white/10 hover:border-cyan-300/50 transition-all"
              >
                <input
                  type="radio"
                  name="reason"
                  value={reasonOption}
                  checked={reason === reasonOption}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-4 h-4 text-cyan-400 focus:ring-yellow-500"
                />
                <span className="text-white/90">{reasonOption}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Details */}
        <div className="mb-6">
          <label className="text-white font-semibold mb-2 block">
            Additional Details (Optional)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Provide any additional context that might help our review..."
            className="w-full h-24 bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-300 resize-none"
            maxLength={500}
          />
          <p className="text-white/40 text-xs mt-1">{details.length}/500 characters</p>
        </div>

        {/* Privacy Note */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-6">
          <p className="text-blue-400 text-sm">
            🔒 <strong>Your report is anonymous.</strong> The user will not know who reported them.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason}
            className={`flex-1 px-6 py-3 rounded-full transition-all font-semibold ${
              reason
                ? 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
