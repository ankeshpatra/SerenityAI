import React, { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface AgeVerificationModalProps {
  onVerify: (isVerified: boolean) => void;
}

const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ onVerify }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isMinor, setIsMinor] = useState(false);
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianConsent, setGuardianConsent] = useState(false);

  const handleVerify = () => {
    if (isChecked) {
      localStorage.setItem('age_verified', 'true');
      if (isMinor) {
        localStorage.setItem('guardian_email', guardianEmail);
        localStorage.setItem('guardian_consent', 'true');
      }
      onVerify(true);
    }
  };

  const handleDecline = () => {
    onVerify(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/95 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-8 relative">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-cyan-400/20 p-4 rounded-full">
            <AlertTriangle className="w-12 h-12 text-cyan-300" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Age Verification Required
        </h2>

        {/* Content */}
        <div className="space-y-4 text-white/90 text-sm leading-relaxed mb-6">
          <p>
            Serenity AI provides mental wellness support and resources. To ensure appropriate care and legal compliance, you must be <strong className="text-cyan-300">18 years or older</strong> to use this platform.
          </p>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 font-semibold mb-2">⚠️ Important Disclaimer:</p>
            <ul className="space-y-2 text-white/80 text-xs">
              <li>• Serenity AI is <strong>not a substitute</strong> for professional medical or mental health care</li>
              <li>• This platform provides <strong>wellness support</strong>, not medical diagnosis or treatment</li>
              <li>• If you're experiencing a mental health crisis, please contact emergency services or a crisis hotline immediately</li>
            </ul>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-blue-400 text-xs">
              <strong>Crisis Resources Available 24/7:</strong><br />
              National Crisis Helpline: <strong>1-800-273-8255</strong><br />
              Crisis Text Line: Text <strong>HOME</strong> to <strong>741741</strong>
            </p>
          </div>
        </div>

        {/* Checkbox */}
        <label className="flex items-start space-x-3 mb-6 cursor-pointer group">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-2 border-white/30 bg-white/10 checked:bg-cyan-400 checked:border-cyan-400 focus:ring-2 focus:ring-yellow-500/50 cursor-pointer"
          />
          <span className="text-white/90 text-sm group-hover:text-white transition-colors">
            I confirm that I am <strong className="text-cyan-300">18 years or older</strong> and understand that Serenity AI is not a substitute for professional medical care.
          </span>
        </label>

        {/* Guardian Consent Section (if under 18) */}
        {isMinor && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <p className="text-white font-semibold mb-3 text-sm">Guardian Consent Required</p>
            <div className="space-y-3">
              <div>
                <label className="text-white/70 text-xs mb-1 block">Guardian Email Address</label>
                <input
                  type="email"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  placeholder="guardian@example.com"
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={guardianConsent}
                  onChange={(e) => setGuardianConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-2 border-white/30 bg-white/10 checked:bg-cyan-400 checked:border-cyan-400 cursor-pointer"
                />
                <span className="text-white/80 text-xs group-hover:text-white transition-colors">
                  My parent/guardian has reviewed and consents to my use of Serenity AI
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsMinor(true)}
            className="flex-1 bg-white/10 text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all font-semibold border border-white/20"
          >
            I'm Under 18
          </button>
          <button
            onClick={handleVerify}
            disabled={!isChecked || (isMinor && (!guardianEmail || !guardianConsent))}
            className={`flex-1 px-6 py-3 rounded-full transition-all font-semibold flex items-center justify-center space-x-2 ${
              isChecked && (!isMinor || (guardianEmail && guardianConsent))
                ? 'bg-cyan-400 text-black hover:bg-cyan-300 cursor-pointer'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Continue</span>
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-white/50 text-xs text-center mt-6">
          By continuing, you agree to our Terms of Service and acknowledge our Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default AgeVerificationModal;
