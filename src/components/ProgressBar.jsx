import { motion } from 'framer-motion';
import { STAGES } from '../data/brandData';
import { useBrand } from '../context/BrandContext';

const STAGE_NAMES = [
  'Candidate Basics',
  'Candidate Profile',
  'Brand Core',
  'Brand Direction',
  'Color Palette',
  'Font Selection',
  'Visual Identity',
  'Logo Type',
  'Collateral',
  'Review',
];

export default function ProgressBar() {
  const { state, goToStage, getActiveColors } = useBrand();
  const { currentStage, completedStages } = state;
  const totalStages = STAGES.length;
  const progress = ((currentStage + 1) / totalStages) * 100;
  const displayNames = STAGE_NAMES.slice(0, totalStages);

  // Dynamic color based on user's selected palette
  const activeColors = getActiveColors();
  const barColor = (state.colorMode || state.brandCore) ? activeColors.primary : '#8B1A2B';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 no-print bg-white" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      {/* Main progress bar - taller and more prominent */}
      <div className="h-2 bg-[#E5E7EB] w-full relative overflow-hidden">
        <motion.div
          className="h-full"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          style={{ backgroundColor: barColor }}
        />
        {/* Animated shimmer effect on the bar */}
        <motion.div
          className="absolute top-0 h-full"
          style={{
            width: '80px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          }}
          animate={{ left: ['-80px', '100%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
        />
      </div>

      {/* Step info bar */}
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-3">
            {/* Step counter badge */}
            <span
              className="inline-flex items-center justify-center text-xs font-bold text-white rounded-full"
              style={{
                width: 28,
                height: 28,
                backgroundColor: barColor,
              }}
            >
              {currentStage + 1}
            </span>
            <div>
              <span className="text-sm font-bold text-gray-800 tracking-wide">
                {displayNames[currentStage] || STAGES[currentStage]}
              </span>
              <span className="text-xs text-gray-400 ml-2">
                of {totalStages} steps
              </span>
            </div>
          </div>

          {/* Percentage indicator */}
          <span className="text-sm font-semibold" style={{ color: barColor }}>
            {Math.round(progress)}%
          </span>
        </div>

        {/* Step dots - bigger and more interactive */}
        <div className="flex items-center gap-1">
          {STAGES.map((stage, i) => {
            const isCompleted = completedStages.includes(i);
            const isCurrent = i === currentStage;
            const isAccessible = isCompleted || i <= Math.max(...completedStages, 0);

            return (
              <button
                key={i}
                onClick={() => isAccessible && goToStage(i)}
                className={`relative group flex-1 ${isAccessible ? 'cursor-pointer' : 'cursor-default'}`}
                title={displayNames[i] || stage}
                style={{ outline: 'none' }}
              >
                {/* Bar segment */}
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: isCompleted
                      ? barColor
                      : isCurrent
                      ? barColor
                      : '#E5E7EB',
                    opacity: isCurrent ? 1 : isCompleted ? 0.7 : 1,
                  }}
                />

                {/* Tooltip on hover */}
                <div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                >
                  {displayNames[i]}
                </div>

              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
