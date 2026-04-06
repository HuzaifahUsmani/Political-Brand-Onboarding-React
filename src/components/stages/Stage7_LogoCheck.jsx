import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import StageContainer from '../StageContainer';

const accent = '#8B1A2B';
const navy  = '#1C2E5B';

const headingGradient = {
  background: 'linear-gradient(135deg, #1C2E5B, #8B1A2B)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

/* ── Decorative dots ── */
function DecorativeDots({ style }) {
  return (
    <svg
      style={{ position: 'absolute', opacity: 0.04, pointerEvents: 'none', ...style }}
      width="200" height="200" viewBox="0 0 200 200" fill="none"
    >
      {Array.from({ length: 10 }).map((_, row) =>
        Array.from({ length: 10 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={col * 20 + 10} cy={row * 20 + 10} r="2" fill={navy} />
        ))
      )}
    </svg>
  );
}

/* ── Yes / No choice card ── */
function ChoiceCard({ icon, title, description, selected, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.10)' }}
      whileTap={{ scale: 0.98 }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        padding: '32px 24px',
        borderRadius: 18,
        border: `2px solid ${selected ? accent : '#E5E7EB'}`,
        background: selected ? '#FFF9FA' : '#FFFFFF',
        boxShadow: selected
          ? '0 0 0 4px rgba(139,26,43,0.08)'
          : '0 2px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* selected ring */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 26, height: 26, borderRadius: '50%',
            background: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6.5L4.5 9L10 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}

      {/* icon */}
      <div style={{
        width: 72, height: 72, borderRadius: 18,
        background: selected ? 'rgba(139,26,43,0.06)' : '#F3F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32,
        transition: 'background 0.2s',
      }}>
        {icon}
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Georgia, serif', fontSize: 19, fontWeight: 700,
          color: selected ? accent : navy,
          margin: '0 0 6px',
          transition: 'color 0.2s',
        }}>
          {title}
        </p>
        <p style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: 13, lineHeight: 1.5, color: navy, opacity: 0.55, margin: 0,
        }}>
          {description}
        </p>
      </div>

      {/* bottom accent bar */}
      {selected && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 3, background: accent, borderRadius: '0 0 16px 16px',
          }}
        />
      )}
    </motion.button>
  );
}

/* ── Upload drop zone ── */
function LogoUploadZone({ previewUrl, onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => onFile(e.target.result, file.name);
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        style={{
          border: `2px dashed ${dragging ? accent : previewUrl ? accent : '#D1D5DB'}`,
          borderRadius: 16,
          padding: previewUrl ? '20px' : '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'rgba(139,26,43,0.03)' : previewUrl ? 'rgba(139,26,43,0.02)' : '#FAFAFA',
          transition: 'border-color 0.2s, background 0.2s',
        }}
      >
        {previewUrl ? (
          /* Image preview */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 180, height: 120,
              borderRadius: 10,
              background: '#F3F4F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
            }}>
              <img
                src={previewUrl}
                alt="Uploaded logo preview"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: accent, fontSize: 14 }}>
                ✓ Logo uploaded
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: navy, opacity: 0.5 }}>
                Click to replace
              </p>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 40, opacity: 0.35 }}>⬆️</div>
            <div>
              <p style={{
                margin: 0, fontSize: 15, fontWeight: 600,
                color: navy, opacity: 0.7,
              }}>
                Click to upload or drag &amp; drop
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: navy, opacity: 0.45 }}>
                PNG, JPG, SVG, or PDF — max 10 MB
              </p>
            </div>
            <div style={{
              marginTop: 4, padding: '8px 20px', borderRadius: 8,
              background: accent, color: '#FFFFFF',
              fontSize: 13, fontWeight: 600,
            }}>
              Choose file
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp,application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                                           */
/* ────────────────────────────────────────────────────────────────────────── */
export default function Stage7_LogoCheck() {
  const { state, dispatch, nextStage, goToStage } = useBrand();

  const hasLogo    = state.hasExistingLogo;   // null | true | false
  const previewUrl = state.existingLogoUrl;   // null | dataURL string

  const handleChoice = (value) => {
    dispatch({ type: 'SET_LOGO_STATUS', payload: { hasExistingLogo: value, existingLogoUrl: null } });
  };

  const handleFile = (dataUrl) => {
    dispatch({ type: 'SET_LOGO_STATUS', payload: { existingLogoUrl: dataUrl } });
  };

  const canContinue = hasLogo === false || (hasLogo === true && previewUrl);

  const handleContinue = () => {
    if (hasLogo === false) {
      // Proceed to Logo Style selection (next stage)
      nextStage();
    } else {
      // Skip Logo Style — go straight to Collateral Priority (stage + 2)
      dispatch({ type: 'COMPLETE_STAGE', payload: state.currentStage });
      goToStage(state.currentStage + 2);
    }
  };

  return (
    <StageContainer
      title="Your Logo"
      subtitle="Let us know whether you're bringing an existing logo or need us to create one."
      stageNumber={8}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{
          borderRadius: 40,
          background: 'white',
          padding: 40,
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <DecorativeDots style={{ top: -20, right: -20 }} />
        <DecorativeDots style={{ bottom: -20, left: -20 }} />

        {/* ── Heading ── */}
        <div style={{ textAlign: 'center', marginBottom: 40, position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 28, fontWeight: 700,
            margin: '0 0 8px', letterSpacing: 1,
            ...headingGradient,
          }}>
            Do you have an existing logo?
          </h2>
          <p style={{
            fontFamily: 'Georgia, serif', fontSize: 15,
            color: navy, opacity: 0.6, fontStyle: 'italic', margin: 0,
          }}>
            This helps us understand whether to refine what you have or design something new
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 16 }}>
            <div style={{ width: 40, height: 1, background: accent, opacity: 0.3 }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, opacity: 0.5 }} />
            <div style={{ width: 40, height: 1, background: accent, opacity: 0.3 }} />
          </div>
        </div>

        {/* ── Yes / No cards ── */}
        <div style={{
          display: 'flex', gap: 20, maxWidth: 680,
          margin: '0 auto', position: 'relative', zIndex: 1,
          flexWrap: 'wrap',
        }}>
          <ChoiceCard
            icon="✅"
            title="Yes, I have a logo"
            description="Upload your existing logo and we'll build the brand kit around it."
            selected={hasLogo === true}
            onClick={() => handleChoice(true)}
          />
          <ChoiceCard
            icon="🎨"
            title="No, create one for me"
            description="We'll design a logo from scratch based on your brand style selections."
            selected={hasLogo === false}
            onClick={() => handleChoice(false)}
          />
        </div>

        {/* ── Upload zone (only when yes is selected) ── */}
        <AnimatePresence>
          {hasLogo === true && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ maxWidth: 680, margin: '32px auto 0', position: 'relative', zIndex: 1, overflow: 'hidden' }}
            >
              <p style={{
                fontFamily: 'Georgia, serif', fontSize: 14,
                fontWeight: 600, color: navy, opacity: 0.7,
                marginBottom: 12,
              }}>
                Upload your logo file
              </p>
              <LogoUploadZone previewUrl={previewUrl} onFile={handleFile} />
              <p style={{
                fontSize: 12, color: navy, opacity: 0.4,
                marginTop: 10, fontStyle: 'italic',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}>
                We'll use this as a reference when building your brand kit. We may refine it for consistency with your chosen fonts and colours.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Continue button ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40, position: 'relative', zIndex: 1 }}>
          <motion.button
            onClick={handleContinue}
            disabled={!canContinue}
            whileHover={canContinue ? { scale: 1.03 } : {}}
            whileTap={canContinue ? { scale: 0.97 } : {}}
            style={{
              padding: '14px 48px',
              borderRadius: 12,
              border: 'none',
              background: canContinue
                ? `linear-gradient(135deg, ${navy}, ${accent})`
                : '#E5E7EB',
              color: canContinue ? '#FFFFFF' : '#9CA3AF',
              fontSize: 15, fontWeight: 700,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              cursor: canContinue ? 'pointer' : 'not-allowed',
              boxShadow: canContinue ? '0 4px 16px rgba(28,46,91,0.25)' : 'none',
              transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
              letterSpacing: 0.3,
            }}
          >
            {hasLogo === false ? 'Choose Logo Style →' : 'Continue →'}
          </motion.button>
        </div>
      </motion.div>
    </StageContainer>
  );
}
