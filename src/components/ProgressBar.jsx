import { STAGES } from '../data/brandData';
import { useBrand } from '../context/BrandContext';

const STAGE_NAMES = [
  'Candidate Basics',
  'Candidate Profile',
  'Brand Core',
  'Brand Direction',
  'Color Palette',
  'Visual Identity',
  'Logo Type',
  'Website Copy',
  'Collateral',
  'Review',
];

export default function ProgressBar() {
  const { state, goToStage } = useBrand();
  const { currentStage, completedStages } = state;
  const totalStages = STAGES.length;
  const progress = ((currentStage + 1) / totalStages) * 100;
  const displayNames = STAGE_NAMES.slice(0, totalStages);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 no-print bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      {/* Solid progress bar */}
      <div className="h-1.5 bg-[#E5E7EB] w-full">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: '#8B1A2B',
          }}
        />
      </div>

      {/* Step info and dots */}
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700 tracking-wide">
            Step {currentStage + 1} of {totalStages} — {displayNames[currentStage] || STAGES[currentStage]}
          </span>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2">
          {STAGES.map((stage, i) => {
            const isCompleted = completedStages.includes(i);
            const isCurrent = i === currentStage;
            const isAccessible = isCompleted || i <= Math.max(...completedStages, 0);
            return (
              <button
                key={i}
                onClick={() => isAccessible && goToStage(i)}
                className={`flex items-center justify-center transition-all duration-300 ${
                  isAccessible ? 'cursor-pointer' : 'cursor-default'
                }`}
                title={displayNames[i] || stage}
                style={{ outline: 'none' }}
              >
                <span
                  className="block rounded-full transition-all duration-300"
                  style={{
                    width: isCurrent ? 12 : 8,
                    height: isCurrent ? 12 : 8,
                    backgroundColor: isCompleted
                      ? '#8B1A2B'
                      : isCurrent
                      ? '#8B1A2B'
                      : 'transparent',
                    border: isCurrent
                      ? '2px solid #8B1A2B'
                      : isCompleted
                      ? '2px solid #8B1A2B'
                      : '2px solid #D1D5DB',
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
