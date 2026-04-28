import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import { BRAND_CORES, FONT_LIBRARY } from '../../data/brandData';
import { saveSubmission } from '../../supabase/submissions';
import { generateBrandPDF } from '../../utils/generateBrandPDF';
import Stage6_VisualIdentity from './Stage6_VisualIdentity';

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

  const deliverables = [
    { num: '01', title: 'Logo delivery', desc: 'Final files in all required formats', badge: '2 working days', badgeStyle: { background: '#f3f4f6', color: '#374151' } },
    { num: '02', title: 'Brand kit', desc: 'Complete guidelines based on your selections', badge: '3 working days', badgeStyle: { background: '#f3f4f6', color: '#374151' } },
    { num: '03', title: 'Website content', desc: 'Drafting begins from your chosen direction', badge: 'In progress', badgeStyle: { background: '#dcfce7', color: '#166534' } },
    ...(collateralSelected ? [{ num: '04', title: 'Collateral materials', desc: 'Print-ready assets across all touchpoints', badge: '2 weeks', badgeStyle: { background: '#f3f4f6', color: '#374151' } }] : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', background: '#ffffff', position: 'relative', overflow: 'hidden' }}
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

      <div style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
        {/* Green checkmark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}
        >
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#bbf7d0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ fontSize: 'clamp(2rem, 6vw, 2.75rem)', fontWeight: 700, color: '#111827', marginBottom: 16, lineHeight: 1.15 }}
        >
          Your submission is confirmed
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ fontSize: '1.05rem', color: '#6b7280', marginBottom: 40, lineHeight: 1.7, maxWidth: 480, margin: '0 auto 40px' }}
        >
          Thank you. We've received your selections and our team is already getting started. You'll receive deliverables according to the schedule below.
        </motion.p>

        {/* Delivery schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ borderRadius: 12, border: '1px solid #e5e7eb', background: '#f9fafb', textAlign: 'left', overflow: 'hidden' }}
        >
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b7280', margin: 0 }}>
              Delivery Schedule
            </p>
          </div>

          {deliverables.map((item, i) => (
            <div
              key={item.num}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '20px 24px',
                borderBottom: i < deliverables.length - 1 ? '1px solid #2a2a2a' : 'none',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#3730a3' }}>{item.num}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>{item.title}</p>
                <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: '0.85rem' }}>{item.desc}</p>
              </div>
              <span style={{ ...item.badgeStyle, padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {item.badge}
              </span>
            </div>
          ))}
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [pdfGenerating, setPdfGenerating] = useState(false);
  const pdfCaptureRef = useRef(null);

  const [pdfError, setPdfError] = useState(null);

  const handleDownloadPDF = async () => {
    setPdfGenerating(true);
    setPdfError(null);
    try {
      // Give the off-screen Visual Identity tree time to mount, run
      // framer-motion staggers, and load Google Fonts.
      await new Promise((r) => setTimeout(r, 1500));
      if (!pdfCaptureRef.current) throw new Error('Visual Identity preview not ready yet — try again.');
      const fileName = `${(state.candidate?.fullName || 'brand-summary').replace(/\s+/g, '-').toLowerCase()}-brand-report.pdf`;
      await generateBrandPDF(pdfCaptureRef.current, fileName);
    } catch (err) {
      console.error('PDF generation error:', err);
      setPdfError(err?.message || 'Failed to generate PDF.');
    } finally {
      setPdfGenerating(false);
    }
  };

  const headingFont = state.customFonts?.heading || brandCore?.fonts?.heading || 'Georgia';
  const bodyFont = state.customFonts?.body || brandCore?.fonts?.body || 'system-ui';
  const headingMeta = FONT_LIBRARY[headingFont];
  const bodyMeta = FONT_LIBRARY[bodyFont];

  /* Collateral items — now a simple array of selected IDs */
  const selectedMaterialIds = useMemo(() => {
    return Array.isArray(state.collateralPriorities) ? state.collateralPriorities : [];
  }, [state.collateralPriorities]);

  const hasCollateral = selectedMaterialIds.length > 0;

  /* Color swatches */
  const swatches = [
    { label: 'Primary',             hex: colors.primary    || '#1C2E5B' },
    { label: 'Secondary',           hex: colors.secondary  || '#B22234' },
    { label: 'Tertiary',            hex: colors.accent     || '#FFFFFF' },
    { label: 'Additional Colour 1', hex: colors.background || '#F5F5F5' },
    { label: 'Additional Colour 2', hex: colors.text       || '#333333' },
    { label: 'Additional Colour 3', hex: colors.additional || colors.accent || '#FFFFFF' },
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
      {/* Off-screen Visual Identity render — used as the source for the PDF
          so the exported file matches Stage 7 exactly. Wrapped in a fixed
          0×0 overflow:hidden container so it cannot contribute to page scroll. */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1100 }}>
          <div ref={pdfCaptureRef}>
            <Stage6_VisualIdentity />
          </div>
        </div>
      </div>

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
          {headingFont && (
            <SummaryCard title="Fonts">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Heading</p>
                  <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: headingFont }}>
                    {headingFont}
                  </p>
                  {headingMeta && (
                    <p className="text-xs text-gray-400 mt-0.5">{headingMeta.category}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Body</p>
                  <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: bodyFont }}>
                    {bodyFont}
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

        {/* ── PDF Download ── */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100" style={{ backgroundColor: colors.primary || '#1C2E5B' }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.accentOnDark || '#FFFFFF', opacity: 0.75 }}>Your Brand Report</p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: colors.textOnDark || '#FFFFFF' }}>Download a copy of your full brand summary</p>
          </div>
          <div className="p-5">
            <button
              onClick={handleDownloadPDF}
              disabled={pdfGenerating}
              className="flex items-center gap-3 w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-sm transition-all"
              style={{
                backgroundColor: pdfGenerating ? '#E5E7EB' : (colors.primary || '#1C2E5B'),
                color: pdfGenerating ? '#9CA3AF' : (colors.textOnDark || '#FFFFFF'),
                cursor: pdfGenerating ? 'not-allowed' : 'pointer',
                border: 'none',
              }}
            >
              {pdfGenerating ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                  Generating PDF…
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16l-4-4h2.5V4h3v8H16l-4 4zm-6 4h12" />
                  </svg>
                  Download PDF Report
                </>
              )}
            </button>
            {pdfError && (
              <p className="mt-3 text-sm text-red-600 font-medium">{pdfError}</p>
            )}
          </div>
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

        {/* Submit error */}
        {submitError && (
          <p className="mt-4 text-sm text-red-600 font-medium">{submitError}</p>
        )}

        {/* Complete button */}
        <div className="mt-8 mb-4">
          <button
            onClick={async () => {
              setSubmitting(true);
              setSubmitError(null);
              const { error } = await saveSubmission(state);
              setSubmitting(false);
              if (error) {
                setSubmitError(`Submission failed: ${error.message || JSON.stringify(error)}`);
                console.error('Supabase error:', error);
              } else {
                setSubmitted(true);
              }
            }}
            disabled={!approved || submitting}
            className="w-full sm:w-auto px-10 py-4 rounded-lg text-base font-semibold text-white transition-colors"
            style={{
              backgroundColor: approved && !submitting ? '#8B1A2B' : '#C4C4C4',
              cursor: approved && !submitting ? 'pointer' : 'not-allowed',
            }}
          >
            {submitting ? 'Submitting…' : 'Complete'}
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
