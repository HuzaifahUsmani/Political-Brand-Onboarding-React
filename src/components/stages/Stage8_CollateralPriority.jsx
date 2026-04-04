import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import StageContainer from '../StageContainer';

const PRICE_PER_MATERIAL = 350;

const MATERIAL_TYPES = [
  {
    id: 'yard-signs',
    name: 'Yard Signs',
    description: 'Double-sided corrugated yard signs with H-stakes included.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M9 21V9m6 12V9M4 9h16l-2-4H6L4 9z" />
      </svg>
    ),
  },
  {
    id: 'business-cards',
    name: 'Business Cards',
    description: 'Premium matte or glossy cards with your brand identity.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
      </svg>
    ),
  },
  {
    id: 'flyers',
    name: 'Flyers',
    description: 'Full-color 8.5x11 flyers, single or double-sided layouts.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h10" />
      </svg>
    ),
  },
  {
    id: 'door-hangers',
    name: 'Door Hangers',
    description: 'Die-cut door hangers for canvassing and outreach.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    id: 'bumper-stickers',
    name: 'Bumper Stickers',
    description: 'Weather-resistant vinyl stickers for vehicles and surfaces.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10M7 11h6m-9 8h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'banners',
    name: 'Banners',
    description: 'Large format banners for events, rallies, and offices.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    id: 'postcards',
    name: 'Postcards',
    description: 'USPS-ready postcards for direct mail campaigns.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 't-shirts',
    name: 'T-Shirts',
    description: 'Custom branded apparel designs, print-ready files included.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    id: 'social-media-kit',
    name: 'Social Media Kit',
    description: 'Templates for Facebook, Instagram, Twitter, and more.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    id: 'letterhead-envelopes',
    name: 'Letterhead & Envelopes',
    description: 'Professional stationery suite with matching designs.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

function MaterialCard({ material, isSelected, onToggle }) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full text-left"
      style={{ outline: 'none' }}
    >
      <div
        className="flex items-center gap-4 p-5 rounded-xl transition-all duration-200"
        style={{
          background: isSelected ? '#fdf2f3' : '#ffffff',
          borderLeft: isSelected ? '4px solid #8B1A2B' : '4px solid transparent',
          border: isSelected ? undefined : '1px solid #e5e7eb',
          borderLeftWidth: '4px',
          borderLeftStyle: 'solid',
          borderLeftColor: isSelected ? '#8B1A2B' : 'transparent',
          boxShadow: isSelected
            ? '0 1px 3px rgba(139, 26, 43, 0.1)'
            : '0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center w-11 h-11 rounded-lg shrink-0"
          style={{
            backgroundColor: isSelected ? '#fce4e8' : '#f3f4f6',
            color: isSelected ? '#8B1A2B' : '#6b7280',
          }}
        >
          {material.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold"
            style={{ color: '#1a1a1a' }}
          >
            {material.name}
          </p>
          <p
            className="text-xs mt-0.5 leading-relaxed"
            style={{ color: '#6b7280' }}
          >
            {material.description}
          </p>
        </div>

        {/* Price */}
        <div className="text-right shrink-0 mr-2">
          <p className="text-sm font-bold" style={{ color: '#1C2E5B' }}>
            ${PRICE_PER_MATERIAL}
          </p>
        </div>

        {/* Checkbox */}
        <div
          className="flex items-center justify-center w-6 h-6 rounded shrink-0 transition-colors duration-200"
          style={{
            backgroundColor: isSelected ? '#8B1A2B' : '#ffffff',
            border: isSelected ? '2px solid #8B1A2B' : '2px solid #d1d5db',
          }}
        >
          {isSelected && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export default function Stage8_CollateralPriority() {
  const { state, dispatch } = useBrand();
  const [showMaterials, setShowMaterials] = useState(null); // null = not decided, true = yes, false = no

  // Sync local view state from context on mount
  const selectedIds = Array.isArray(state.collateralPriorities)
    ? state.collateralPriorities
    : [];

  const toggleMaterial = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    dispatch({ type: 'SET_COLLATERAL_PRIORITIES', payload: next });
  };

  const total = useMemo(
    () => selectedIds.length * PRICE_PER_MATERIAL,
    [selectedIds]
  );

  const selectedMaterials = useMemo(
    () => MATERIAL_TYPES.filter((m) => selectedIds.includes(m.id)),
    [selectedIds]
  );

  // If user previously selected materials, go straight to materials view
  const effectiveShowMaterials =
    showMaterials !== null ? showMaterials : selectedIds.length > 0 ? true : null;

  return (
    <StageContainer
      title="Campaign Materials"
      subtitle="Select the print and digital materials you need for your campaign."
      stageNumber={7}
      hideNavigation={effectiveShowMaterials === null}
    >
      {/* Opening question */}
      {effectiveShowMaterials === null && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            borderRadius: 16,
            background: '#ffffff',
            padding: 48,
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <h3
            className="text-xl font-bold mb-2"
            style={{ color: '#1C2E5B' }}
          >
            Would you like any additional campaign materials?
          </h3>
          <p className="text-sm mb-8" style={{ color: '#6b7280' }}>
            Professional print-ready files for yard signs, flyers, apparel, and more.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setShowMaterials(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold transition-colors duration-200"
              style={{
                backgroundColor: '#8B1A2B',
                color: '#ffffff',
              }}
            >
              Yes, show me options
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMaterials(false);
                dispatch({ type: 'SET_COLLATERAL_PRIORITIES', payload: [] });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold transition-colors duration-200"
              style={{
                backgroundColor: '#f3f4f6',
                color: '#374151',
              }}
            >
              No, skip this step
            </button>
          </div>
        </motion.div>
      )}

      {/* Skip message */}
      {effectiveShowMaterials === false && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            borderRadius: 16,
            background: '#ffffff',
            padding: 48,
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#f3f4f6' }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#1C2E5B' }}>
            No materials selected
          </h3>
          <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
            You can always come back to add campaign materials later.
          </p>
          <button
            type="button"
            onClick={() => setShowMaterials(true)}
            className="text-sm font-medium underline transition-colors duration-200"
            style={{ color: '#8B1A2B' }}
          >
            Changed your mind? Browse materials
          </button>
        </motion.div>
      )}

      {/* Material selection */}
      <AnimatePresence>
        {effectiveShowMaterials === true && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Materials list */}
            <div
              style={{
                borderRadius: 16,
                background: '#ffffff',
                padding: 32,
                marginBottom: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: '#1C2E5B' }}>
                    Available Materials
                  </h3>
                  <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                    ${PRICE_PER_MATERIAL} per material type — select as many as you need
                  </p>
                </div>
                <span
                  className="text-xs font-medium px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: selectedIds.length > 0 ? '#fdf2f3' : '#f3f4f6',
                    color: selectedIds.length > 0 ? '#8B1A2B' : '#6b7280',
                  }}
                >
                  {selectedIds.length} selected
                </span>
              </div>

              <div className="space-y-3">
                {MATERIAL_TYPES.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    isSelected={selectedIds.includes(material.id)}
                    onToggle={() => toggleMaterial(material.id)}
                  />
                ))}
              </div>
            </div>

            {/* Running total */}
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  borderRadius: 16,
                  background: '#ffffff',
                  padding: 32,
                  marginBottom: 24,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                <h3 className="text-lg font-bold mb-4" style={{ color: '#1C2E5B' }}>
                  Order Summary
                </h3>

                <div className="space-y-2 mb-4">
                  {selectedMaterials.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between py-2"
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                      }}
                    >
                      <span className="text-sm" style={{ color: '#374151' }}>
                        {m.name}
                      </span>
                      <span className="text-sm font-medium" style={{ color: '#374151' }}>
                        ${PRICE_PER_MATERIAL}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  className="flex items-center justify-between pt-4"
                  style={{ borderTop: '2px solid #1C2E5B' }}
                >
                  <span className="text-base font-bold" style={{ color: '#1C2E5B' }}>
                    Total
                  </span>
                  <span className="text-xl font-bold" style={{ color: '#1C2E5B' }}>
                    ${total.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Delivery info */}
            <div
              style={{
                borderRadius: 16,
                background: '#ffffff',
                padding: 24,
                marginBottom: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5"
                  style={{ backgroundColor: '#f0f4ff' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#1C2E5B" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1C2E5B' }}>
                    Delivery: 2 weeks
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                    All materials will be print-ready.
                  </p>
                </div>
              </div>

              <div
                className="rounded-lg px-4 py-3"
                style={{
                  backgroundColor: '#fafafa',
                  border: '1px solid #e5e7eb',
                }}
              >
                <p className="text-xs" style={{ color: '#6b7280' }}>
                  Need it sooner? Call our sales team at{' '}
                  <span className="font-semibold" style={{ color: '#1C2E5B' }}>
                    (555) 123-4567
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </StageContainer>
  );
}
