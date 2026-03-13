import React from 'react';
import { Shield, Heart, Sparkles, Eye, Users, Lock, CheckCircle } from 'lucide-react';

interface ReadinessData {
  readinessScore: number;
  currentPhase: 'ai-only' | 'micro-therapy' | 'community-readonly' | 'full-access';
  sessionCount: number;
  therapyAdoptionCount: number;
  engagementDays: number;
  nextMilestone: string;
  progressToNext: number;
}

interface ReadinessMeterProps {
  readinessData: ReadinessData;
}

const ReadinessMeter: React.FC<ReadinessMeterProps> = ({ readinessData }) => {
  const phases = [
    { 
      id: 'ai-only', 
      name: 'Trust', 
      icon: Shield, 
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/50',
      description: 'Build safety with anonymous AI companion'
    },
    { 
      id: 'micro-therapy', 
      name: 'Stabilize', 
      icon: Heart, 
      color: 'from-cyan-400 to-orange-500',
      bgColor: 'bg-cyan-400/20',
      borderColor: 'border-cyan-400/50',
      description: 'Understand your needs through assessment'
    },
    { 
      id: 'community-readonly', 
      name: 'Observe', 
      icon: Eye, 
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/50',
      description: 'Explore community safely (read-only)'
    },
    { 
      id: 'full-access', 
      name: 'Support', 
      icon: Users, 
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/50',
      description: 'Participate with guided support'
    }
  ];

  const currentPhaseIndex = phases.findIndex(p => p.id === readinessData.currentPhase);
  const isPhaseComplete = (index: number) => index < currentPhaseIndex;
  const isCurrentPhase = (index: number) => index === currentPhaseIndex;

  return (
    <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl rounded-2xl p-8 border border-cyan-400/30 shadow-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Your Wellness Journey</h2>
            <p className="text-white/60">Progressive pathway to holistic support</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              {readinessData.readinessScore}%
            </div>
            <p className="text-white/60 text-sm">Journey Progress</p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 via-orange-500 to-green-500 transition-all duration-1000 ease-out rounded-full relative"
            style={{ width: `${readinessData.readinessScore}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Phase Staircase */}
      <div className="relative mb-8">
        <div className="flex items-end justify-between gap-4">
          {phases.map((phase, index) => {
            const Icon = phase.icon;
            const isComplete = isPhaseComplete(index);
            const isCurrent = isCurrentPhase(index);
            const isLocked = index > currentPhaseIndex;

            return (
              <div
                key={phase.id}
                className={`flex-1 relative transition-all duration-500 ${
                  isCurrent ? 'transform scale-105' : ''
                }`}
                style={{
                  height: `${(index + 1) * 80}px`
                }}
              >
                {/* Phase Card */}
                <div
                  className={`
                    absolute bottom-0 w-full p-4 rounded-xl border-2 transition-all
                    ${isComplete ? phase.bgColor + ' ' + phase.borderColor + ' opacity-70' : ''}
                    ${isCurrent ? phase.bgColor + ' ' + phase.borderColor + ' shadow-lg shadow-yellow-500/50' : 'bg-gray-800/50 border-gray-700 opacity-60'}
                  `}
                >
                  {/* Icon */}
                  <div className="flex items-center justify-center mb-2">
                    {isComplete ? (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    ) : (
                      <Icon className={`w-8 h-8 text-white ${isCurrent ? 'animate-pulse' : 'opacity-60'}`} />
                    )}
                  </div>

                  {/* Phase Name */}
                  <h3 className="text-center font-bold mb-1 text-white">
                    {phase.name}
                  </h3>

                  {/* Description (only for current phase) */}
                  {isCurrent && (
                    <p className="text-white/70 text-xs text-center">{phase.description}</p>
                  )}

                  {/* Step Number */}
                  <div className={`
                    absolute -top-3 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${isComplete ? 'bg-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-cyan-400 text-black' : 'bg-gray-700 text-gray-400'}
                  `}>
                    {index + 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Milestone */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-start space-x-4">
          <Sparkles className="w-6 h-6 text-cyan-300 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-2">Next Milestone</h3>
            <p className="text-white/80 mb-3">{readinessData.nextMilestone}</p>
            
            {/* Milestone Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Progress</span>
                <span className="text-cyan-300 font-semibold">
                  {Math.round(readinessData.progressToNext)}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(readinessData.progressToNext, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{readinessData.sessionCount}</div>
            <div className="text-xs text-white/60">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{readinessData.therapyAdoptionCount}</div>
            <div className="text-xs text-white/60">Therapies Tried</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{readinessData.engagementDays}</div>
            <div className="text-xs text-white/60">Active Days</div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default ReadinessMeter;
