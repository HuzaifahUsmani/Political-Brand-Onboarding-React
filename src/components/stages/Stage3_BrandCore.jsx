import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import { BRAND_CORES } from '../../data/brandData';
import StageContainer from '../StageContainer';
import AnimatedCheckmark from '../AnimatedCheckmark';

const BRAND_KEYS = ['commander', 'patriot', 'reformer', 'community', 'executive'];

export default function Stage3_BrandCore() {
  const { state, dispatch } = useBrand();
  const [hoveredId, setHoveredId] = useState(null);
  const selectedId = state.brandCore;

  const selectBrand = (id) => {
    dispatch({ type: 'SET_BRAND_CORE', payload: id === selectedId ? null : id });
  };

  return (
    <StageContainer
      stageNumber={3}
      title="Choose Your Brand Core"
      subtitle="This is the defining moment. Select the brand archetype that best represents the candidate's identity and campaign."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {BRAND_KEYS.map((key, index) => {
          const brand = BRAND_CORES[key];
          const isSelected = selectedId === key;
          const isHovered = hoveredId === key;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              onClick={() => selectBrand(key)}
              onMouseEnter={() => setHoveredId(key)}
              onMouseLeave={() => setHoveredId(null)}
              whileHover={!isSelected ? {
                y: -2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              } : {}}
              style={{
                position: 'relative',
                cursor: 'pointer',
                padding: 24,
                background: isSelected ? '#FEF2F2' : '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderLeft: isSelected ? '4px solid #8B1A2B' : '1px solid #E5E7EB',
                borderRadius: 8,
                boxShadow: isSelected
                  ? '0 1px 3px rgba(0,0,0,0.08)'
                  : '0 1px 3px rgba(0,0,0,0.08)',
                transition: 'background 0.2s ease, border 0.2s ease',
              }}
            >
              {/* Checkmark indicator top-right */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
                  >
                    <AnimatedCheckmark size={32} color="#8B1A2B" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Title */}
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#1C2E5B',
                margin: 0,
                marginBottom: 4,
              }}>
                {brand.name}
              </h3>

              {/* Descriptor */}
              <p style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#6B7280',
                margin: 0,
                marginBottom: 8,
              }}>
                {brand.descriptor}
              </p>

              {/* Tagline */}
              <p style={{
                fontSize: '0.95rem',
                fontStyle: 'italic',
                color: '#4B5563',
                margin: 0,
                marginBottom: 12,
              }}>
                &ldquo;{brand.tagline}&rdquo;
              </p>

              {/* Positioning statement */}
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 400,
                color: '#374151',
                margin: 0,
                marginBottom: 12,
                lineHeight: 1.6,
              }}>
                {brand.positioning}
              </p>

              {/* Best-for text from subDirections */}
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 400,
                color: '#6B7280',
                margin: 0,
                lineHeight: 1.5,
              }}>
                <span style={{ fontWeight: 600, color: '#4B5563' }}>Best for: </span>
                {brand.subDirections.map((sd) => sd.bestFor).join(' · ')}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Selected brand summary */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              marginTop: 24,
              padding: 24,
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderLeft: '4px solid #1C2E5B',
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: '#1C2E5B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1C2E5B', margin: 0, marginBottom: 4 }}>
                  {BRAND_CORES[selectedId].name} Selected
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                  {BRAND_CORES[selectedId].philosophy}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </StageContainer>
  );
}
