import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import { BRAND_CORES, FONT_LIBRARY } from '../../data/brandData';

/* ------------------------------------------------------------------ */
/*  Confetti - simple CSS-only falling pieces for Thank You page       */
/* ------------------------------------------------------------------ */
function ConfettiPiece({ index }) {
  const colors = ['#B22234', '#1C2E5B', '#FFD700', '#CC2029', '#2C4A7C', '#8B1A2B', '#B8860B', '#4CAF50', '#E91E63', '#9C27B0'];
  const style = useMemo(() => ({
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${2.5 + Math.random() * 2}s`,
    backgroundColor: colors[index % colors.length],
    width: `${6 + Math.random() * 8}px`,
    height: `${6 + Math.random() * 8}px`,
    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    transform: `rotate(${Math.random() * 360}deg)`,
  }), [index]);

  return <div className="confetti-piece" style={style} />;
}

/* ------------------------------------------------------------------ */
/*  Summary Card — a clean bordered card with a label                  */
/* ------------------------------------------------------------------ */
function SummaryCard({ title, children }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{title}</h3>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Thank You Page                                                     */
/* ------------------------------------------------------------------ */
function ThankYouPage({ collateralSelected }) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-gray-50 relative overflow-hidden"
    >
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>
      )}

      <style>{`
        .confetti-piece {
          position: absolute;
          top: -10px;
          opacity: 0;
          animation: confettiFall linear forwards;
        }
        @keyframes confettiFall {
          0%   { opacity: 1; top: -10px; transform: rotate(0deg) translateX(0px); }
          25%  { opacity: 1; transform: rotate(180deg) translateX(30px); }
          50%  { opacity: 0.9; transform: rotate(360deg) translateX(-20px); }
          75%  { opacity: 0.6; transform: rotate(540deg) translateX(15px); }
          100% { opacity: 0; top: 100vh; transform: rotate(720deg) translateX(-10px); }
        }
      `}</style>

      <div className="max-w-xl w-full text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
        >
          Thank You!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-lg text-gray-600 mb-3 leading-relaxed"
        >
          Your detailed brand kit will be delivered to you within 3 working days based on your selections.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="text-lg text-gray-600 mb-12 leading-relaxed"
        >
          Website content will be started based on your choices.
        </motion.p>

        {/* What you'll receive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="rounded-lg border border-gray-200 bg-white text-left p-6 space-y-4"
        >
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
            What you will receive
          </h3>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 w-2 h-2 rounded-full bg-[#8B1A2B] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Logo delivery</p>
              <p className="text-sm text-gray-500">Within 2 working days</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 w-2 h-2 rounded-full bg-[#8B1A2B] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Brand kit</p>
              <p className="text-sm text-gray-500">Within 3 working days</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 w-2 h-2 rounded-full bg-[#8B1A2B] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Website content</p>
              <p className="text-sm text-gray-500">Started based on your choices</p>
            </div>
          </div>

          {collateralSelected && (
            <div className="flex items-start gap-3">
              <span className="mt-0.5 w-2 h-2 rounded-full bg-[#8B1A2B] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Collateral materials</p>
                <p className="text-sm text-gray-500">2 weeks, print-ready</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Stage 9 Component                                             */
/* ------------------------------------------------------------------ */
export default function Stage9_FinalReview() {
  const { state, prevStage, getActiveColors } = useBrand();
  const brandCore = BRAND_CORES[state.brandCore];
  const colors = getActiveColors();
  const [approved, setApproved] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const headingFont = brandCore?.fonts?.heading || 'Georgia';
  const bodyFont = brandCore?.fonts?.body || 'system-ui';
  const headingMeta = FONT_LIBRARY[brandCore?.fonts?.heading];
  const bodyMeta = FONT_LIBRARY[brandCore?.fonts?.body];

  /* Collateral items — now a simple array of selected IDs */
  const selectedMaterialIds = useMemo(() => {
    return Array.isArray(state.collateralPriorities) ? state.collateralPriorities : [];
  }, [state.collateralPriorities]);

  const hasCollateral = selectedMaterialIds.length > 0;

  /* Color swatches */
  const swatches = [
    { label: 'Primary', hex: colors.primary || '#1C2E5B' },
    { label: 'Secondary', hex: colors.secondary || '#B22234' },
    { label: 'Accent', hex: colors.accent || '#FFFFFF' },
    { label: 'Background', hex: colors.background || '#F5F5F5' },
    { label: 'Text', hex: colors.text || '#333333' },
    { label: 'Highlight', hex: colors.highlight || colors.secondary || '#B22234' },
  ];

  /* If submitted, show thank you page */
  if (submitted) {
    return <ThankYouPage collateralSelected={hasCollateral} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-3xl mx-auto px-6 py-10 md:py-14">
        {/* Back button */}
        <button
          onClick={prevStage}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Page heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Review Your Selections</h1>
        <p className="text-base text-gray-500 mb-10">Please review everything below before completing.</p>

        {/* Summary cards */}
        <div className="space-y-5">

          {/* Candidate Info */}
          <SummaryCard title="Candidate Info">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {state.candidate.fullName && (
                <div className="col-span-2">
                  <p className="text-lg font-semibold text-gray-900">{state.candidate.fullName}</p>
                </div>
              )}
              {state.candidate.office && (
                <div>
                  <p className="text-xs text-gray-400">Office</p>
                  <p className="text-sm text-gray-700">{state.candidate.office}</p>
                </div>
              )}
              {state.candidate.state && (
                <div>
                  <p className="text-xs text-gray-400">State</p>
                  <p className="text-sm text-gray-700">{state.candidate.state}</p>
                </div>
              )}
              {state.candidate.electionYear && (
                <div>
                  <p className="text-xs text-gray-400">Year</p>
                  <p className="text-sm text-gray-700">{state.candidate.electionYear}</p>
                </div>
              )}
              {state.candidate.district && (
                <div>
                  <p className="text-xs text-gray-400">District</p>
                  <p className="text-sm text-gray-700">{state.candidate.district}</p>
                </div>
              )}
            </div>
          </SummaryCard>

          {/* Brand Core */}
          {brandCore && (
            <SummaryCard title="Brand Core">
              <p className="text-lg font-semibold text-gray-900 mb-1">{brandCore.name}</p>
              <p className="text-sm text-gray-500">{brandCore.descriptor}</p>
              {state.subDirection && (() => {
                const subDir = brandCore.subDirections?.find((s) => s.id === state.subDirection);
                if (!subDir) return null;
                return (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">Sub-direction</p>
                    <p className="text-sm font-medium text-gray-700">{subDir.name}</p>
                  </div>
                );
              })()}
            </SummaryCard>
          )}

          {/* Color Palette */}
          <SummaryCard title="Color Palette">
            <div className="flex flex-wrap gap-3">
              {swatches.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded"
                    style={{
                      backgroundColor: s.hex,
                      border: isLightColor(s.hex) ? '1px solid #d1d5db' : '1px solid transparent',
                    }}
                  />
                  <div>
                    <p className="text-xs font-medium text-gray-700">{s.label}</p>
                    <p className="text-xs text-gray-400 font-mono">{s.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </SummaryCard>

          {/* Fonts */}
          {brandCore?.fonts && (
            <SummaryCard title="Fonts">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Heading</p>
                  <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: headingFont }}>
                    {brandCore.fonts.heading}
                  </p>
                  {headingMeta && (
                    <p className="text-xs text-gray-400 mt-0.5">{headingMeta.category}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Body</p>
                  <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: bodyFont }}>
                    {brandCore.fonts.body}
                  </p>
                  {bodyMeta && (
                    <p className="text-xs text-gray-400 mt-0.5">{bodyMeta.category}</p>
                  )}
                </div>
              </div>
            </SummaryCard>
          )}

          {/* Logo Type */}
          {state.logoType && (
            <SummaryCard title="Logo Type">
              <p className="text-sm font-semibold text-gray-800">{state.logoType}</p>
            </SummaryCard>
          )}

          {/* Collateral Materials */}
          {hasCollateral && (
            <SummaryCard title="Campaign Materials">
              <div className="space-y-2 mb-4">
                {selectedMaterialIds.map((id) => {
                  const name = id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                  return (
                    <div key={id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-700">{name}</span>
                      <span className="text-sm font-medium text-gray-600">$350</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-3 border-t-2 border-gray-800">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-base font-bold text-gray-900">${(selectedMaterialIds.length * 350).toLocaleString()}</span>
              </div>
            </SummaryCard>
          )}
        </div>

        {/* Confirmation callout */}
        <div className="mt-8 rounded-lg bg-[#FDF6F0] border border-[#F0DDD0] p-5">
          <p className="text-sm text-gray-700 font-medium mb-2">
            Your logo will be delivered to you within 2 working days.
          </p>
          <p className="text-sm text-gray-700 font-medium">
            Website content will be started based on your choices.
          </p>
        </div>

        {/* Approval checkbox */}
        <label className="flex items-start gap-3 mt-8 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={approved}
            onChange={(e) => setApproved(e.target.checked)}
            className="mt-0.5 w-5 h-5 rounded border-gray-300 text-[#8B1A2B] focus:ring-[#8B1A2B] cursor-pointer"
          />
          <span className="text-sm text-gray-700 font-medium leading-snug">
            Yes, I approve these selections and want to proceed.
          </span>
        </label>

        {/* Complete button */}
        <div className="mt-8 mb-4">
          <button
            onClick={() => setSubmitted(true)}
            disabled={!approved}
            className="w-full sm:w-auto px-10 py-4 rounded-lg text-base font-semibold text-white transition-colors"
            style={{
              backgroundColor: approved ? '#8B1A2B' : '#C4C4C4',
              cursor: approved ? 'pointer' : 'not-allowed',
            }}
          >
            Complete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Utility                                                            */
/* ------------------------------------------------------------------ */
function isLightColor(hex) {
  const h = (hex || '#000000').replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 186;
}
