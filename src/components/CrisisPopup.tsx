import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CrisisPopupProps {
  wellnessScore: number;
  isVisible: boolean;
  onClose: () => void;
}

const CrisisPopup: React.FC<CrisisPopupProps> = ({ wellnessScore, isVisible, onClose }) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (wellnessScore <= 40 && isVisible) {
      // Show popup after 2 seconds to not be too intrusive immediately
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowPopup(false);
    }
  }, [wellnessScore, isVisible]);

  const handleClose = () => {
    setShowPopup(false);
    onClose();
  };

  const handleChatClick = () => {
    navigate('/chat-with-serenity');
    handleClose();
  };

  if (!showPopup) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-fadeIn"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div 
          className="bg-gradient-to-br from-red-900/95 to-red-800/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-500/50 animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/30 rounded-full">
                <AlertCircle className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  We're Concerned About You
                </h2>
                <p className="text-red-200 text-sm">
                  Wellness Score: {wellnessScore}%
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 space-y-4">
            <p className="text-white/90 leading-relaxed">
              Your wellness score indicates you may be going through a difficult time. 
              <strong className="text-white"> You don't have to face this alone.</strong>
            </p>

            {/* Chat with AI Button */}
            <button
              onClick={handleChatClick}
              className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
            >
              <MessageCircle className="w-6 h-6" />
              <span>Talk to Serenity AI Now</span>
            </button>

            {/* Crisis Resources */}
            <div className="bg-black/30 rounded-xl p-4 space-y-3">
              <p className="text-white font-semibold text-sm flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Immediate Help Available 24/7:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center text-white/90">
                  <span>Crisis Helpline:</span>
                  <a 
                    href="tel:1-800-273-8255" 
                    className="font-bold text-cyan-300 hover:text-yellow-300"
                  >
                    1-800-273-8255
                  </a>
                </div>
                <div className="flex justify-between items-center text-white/90">
                  <span>Crisis Text Line:</span>
                  <span className="font-bold text-cyan-300">
                    Text HOME to 741741
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <a 
                    href="https://findahelpline.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-300 hover:text-yellow-300 text-xs underline"
                  >
                    International Crisis Lines →
                  </a>
                </div>
              </div>
            </div>

            {/* Emergency */}
            <p className="text-red-200 text-xs text-center">
              <strong>In immediate danger?</strong> Call <strong>911</strong> or go to your nearest emergency room.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </>
  );
};

export default CrisisPopup;
