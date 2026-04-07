import { motion } from 'framer-motion';
import { STAGES } from '../data/brandData';
import { useBrand } from '../context/BrandContext';

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

const STAGE_NAMES = [
  'Candidate Basics',
  'Candidate Profile',
  'Brand Core',
  'Brand Direction',
  'Color Palette',
  'Font Selection',
  'Visual Identity',
  'Logo',
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
    <div
      className="no-print"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: '#ffffff', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
    >
      {/* Main progress bar */}
      <div style={{ height: 8, backgroundColor: '#E5E7EB', width: '100%', position: 'relative', overflow: 'hidden' }}>
        <motion.div
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: isMobile ? 0.2 : 0.8, ease: [0.4, 0, 0.2, 1] }}
          style={{ height: '100%', backgroundColor: barColor }}
        />
        {!isMobile && (
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              height: '100%',
              width: '80px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            }}
            animate={{ left: ['-80px', '100%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
          />
        )}
      </div>

      {/* Step info bar */}
      <div style={{ maxWidth: 1152, margin: '0 auto', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Step counter badge */}
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: '50%',
                fontSize: 12, fontWeight: 700, color: '#ffffff',
                backgroundColor: barColor,
              }}
            >
              {currentStage + 1}
            </span>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', letterSpacing: '0.025em' }}>
                {displayNames[currentStage] || STAGES[currentStage]}
              </span>
              <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>
                of {totalStages} steps
              </span>
            </div>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: barColor }}>
            {Math.round(progress)}%
          </span>
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {STAGES.map((stage, i) => {
            const isCompleted = completedStages.includes(i);
            const isCurrent = i === currentStage;
            const isAccessible = isCompleted || i <= Math.max(0, ...(completedStages.length > 0 ? completedStages : [0]));

            return (
              <button
                key={i}
                onClick={() => isAccessible && goToStage(i)}
                title={displayNames[i] || stage}
                style={{
                  flex: 1, outline: 'none', background: 'none', border: 'none',
                  padding: '4px 0', cursor: isAccessible ? 'pointer' : 'default',
                  position: 'relative', touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
                className="group"
              >
                <div
                  style={{
                    height: 6,
                    borderRadius: 9999,
                    transition: 'background-color 0.5s',
                    backgroundColor: (isCompleted || isCurrent) ? barColor : '#E5E7EB',
                    opacity: isCompleted && !isCurrent ? 0.7 : 1,
                  }}
                />
                {!isMobile && (
                  <div
                    className="absolute opacity-0 group-hover:opacity-100 pointer-events-none"
                    style={{
                      top: -32, left: '50%', transform: 'translateX(-50%)',
                      padding: '2px 8px', backgroundColor: '#1f2937', color: '#ffffff',
                      fontSize: 10, fontWeight: 500, borderRadius: 4, whiteSpace: 'nowrap',
                      transition: 'opacity 0.15s',
                    }}
                  >
                    {displayNames[i]}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
