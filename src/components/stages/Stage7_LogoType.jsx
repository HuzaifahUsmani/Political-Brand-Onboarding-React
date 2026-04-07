import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Palette, Upload, Check } from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import StageContainer from '../StageContainer';
import { getSupabaseClient } from '../../supabase/client';

/* ── Design tokens ── */
const accent = '#8B1A2B';
const navy = '#1C2E5B';

/* ── Gradient style for headings ── */
const headingGradient = {
  background: 'linear-gradient(135deg, #1C2E5B, #8B1A2B)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

/* ── Decorative SVG dot pattern ── */
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

/* ── Keyframes ── */
const keyframes = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ── Logo Type Data ── */
const LOGO_TYPES = [
  {
    id: 'emblem',
    name: 'Emblem',
    description: 'Classic seal or badge design — circular, authoritative, and timeless. Ideal for official-feeling campaigns.',
    image: '/logos/emblem.webp',
  },
  {
    id: 'symbol-text',
    name: 'Symbol + Text',
    description: 'An iconic symbol paired with the candidate name. Versatile and modern, great for yard signs and digital.',
    image: '/logos/symbol-text.webp',
    cropTop: true,
  },
  {
    id: 'monogram',
    name: 'Monogram',
    description: 'Stylized initials that create a bold, memorable mark. Clean and contemporary with strong brand recall.',
    image: '/logos/monogram.webp',
  },
  {
    id: 'wordmark',
    name: 'Wordmark',
    description: 'Pure typographic treatment of the candidate name. Elegant, direct, and lets the name speak for itself.',
    image: '/logos/wordmark.webp',
  },
];

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
        boxShadow: selected ? '0 0 0 4px rgba(139,26,43,0.08)' : '0 2px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
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
          <Check size={12} color="white" strokeWidth={2.5} />
        </motion.div>
      )}

      <div style={{
        width: 72, height: 72, borderRadius: 18,
        background: selected ? 'rgba(139,26,43,0.06)' : '#F3F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s',
        color: selected ? accent : navy,
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

/* ── Floating animation for mockup cards ── */
const floatAnimation = {
  y: [0, -6, 0],
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

export default function Stage7_LogoType() {
  const { state, dispatch } = useBrand();
  const selected = state.logoType;
  const hasExisting = state.hasExistingLogo;
  const existingUrl = state.existingLogoUrl;
  const uploadLater = state.uploadLogoLater || false;

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // canContinue logic:
  // - must choose yes or no first
  // - if yes: need uploaded URL or uploadLater checked
  // - if no: need a logoType selected
  const canContinue =
    hasExisting === true
      ? (!!existingUrl || uploadLater)
      : hasExisting === false
        ? !!selected
        : false;

  const handleChoice = (value) => {
    dispatch({ type: 'SET_LOGO_STATUS', payload: { hasExistingLogo: value, existingLogoUrl: null, uploadLogoLater: false } });
    if (!value) setUploadError(null);
  };

  const handleSelect = (id) => {
    dispatch({ type: 'SET_LOGO_TYPE', payload: id });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) {
      setUploadError(`File too large. Max ${maxMB}MB.`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    const ext = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${ext}`;

    const { data, error } = await getSupabaseClient()
      .storage
      .from('logos')
      .upload(fileName, file, { upsert: true });

    if (error) {
      setUploadError('Upload failed. Please try again.');
      setUploading(false);
      return;
    }

    const { data: urlData } = getSupabaseClient()
      .storage
      .from('logos')
      .getPublicUrl(data.path);

    dispatch({ type: 'SET_LOGO_STATUS', payload: { existingLogoUrl: urlData.publicUrl } });
    setUploading(false);
  };

  // Preload all logo images as soon as component mounts
  useEffect(() => {
    LOGO_TYPES.forEach(({ image }) => {
      const img = new Image();
      img.src = image;
    });
  }, []);

  return (
    <StageContainer
      title="Your Logo"
      subtitle="Tell us about your logo — upload what you have or choose the style you want."
      stageNumber={9}
      canContinue={canContinue}
    >
      <style>{keyframes}</style>

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

        {/* ── Section heading ── */}
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

        {/* ── Yes / No choice cards ── */}
        <div style={{
          display: 'flex', gap: 20, maxWidth: 680,
          margin: '0 auto', position: 'relative', zIndex: 1,
          flexWrap: 'wrap',
        }}>
          <ChoiceCard
            icon={<CheckCircle2 size={32} />}
            title="Yes, I have a logo"
            description="Upload your existing logo and we'll build the brand kit around it."
            selected={hasExisting === true}
            onClick={() => handleChoice(true)}
          />
          <ChoiceCard
            icon={<Palette size={32} />}
            title="No, create one for me"
            description="We'll design a logo from scratch based on your brand style selections."
            selected={hasExisting === false}
            onClick={() => handleChoice(false)}
          />
        </div>

        {/* ── Upload zone (Yes) ── */}
        <AnimatePresence>
          {hasExisting === true && (
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
                fontWeight: 600, color: navy, opacity: 0.7, marginBottom: 12,
              }}>
                Upload your logo file
              </p>

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${existingUrl ? accent : '#D1D5DB'}`,
                  borderRadius: 16,
                  padding: existingUrl ? '20px' : '48px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: existingUrl ? 'rgba(139,26,43,0.02)' : '#FAFAFA',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                {existingUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 180, height: 120, borderRadius: 10,
                      background: '#F3F4F6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                    }}>
                      <img
                        src={existingUrl}
                        alt="Uploaded logo preview"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: accent, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <Check size={15} strokeWidth={2.5} /> Logo uploaded — click to replace
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <Upload size={36} color={uploading ? accent : '#9CA3AF'} strokeWidth={1.5} />
                    <div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: navy, opacity: 0.7 }}>
                        {uploading ? 'Uploading…' : 'Click to upload or drag & drop'}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: navy, opacity: 0.45 }}>
                        PNG, JPG, SVG — max 5 MB
                      </p>
                    </div>
                    {!uploading && (
                      <div style={{
                        marginTop: 4, padding: '8px 20px', borderRadius: 8,
                        background: accent, color: '#FFFFFF',
                        fontSize: 13, fontWeight: 600,
                      }}>
                        Choose file
                      </div>
                    )}
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />

              {uploadError && (
                <p style={{ color: '#DC2626', fontSize: 13, marginTop: 8, textAlign: 'center' }}>{uploadError}</p>
              )}

              {/* Upload later checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, cursor: 'pointer', justifyContent: 'center' }}>
                <input
                  type="checkbox"
                  checked={uploadLater}
                  onChange={(e) => dispatch({ type: 'SET_LOGO_STATUS', payload: { uploadLogoLater: e.target.checked } })}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 13, color: '#6B7280' }}>I will upload the logo later</span>
              </label>

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

        {/* ── Logo style selection (No) ── */}
        <AnimatePresence>
          {hasExisting === false && (
            <motion.div
              key="logo-types"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
              {/* Sub-heading */}
              <div style={{ textAlign: 'center', margin: '40px 0 32px', position: 'relative', zIndex: 1 }}>
                <h3 style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 22, fontWeight: 700,
                  margin: '0 0 8px', letterSpacing: 0.5,
                  ...headingGradient,
                }}>
                  Select Your Logo Style
                </h3>
                <p style={{
                  fontFamily: 'Georgia, serif', fontSize: 14,
                  color: navy, opacity: 0.6, fontStyle: 'italic', margin: 0,
                }}>
                  Each style communicates a different kind of authority and personality
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 14 }}>
                  <div style={{ width: 40, height: 1, background: accent, opacity: 0.3 }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, opacity: 0.5 }} />
                  <div style={{ width: 40, height: 1, background: accent, opacity: 0.3 }} />
                </div>
              </div>

              {/* Logo type cards */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 28,
                maxWidth: 900,
                margin: '0 auto',
                position: 'relative',
                zIndex: 1,
              }}>
                {LOGO_TYPES.map((logoType, index) => {
                  const isSelected = selected === logoType.id;

                  return (
                    <motion.div
                      key={logoType.id}
                      initial={{ opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 + index * 0.1, ease: [0.4, 0, 0.2, 1] }}
                      onClick={() => handleSelect(logoType.id)}
                      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                      whileTap={{ scale: 0.99 }}
                      style={{
                        position: 'relative',
                        background: isSelected ? '#FFF9FA' : '#FFFFFF',
                        border: `2px solid ${isSelected ? accent : '#E5E7EB'}`,
                        borderRadius: 16,
                        cursor: 'pointer',
                        boxShadow: isSelected
                          ? '0 0 20px rgba(139,26,43,0.3), 0 0 40px rgba(139,26,43,0.1)'
                          : '0 2px 8px rgba(0,0,0,0.06)',
                        transition: 'border-color 0.25s, box-shadow 0.25s, background 0.25s',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Selected checkmark */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          style={{
                            position: 'absolute',
                            top: 14, right: 14,
                            width: 30, height: 30,
                            borderRadius: '50%',
                            background: accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(139,26,43,0.35)',
                            zIndex: 2,
                          }}
                        >
                          <Check size={14} color="white" strokeWidth={2.5} />
                        </motion.div>
                      )}

                      {/* Logo reference image — webps have a title header in the top ~20%.
                          cover + objectPosition 65% crops that header out and shows logos. */}
                      <div style={{
                        background: '#FAFAFA',
                        height: 180,
                        overflow: 'hidden',
                        borderBottom: `1px solid ${isSelected ? 'rgba(139,26,43,0.12)' : '#F0F0F0'}`,
                      }}>
                        <img
                          src={logoType.image}
                          alt={`${logoType.name} logo examples`}
                          loading="eager"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement.innerHTML = '<span style="color:#9CA3AF;font-size:13px;display:flex;align-items:center;justify-content:center;height:100%">Preview unavailable</span>';
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center 30%',
                            transition: 'opacity 0.3s ease',
                          }}
                        />
                      </div>

                      {/* Text content */}
                      <div style={{ padding: '18px 24px 20px' }}>
                        <h3 style={{
                          fontFamily: 'Georgia, "Times New Roman", serif',
                          fontSize: 20, fontWeight: 700,
                          color: isSelected ? accent : navy,
                          margin: '0 0 6px',
                          transition: 'color 0.25s',
                        }}>
                          {logoType.name}
                        </h3>
                        <p style={{
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          fontSize: 14, lineHeight: 1.55,
                          color: navy, opacity: 0.6, margin: 0,
                        }}>
                          {logoType.description}
                        </p>
                      </div>

                      {/* Bottom accent bar when selected */}
                      {isSelected && (
                        <motion.div
                          layoutId="selectedBar"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3 }}
                          style={{
                            position: 'absolute',
                            bottom: 0, left: 0, right: 0,
                            height: 3, background: accent,
                            borderRadius: '0 0 14px 14px',
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </StageContainer>
  );
}
