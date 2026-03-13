import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CriticalWellnessBannerProps {
  wellnessScore: number;
  onDismiss: () => void;
}

const CriticalWellnessBanner: React.FC<CriticalWellnessBannerProps> = ({ wellnessScore, onDismiss }) => {
  if (wellnessScore > 40) return null;

  return (
    <div className="fixed top-[64px] left-0 right-0 z-40 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse" />
          <div className="flex-1">
            <p className="font-semibold text-sm">
              ⚠️ Your wellness score is {wellnessScore}% - Please seek professional care immediately
            </p>
            <p className="text-xs opacity-90 mt-1">
              <strong>Crisis Helpline: 1-800-273-8255</strong> (24/7) • 
              <strong> Crisis Text: HOME to 741741</strong>
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="ml-4 p-1 hover:bg-white/20 rounded transition flex-shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CriticalWellnessBanner;
