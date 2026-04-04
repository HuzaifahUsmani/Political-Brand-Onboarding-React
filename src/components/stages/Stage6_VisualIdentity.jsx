import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import { BRAND_CORES, FONT_LIBRARY } from '../../data/brandData';
import StageContainer from '../StageContainer';
import TiltCard from '../TiltCard';

/* ── Premium design tokens ── */
const headingGradient = {
  background: 'linear-gradient(135deg, #1C2E5B, #8B1A2B)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const sectionContainer = {
  borderRadius: 40,
  background: 'white',
  padding: 40,
  marginBottom: 32,
  position: 'relative',
  overflow: 'hidden',
};

/* ── Decorative SVG dot pattern ── */
function DecorativeDots({ style }) {
  return (
    <svg
      style={{
        position: 'absolute',
        opacity: 0.04,
        pointerEvents: 'none',
        ...style,
      }}
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
    >
      {Array.from({ length: 10 }).map((_, row) =>
        Array.from({ length: 10 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={col * 20 + 10}
            cy={row * 20 + 10}
            r="2"
            fill="#1C2E5B"
          />
        ))
      )}
    </svg>
  );
}

/* ── Decorative SVG line pattern ── */
function DecorativeLines({ style }) {
  return (
    <svg
      style={{
        position: 'absolute',
        opacity: 0.03,
        pointerEvents: 'none',
        ...style,
      }}
      width="300"
      height="300"
      viewBox="0 0 300 300"
      fill="none"
    >
      {Array.from({ length: 15 }).map((_, i) => (
        <line
          key={i}
          x1={0}
          y1={i * 20}
          x2={300}
          y2={i * 20}
          stroke="#1C2E5B"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

function useGoogleFonts(fonts) {
  useEffect(() => {
    if (!fonts || fonts.length === 0) return;

    const families = fonts
      .map((f) => {
        const meta = FONT_LIBRARY[f];
        const weights = meta?.weights?.join(';') || '400;700';
        return `family=${f.replace(/\s/g, '+')}:wght@${weights}`;
      })
      .join('&');

    const id = 'brand-google-fonts';
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.appendChild(link);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [fonts]);
}

const stagger = {
  container: { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } },
  item: { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } },
};

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function textOnColor(bgHex) {
  return luminance(bgHex) > 0.55 ? '#1a1a1a' : '#ffffff';
}
function isLightColor(hex) {
  return luminance(hex) > 0.7;
}

/* ------------------------------------------------------------------ */
/*  HERO SECTION                                                      */
/* ------------------------------------------------------------------ */
function HeroBrandReveal({ coreData, activeColors, candidateName, headingFont, bodyFont }) {
  const headingMeta = FONT_LIBRARY[headingFont];

  return (
    <motion.div
      variants={stagger.item}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      className="relative -mx-4 md:-mx-0 md:rounded-3xl overflow-hidden"
      style={{ backgroundColor: activeColors.primary, borderRadius: 40 }}
    >
      {/* decorative secondary stripe */}
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: activeColors.secondary }} />
      <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ backgroundColor: activeColors.secondary }} />

      {/* large ghosted initial behind everything */}
      <div
        className="absolute -right-10 -top-16 text-[20rem] md:text-[28rem] font-black leading-none select-none pointer-events-none"
        style={{
          fontFamily: `'${headingFont}', sans-serif`,
          color: hexToRgba(activeColors.secondary, 0.07),
          fontWeight: headingMeta?.weights?.[headingMeta.weights.length - 1] || 900,
        }}
      >
        {(candidateName?.split(' ').pop()?.[0] || 'S').toUpperCase()}
      </div>

      <div className="relative z-10 px-8 md:px-16 py-16 md:py-24 lg:py-32 max-w-5xl">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-sm md:text-base font-bold uppercase tracking-[0.25em] mb-6"
          style={{
            fontFamily: `'${bodyFont}', sans-serif`,
            color: activeColors.secondary,
          }}
        >
          {coreData.descriptor}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
          className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] tracking-tight mb-6"
          style={{
            fontFamily: `'${headingFont}', sans-serif`,
            fontWeight: headingMeta?.weights?.[headingMeta.weights.length - 1] || 900,
            color: activeColors.accent || '#FFFFFF',
          }}
        >
          {coreData.name}
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="origin-left h-1 w-24 md:w-40 mb-6"
          style={{ backgroundColor: activeColors.secondary }}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-xl md:text-2xl lg:text-3xl font-light max-w-2xl leading-relaxed"
          style={{
            fontFamily: `'${bodyFont}', sans-serif`,
            color: hexToRgba(activeColors.accent || '#FFFFFF', 0.8),
          }}
        >
          {coreData.tagline}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="mt-8 text-sm leading-relaxed max-w-xl"
          style={{
            fontFamily: `'${bodyFont}', sans-serif`,
            color: hexToRgba(activeColors.accent || '#FFFFFF', 0.5),
          }}
        >
          {coreData.positioning}
        </motion.p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  FONT SHOWCASE                                                     */
/* ------------------------------------------------------------------ */
function FontShowcase({ fonts, coreColors, candidateName, voiceTone }) {
  const headingFont = fonts?.heading;
  const bodyFont = fonts?.body;
  const headingMeta = FONT_LIBRARY[headingFont];
  const bodyMeta = FONT_LIBRARY[bodyFont];
  const heaviestWeight = headingMeta?.weights?.[headingMeta.weights.length - 1] || 700;
  const lastName = candidateName?.split(' ').pop()?.toUpperCase() || 'SMITH';
  const headline = voiceTone?.headlineExamples?.[0] || 'Lead With Conviction.';

  return (
    <motion.div
      variants={stagger.item}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      style={sectionContainer}
    >
      <DecorativeDots style={{ top: -10, right: -10 }} />
      {/* section label */}
      <p className="text-xs font-bold uppercase tracking-[0.25em] mb-8 px-2" style={{ color: '#1C2E5B', opacity: 0.7 }}>
        Typography System
      </p>

      <div className="grid md:grid-cols-5 gap-0 md:gap-0 overflow-hidden rounded-2xl border border-gray-100">
        {/* Left: heading font type specimen -- 3 cols */}
        <div className="md:col-span-3 bg-gray-950 px-8 md:px-12 py-12 md:py-16 relative overflow-hidden">
          {/* faint watermark */}
          <div
            className="absolute right-4 bottom-2 text-[10rem] md:text-[14rem] leading-none font-black select-none pointer-events-none"
            style={{
              fontFamily: `'${headingFont}', sans-serif`,
              color: 'rgba(255,255,255,0.03)',
              fontWeight: heaviestWeight,
            }}
          >
            Aa
          </div>
          <div className="relative z-10">
            <p className="text-gray-500 text-xs font-mono tracking-wider mb-6 uppercase">
              Heading &mdash; {headingFont} / {headingMeta?.category}
            </p>
            {/* type specimen sizes */}
            <p
              className="text-white leading-none mb-1"
              style={{ fontFamily: `'${headingFont}', sans-serif`, fontWeight: heaviestWeight, fontSize: '4.5rem' }}
            >
              {lastName}
            </p>
            <p
              className="text-white leading-tight mb-6"
              style={{ fontFamily: `'${headingFont}', sans-serif`, fontWeight: heaviestWeight, fontSize: '2.25rem' }}
            >
              {headline}
            </p>
            <p
              className="text-gray-400 leading-snug mb-4"
              style={{ fontFamily: `'${headingFont}', sans-serif`, fontWeight: 400, fontSize: '1.125rem' }}
            >
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </p>
            <p
              className="text-gray-500 leading-snug"
              style={{ fontFamily: `'${headingFont}', sans-serif`, fontWeight: 400, fontSize: '0.875rem' }}
            >
              abcdefghijklmnopqrstuvwxyz 0123456789
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              {headingMeta?.weights?.map((w) => (
                <span
                  key={w}
                  className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 font-mono"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: body font -- 2 cols */}
        <div className="md:col-span-2 bg-white px-8 md:px-10 py-12 md:py-16 flex flex-col justify-between">
          <div>
            <p className="text-gray-400 text-xs font-mono tracking-wider mb-6 uppercase">
              Body &mdash; {bodyFont} / {bodyMeta?.category}
            </p>
            <p
              className="text-3xl md:text-4xl text-gray-900 leading-tight mb-6"
              style={{ fontFamily: `'${bodyFont}', sans-serif`, fontWeight: bodyMeta?.weights?.[bodyMeta.weights.length - 1] || 700 }}
            >
              {candidateName || 'John Smith'}
            </p>
            <p
              className="text-base md:text-lg leading-relaxed text-gray-600 mb-4"
              style={{ fontFamily: `'${bodyFont}', sans-serif`, fontWeight: bodyMeta?.weights?.[0] || 400 }}
            >
              {voiceTone?.bodyCopy || 'Every campaign needs a clear message, a compelling story, and the discipline to deliver it consistently. Your brand is the foundation voters will build their trust upon.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            {bodyMeta?.weights?.map((w) => (
              <span
                key={w}
                className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-400 font-mono"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  COLOR PALETTE                                                     */
/* ------------------------------------------------------------------ */
function ColorPaletteImmersive({ colors }) {
  const colorEntries = [
    { key: 'primary', label: 'Primary', hex: colors.primary },
    { key: 'secondary', label: 'Secondary', hex: colors.secondary },
    { key: 'accent', label: 'Accent', hex: colors.accent },
    { key: 'background', label: 'Background', hex: colors.background || '#F5F5F5' },
    { key: 'text', label: 'Text', hex: colors.text || '#333333' },
    ...(colors.highlight && colors.highlight !== colors.secondary ? [{ key: 'highlight', label: 'Highlight', hex: colors.highlight }] : []),
  ];

  return (
    <motion.div
      variants={stagger.item}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      style={sectionContainer}
    >
      <DecorativeLines style={{ bottom: -20, left: -20 }} />
      <p className="text-xs font-bold uppercase tracking-[0.25em] mb-8 px-2" style={{ color: '#1C2E5B', opacity: 0.7 }}>
        Color Palette
      </p>

      {/* full-width gradient bar */}
      <div className="h-4 md:h-6 rounded-full overflow-hidden flex mb-8">
        {colorEntries.map(({ key, hex }) => (
          <div key={key} className="flex-1" style={{ backgroundColor: hex }} />
        ))}
      </div>

      {/* large immersive blocks */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {colorEntries.map(({ key, label, hex }, i) => {
          const fg = textOnColor(hex);
          const isLight = isLightColor(hex);
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
              transition={{ delay: 0.3 + i * 0.07, duration: 0.35 }}
              className="rounded-2xl overflow-hidden flex flex-col justify-between"
              style={{
                backgroundColor: hex,
                minHeight: '180px',
                border: isLight ? '2px solid #E5E7EB' : 'none',
              }}
            >
              <div className="p-5 md:p-6">
                <p className="text-xs font-bold uppercase tracking-wider opacity-70" style={{ color: fg }}>
                  {label}
                </p>
              </div>
              <div className="p-5 md:p-6">
                <p className="text-lg md:text-xl font-mono font-bold" style={{ color: fg }}>
                  {hex}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  VOICE & TONE                                                      */
/* ------------------------------------------------------------------ */
function VoiceToneEditorial({ voiceTone, coreColors, headingFont, bodyFont }) {
  const headingMeta = FONT_LIBRARY[headingFont];
  const heaviestWeight = headingMeta?.weights?.[headingMeta.weights.length - 1] || 700;

  return (
    <motion.div
      variants={stagger.item}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      style={sectionContainer}
    >
      <DecorativeDots style={{ top: -10, left: -10 }} />
      <DecorativeLines style={{ bottom: -20, right: -20 }} />
      <p className="text-xs font-bold uppercase tracking-[0.25em] mb-8 px-2" style={{ color: '#1C2E5B', opacity: 0.7 }}>
        Voice &amp; Tone
      </p>

      {/* headline style description */}
      <div className="mb-10 px-2">
        <p
          className="text-sm md:text-base leading-relaxed max-w-2xl italic border-l-4 pl-5 py-1"
          style={{
            fontFamily: `'${bodyFont}', sans-serif`,
            borderColor: activeColorsFallback(coreColors.secondary),
            color: '#1C2E5B',
            opacity: 0.6,
          }}
        >
          {voiceTone.headlineStyle}
        </p>
      </div>

      {/* headline examples as campaign poster cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        {voiceTone.headlineExamples.map((ex, i) => (
          <TiltCard
            key={i}
            className="relative rounded-2xl overflow-hidden flex items-center justify-center text-center px-8 py-14 md:py-20"
            style={{
              backgroundColor: i === 0 ? coreColors.primary : i === 1 ? coreColors.secondary : '#111111',
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 11px)`,
              }}
            />
            <h3
              className="relative z-10 text-2xl md:text-3xl lg:text-4xl leading-tight"
              style={{
                fontFamily: `'${headingFont}', sans-serif`,
                fontWeight: heaviestWeight,
                color: textOnColor(i === 0 ? coreColors.primary : i === 1 ? coreColors.secondary : '#111111'),
              }}
            >
              {ex}
            </h3>
          </TiltCard>
        ))}
      </div>

      {/* body copy + CTAs + vocabulary in editorial layout */}
      <div className="grid md:grid-cols-12 gap-8">
        {/* body copy */}
        <div className="md:col-span-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#1C2E5B', opacity: 0.7 }}>Body Copy Style</p>
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{ fontFamily: `'${bodyFont}', sans-serif`, color: '#1C2E5B', opacity: 0.6 }}
          >
            {voiceTone.bodyCopy}
          </p>
        </div>

        {/* CTAs as real buttons */}
        <div className="md:col-span-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#1C2E5B', opacity: 0.7 }}>Call-to-Action</p>
          <div className="flex flex-col gap-3">
            {voiceTone.ctaLanguage.map((cta, i) => (
              <button
                key={i}
                className="text-left px-5 py-3 rounded-xl text-sm font-bold transition-transform hover:scale-[1.02] cursor-default"
                style={{
                  fontFamily: `'${headingFont}', sans-serif`,
                  backgroundColor: i === 0 ? coreColors.primary : i === 1 ? coreColors.secondary : hexToRgba(coreColors.primary, 0.08),
                  color: i <= 1 ? (textOnColor(i === 0 ? coreColors.primary : coreColors.secondary)) : coreColors.primary,
                  fontWeight: heaviestWeight,
                }}
              >
                {cta}
              </button>
            ))}
          </div>
        </div>

        {/* vocabulary as editorial callouts */}
        <div className="md:col-span-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#1C2E5B', opacity: 0.7 }}>Key Vocabulary</p>
          <div className="flex flex-wrap gap-2">
            {voiceTone.vocabulary.map((word, i) => {
              const sizes = ['text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-lg', 'text-sm', 'text-xl', 'text-base', 'text-lg', 'text-sm'];
              const opacities = [1, 0.85, 0.7, 0.55, 0.8, 0.5, 0.9, 0.65, 0.75, 0.45];
              return (
                <span
                  key={i}
                  className={`${sizes[i % sizes.length]} font-bold leading-none py-1 px-1`}
                  style={{
                    fontFamily: `'${headingFont}', sans-serif`,
                    fontWeight: heaviestWeight,
                    color: coreColors.primary,
                    opacity: opacities[i % opacities.length],
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function activeColorsFallback(color) {
  return color || '#B22234';
}

/* ------------------------------------------------------------------ */
/*  MOCKUPS                                                           */
/* ------------------------------------------------------------------ */
function CampaignMockups({ colors, candidateName, headingFont, bodyFont, voiceTone }) {
  const headingMeta = FONT_LIBRARY[headingFont];
  const heaviestWeight = headingMeta?.weights?.[headingMeta.weights.length - 1] || 900;
  const lastName = candidateName?.split(' ').pop()?.toUpperCase() || 'SMITH';
  const firstName = candidateName?.split(' ')[0] || 'John';
  const headline = voiceTone?.headlineExamples?.[0] || 'Stand With Us.';
  const secondHeadline = voiceTone?.headlineExamples?.[1] || 'Lead. Protect. Deliver.';
  const cta = voiceTone?.ctaLanguage?.[0] || 'Learn More';

  return (
    <motion.div
      variants={stagger.item}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      style={sectionContainer}
    >
      <DecorativeDots style={{ bottom: -10, right: -10 }} />
      <p className="text-xs font-bold uppercase tracking-[0.25em] mb-8 px-2" style={{ color: '#1C2E5B', opacity: 0.7 }}>
        Campaign Materials Preview
      </p>

      <div className="space-y-8">
        {/* Row 1: yard sign + bumper sticker */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Yard Sign - large */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-3">Yard Sign</p>
            <div
              className="relative aspect-[3/2] rounded-xl shadow-2xl overflow-hidden flex flex-col items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <div className="absolute top-0 left-0 right-0 h-2.5" style={{ backgroundColor: colors.secondary }} />
              <div className="absolute bottom-0 left-0 right-0 h-2.5" style={{ backgroundColor: colors.secondary }} />
              {/* corner accents */}
              <div className="absolute top-2.5 left-0 w-12 h-1" style={{ backgroundColor: colors.secondary, opacity: 0.5 }} />
              <div className="absolute top-2.5 right-0 w-12 h-1" style={{ backgroundColor: colors.secondary, opacity: 0.5 }} />

              <div className="relative z-10 text-center px-6">
                <p
                  className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] mb-2"
                  style={{
                    fontFamily: `'${bodyFont}', sans-serif`,
                    color: colors.secondary,
                  }}
                >
                  Elect
                </p>
                <h4
                  className="text-4xl md:text-5xl lg:text-6xl tracking-tight"
                  style={{
                    fontFamily: `'${headingFont}', sans-serif`,
                    fontWeight: heaviestWeight,
                    color: colors.accent || '#FFFFFF',
                  }}
                >
                  {lastName}
                </h4>
                <div className="flex items-center gap-3 mt-3 justify-center">
                  <div className="h-px w-10" style={{ backgroundColor: hexToRgba(colors.accent || '#FFFFFF', 0.3) }} />
                  <div className="w-2 h-2 rotate-45" style={{ backgroundColor: colors.secondary }} />
                  <div className="h-px w-10" style={{ backgroundColor: hexToRgba(colors.accent || '#FFFFFF', 0.3) }} />
                </div>
              </div>
            </div>
          </div>

          {/* Bumper Sticker */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-3">Bumper Sticker</p>
            <div
              className="relative aspect-[3/1] rounded-lg shadow-2xl overflow-hidden flex items-center"
              style={{ backgroundColor: colors.primary }}
            >
              <div className="absolute inset-0 border-4 rounded-lg" style={{ borderColor: colors.secondary }} />
              <div className="relative z-10 flex items-center justify-between w-full px-6 md:px-8">
                <div>
                  <p
                    className="text-2xl md:text-3xl lg:text-4xl tracking-tight leading-none"
                    style={{
                      fontFamily: `'${headingFont}', sans-serif`,
                      fontWeight: heaviestWeight,
                      color: colors.accent || '#FFFFFF',
                    }}
                  >
                    {lastName}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-xs md:text-sm font-bold uppercase tracking-wider"
                    style={{
                      fontFamily: `'${bodyFont}', sans-serif`,
                      color: colors.secondary,
                    }}
                  >
                    {secondHeadline}
                  </p>
                </div>
              </div>
            </div>

            {/* Banner below bumper sticker */}
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-3 mt-6">Website Banner</p>
            <div
              className="relative h-20 md:h-24 rounded-lg shadow-2xl overflow-hidden flex items-center justify-between px-6 md:px-10"
              style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              }}
            >
              <div>
                <p
                  className="text-lg md:text-xl font-bold leading-tight"
                  style={{
                    fontFamily: `'${headingFont}', sans-serif`,
                    fontWeight: heaviestWeight,
                    color: '#FFFFFF',
                  }}
                >
                  {headline}
                </p>
                <p
                  className="text-xs mt-1 opacity-70"
                  style={{ fontFamily: `'${bodyFont}', sans-serif`, color: '#FFFFFF' }}
                >
                  {firstName} for Office &mdash; Paid for by Friends of {candidateName || 'Candidate'}
                </p>
              </div>
              <span
                className="hidden md:inline-block px-5 py-2.5 rounded-lg text-xs font-bold shrink-0"
                style={{
                  fontFamily: `'${headingFont}', sans-serif`,
                  backgroundColor: '#FFFFFF',
                  color: colors.primary,
                  fontWeight: heaviestWeight,
                }}
              >
                {cta}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: social post large */}
        <div className="grid md:grid-cols-12 gap-6">
          {/* Square social post */}
          <div className="md:col-span-5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-3">Social Media Post</p>
            <div
              className="aspect-square rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              style={{ backgroundColor: colors.background || '#F5F5F5' }}
            >
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-0">
                <p
                  className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mb-2 md:mb-3"
                  style={{
                    fontFamily: `'${bodyFont}', sans-serif`,
                    color: colors.secondary,
                  }}
                >
                  {firstName} for Office
                </p>
                <h4
                  className="text-2xl md:text-3xl lg:text-4xl leading-[1.1] mb-3 md:mb-4"
                  style={{
                    fontFamily: `'${headingFont}', sans-serif`,
                    fontWeight: heaviestWeight,
                    color: colors.primary,
                  }}
                >
                  {headline}
                </h4>
                <p
                  className="text-xs md:text-sm leading-relaxed max-w-[85%]"
                  style={{
                    fontFamily: `'${bodyFont}', sans-serif`,
                    color: colors.text || '#4A4A4A',
                  }}
                >
                  It is time to bring real leadership back to our community.
                </p>
              </div>
              <div
                className="px-5 md:px-8 py-3 md:py-4 flex items-center justify-between shrink-0"
                style={{ backgroundColor: colors.primary }}
              >
                <span
                  className="text-sm font-bold"
                  style={{
                    fontFamily: `'${headingFont}', sans-serif`,
                    color: colors.accent || '#FFFFFF',
                    fontWeight: heaviestWeight,
                  }}
                >
                  {candidateName || 'Candidate Name'}
                </span>
                <span
                  className="text-xs px-4 py-1.5 rounded-full font-bold"
                  style={{
                    backgroundColor: colors.secondary,
                    color: textOnColor(colors.secondary),
                    fontFamily: `'${bodyFont}', sans-serif`,
                  }}
                >
                  Learn More
                </span>
              </div>
            </div>
          </div>

          {/* Story-format / vertical social */}
          <div className="md:col-span-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-3">Social Story</p>
            <div
              className="aspect-[9/16] rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-end relative"
              style={{ backgroundColor: colors.primary }}
            >
              {/* background pattern */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.accent || '#fff'} 1px, transparent 0)`,
                  backgroundSize: '24px 24px',
                }}
              />
              <div className="relative z-10 p-6">
                <p
                  className="text-2xl md:text-3xl leading-tight mb-4"
                  style={{
                    fontFamily: `'${headingFont}', sans-serif`,
                    fontWeight: heaviestWeight,
                    color: colors.accent || '#FFFFFF',
                  }}
                >
                  {secondHeadline}
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: colors.secondary,
                      color: textOnColor(colors.secondary),
                      fontFamily: `'${headingFont}', sans-serif`,
                    }}
                  >
                    {(firstName[0] || 'J').toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: colors.accent || '#FFFFFF', fontFamily: `'${bodyFont}', sans-serif` }}>
                      {candidateName || 'Candidate'}
                    </p>
                    <p className="text-[10px] opacity-60" style={{ color: colors.accent || '#FFFFFF' }}>
                      Official Campaign
                    </p>
                  </div>
                </div>
                <div
                  className="w-full py-2.5 rounded-lg text-center text-xs font-bold"
                  style={{
                    backgroundColor: colors.secondary,
                    color: textOnColor(colors.secondary),
                    fontFamily: `'${headingFont}', sans-serif`,
                  }}
                >
                  {cta}
                </div>
              </div>
            </div>
          </div>

          {/* Stacked accent cards */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-0">Accent Samples</p>

            {/* Donation card */}
            <div
              className="flex-1 rounded-2xl p-6 flex flex-col justify-between shadow-lg"
              style={{ backgroundColor: colors.secondary }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wider opacity-80"
                style={{ color: textOnColor(colors.secondary), fontFamily: `'${bodyFont}', sans-serif` }}
              >
                Fundraising
              </p>
              <div>
                <p
                  className="text-xl md:text-2xl font-bold leading-tight mb-3"
                  style={{
                    fontFamily: `'${headingFont}', sans-serif`,
                    fontWeight: heaviestWeight,
                    color: textOnColor(colors.secondary),
                  }}
                >
                  Your $50 puts {firstName} on 1,000 doors.
                </p>
                <div
                  className="inline-block px-4 py-2 rounded-lg text-xs font-bold"
                  style={{
                    backgroundColor: textOnColor(colors.secondary),
                    color: colors.secondary,
                    fontFamily: `'${headingFont}', sans-serif`,
                  }}
                >
                  Donate Now
                </div>
              </div>
            </div>

            {/* Event invite card */}
            <div
              className="flex-1 rounded-2xl p-6 flex flex-col justify-between shadow-lg border border-gray-200"
              style={{ backgroundColor: colors.background || '#F5F5F5' }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wider text-gray-400"
                style={{ fontFamily: `'${bodyFont}', sans-serif` }}
              >
                Event
              </p>
              <div>
                <p
                  className="text-lg md:text-xl font-bold leading-tight mb-2"
                  style={{
                    fontFamily: `'${headingFont}', sans-serif`,
                    fontWeight: heaviestWeight,
                    color: colors.primary,
                  }}
                >
                  Town Hall with {firstName}
                </p>
                <p className="text-xs text-gray-500 mb-3" style={{ fontFamily: `'${bodyFont}', sans-serif` }}>
                  Hear the plan. Ask questions. Get involved.
                </p>
                <div
                  className="inline-block px-4 py-2 rounded-lg text-xs font-bold"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.accent || '#FFFFFF',
                    fontFamily: `'${headingFont}', sans-serif`,
                  }}
                >
                  RSVP
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}



/* ------------------------------------------------------------------ */
/*  MAIN EXPORT                                                       */
/* ------------------------------------------------------------------ */
export default function Stage6_VisualIdentity() {
  const { state } = useBrand();
  const coreData = state.brandCore ? BRAND_CORES[state.brandCore] : null;

  const defaultFonts = coreData?.fonts;

  // The active heading/body fonts used throughout the page
  const activeHeadingFont = state.customFonts?.heading || defaultFonts?.heading || 'Oswald';
  const activeBodyFont = state.customFonts?.body || defaultFonts?.body || 'Montserrat';

  // Load fonts for display
  const allFontsToLoad = useMemo(() => {
    const set = new Set();
    if (activeHeadingFont) set.add(activeHeadingFont);
    if (activeBodyFont) set.add(activeBodyFont);
    if (defaultFonts?.heading) set.add(defaultFonts.heading);
    if (defaultFonts?.body) set.add(defaultFonts.body);
    return [...set];
  }, [activeHeadingFont, activeBodyFont, defaultFonts]);

  useGoogleFonts(allFontsToLoad);

  const activeColors = useMemo(() => {
    if (state.colorMode === 'custom' && state.customColors.primary) {
      return {
        primary: state.customColors.primary,
        secondary: state.customColors.secondary || '#B22234',
        accent: state.customColors.accent || '#FFFFFF',
        background: '#F5F5F5',
        text: '#333333',
      };
    }
    return coreData?.colors || { primary: '#1C2E5B', secondary: '#B22234', accent: '#FFFFFF', background: '#F5F5F5', text: '#333333' };
  }, [state.colorMode, state.customColors, coreData]);

  const candidateName = state.candidate?.fullName || 'John Smith';

  if (!coreData) {
    return (
      <StageContainer title="Visual Identity" subtitle="Your brand, revealed." stageNumber={7}>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg" style={{ color: '#1C2E5B', opacity: 0.6 }}>Please complete the previous stages first.</p>
        </div>
      </StageContainer>
    );
  }

  return (
    <StageContainer
      title="Your Visual Identity"
      subtitle="Here is your complete brand system -- fonts, colors, voice, and mockups."
      stageNumber={7}
    >
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="visible"
        className="space-y-16 md:space-y-24"
      >
        {/* 1. Hero Brand Reveal */}
        <HeroBrandReveal
          coreData={coreData}
          activeColors={activeColors}
          candidateName={candidateName}
          headingFont={activeHeadingFont}
          bodyFont={activeBodyFont}
        />

        {/* 2. Font Showcase */}
        <FontShowcase
          fonts={{ heading: activeHeadingFont, body: activeBodyFont }}
          coreColors={activeColors}
          candidateName={candidateName}
          voiceTone={coreData.voiceTone}
        />

        {/* 3. Color Palette */}
        <ColorPaletteImmersive
          colors={activeColors}
          isCustom={state.colorMode === 'custom'}
        />

        {/* 4. Voice & Tone */}
        <VoiceToneEditorial
          voiceTone={coreData.voiceTone}
          coreColors={activeColors}
          headingFont={activeHeadingFont}
          bodyFont={activeBodyFont}
        />

        {/* 5. Campaign Mockups */}
        <CampaignMockups
          colors={activeColors}
          candidateName={candidateName}
          headingFont={activeHeadingFont}
          bodyFont={activeBodyFont}
          voiceTone={coreData.voiceTone}
        />
      </motion.div>
    </StageContainer>
  );
}
