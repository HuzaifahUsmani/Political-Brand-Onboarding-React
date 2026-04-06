import { BrandProvider, useBrand } from './context/BrandContext';
import ErrorBoundary from './components/ErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';
import ProgressBar from './components/ProgressBar';
import LiveColorStrip from './components/LiveColorStrip';
import Stage1 from './components/stages/Stage1_CandidateBasics';
import Stage2 from './components/stages/Stage2_CandidateProfile';
import Stage3 from './components/stages/Stage3_BrandCore';
import Stage4 from './components/stages/Stage4_SubDirection';
import Stage5 from './components/stages/Stage5_ColorPalette';
import Stage6 from './components/stages/Stage6_FontSelection';
import Stage7 from './components/stages/Stage6_VisualIdentity';
import Stage8 from './components/stages/Stage7_LogoType';
// import Stage9 from './components/stages/Stage8_CollateralPriority'; // hidden for now — re-enable when ready
import Stage10 from './components/stages/Stage9_FinalReview';

const stages = [Stage1, Stage2, Stage3, Stage4, Stage5, Stage6, Stage7, Stage8, /*Stage9,*/ Stage10];

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

const desktopVariants = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};
const desktopTransition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] };

function AppContent() {
  const { state } = useBrand();
  const StageComponent = stages[state.currentStage];

  if (isMobile) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
        <ProgressBar />
        <StageComponent key={state.currentStage} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#F9FAFB',
      }}
    >
      <ProgressBar />
      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentStage}
          variants={desktopVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={desktopTransition}
          style={{ willChange: 'opacity, transform' }}
        >
          <StageComponent />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrandProvider>
        <AppContent />
        <LiveColorStrip />
      </BrandProvider>
    </ErrorBoundary>
  );
}
