import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import { sanitizeFreeText, sanitizeShortText } from '../../utils/sanitize';
import { PROFESSIONAL_BACKGROUNDS, POLICY_PRIORITIES } from '../../data/brandData';
import StageContainer from '../StageContainer';
import TiltCard from '../TiltCard';
import AnimatedCheckmark from '../AnimatedCheckmark';
import {
  Shield, Briefcase, Scale, HeartPulse, Wheat, BookOpen,
  Church, Landmark, Wrench, Monitor, Medal,
  TrendingUp, Target, Heart, CheckSquare, GraduationCap,
  Zap, DollarSign, Eye, Building2, Leaf, ShieldCheck, PlusCircle,
} from 'lucide-react';

const PRIMARY = '#8B1A2B';
const NAVY = '#1C2E5B';

const ICON_SIZE = 22;

const BACKGROUND_ICONS = {
  military: <Medal size={ICON_SIZE} />,
  'law-enforcement': <ShieldCheck size={ICON_SIZE} />,
  business: <Briefcase size={ICON_SIZE} />,
  attorney: <Scale size={ICON_SIZE} />,
  medical: <HeartPulse size={ICON_SIZE} />,
  agriculture: <Wheat size={ICON_SIZE} />,
  education: <BookOpen size={ICON_SIZE} />,
  faith: <Church size={ICON_SIZE} />,
  'public-service': <Landmark size={ICON_SIZE} />,
  'blue-collar': <Wrench size={ICON_SIZE} />,
  tech: <Monitor size={ICON_SIZE} />,
};

const POLICY_ICONS = {
  border: <Shield size={ICON_SIZE} />,
  economy: <TrendingUp size={ICON_SIZE} />,
  '2a': <Target size={ICON_SIZE} />,
  'pro-life': <Heart size={ICON_SIZE} />,
  election: <CheckSquare size={ICON_SIZE} />,
  education: <GraduationCap size={ICON_SIZE} />,
  veterans: <Medal size={ICON_SIZE} />,
  'law-order': <Scale size={ICON_SIZE} />,
  energy: <Zap size={ICON_SIZE} />,
  healthcare: <HeartPulse size={ICON_SIZE} />,
  tax: <DollarSign size={ICON_SIZE} />,
  'religious-liberty': <Church size={ICON_SIZE} />,
  accountability: <Eye size={ICON_SIZE} />,
  infrastructure: <Building2 size={ICON_SIZE} />,
  agriculture: <Leaf size={ICON_SIZE} />,
};

const bounceKeyframes = `
@keyframes iconBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
`;

export default function Stage2_CandidateProfile() {
  const { state, dispatch } = useBrand();
  const { profile } = state;
  const [endorsementInput, setEndorsementInput] = useState('');

  const update = (payload) => dispatch({ type: 'UPDATE_PROFILE', payload });

  const toggleBackground = (id) => {
    const current = profile.backgrounds || [];
    if (current.includes(id)) {
      const updated = current.filter((b) => b !== id);
      update({ backgrounds: updated, ...(id === 'other' ? { backgroundOther: '' } : {}) });
    } else if (current.length < 2) {
      update({ backgrounds: [...current, id] });
    }
  };

  const togglePriority = (id) => {
    const current = profile.policyPriorities || [];
    if (current.includes(id)) {
      const updated = current.filter((p) => p !== id);
      update({ policyPriorities: updated, ...(id === 'other-policy' ? { policyOther: '' } : {}) });
    } else if (current.length < 3) {
      update({ policyPriorities: [...current, id] });
    }
  };

  const addEndorsement = (value) => {
    const trimmed = sanitizeShortText(value).trim();
    if (trimmed && !(profile.endorsements || []).includes(trimmed)) {
      update({ endorsements: [...(profile.endorsements || []), trimmed] });
    }
    setEndorsementInput('');
  };

  const removeEndorsement = (val) => {
    update({ endorsements: (profile.endorsements || []).filter((e) => e !== val) });
  };

  const backgrounds = profile.backgrounds || [];
  const priorities = profile.policyPriorities || [];
  const endorsements = profile.endorsements || [];
  const storyLen = (profile.definingStory || '').length;
  const backgroundOtherSelected = backgrounds.includes('other');
  const policyOtherSelected = priorities.includes('other-policy');

  return (
    <StageContainer
      stageNumber={2}
      title={`${state.candidate.fullName || 'Candidate'}'s Profile`}
      subtitle="Your background and priorities shape your brand. Select what defines you."
    >
      <style>{bounceKeyframes}</style>

      {/* ── SECTION 1: Professional Background ── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-12"
      >
        <div className="mb-5">
          <span className="text-sm font-semibold text-gray-700">
            Professional Background{' '}
          </span>
          <span className="text-sm font-semibold" style={{ color: PRIMARY }}>
            (Select up to 2)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PROFESSIONAL_BACKGROUNDS.map((bg) => {
            const selected = backgrounds.includes(bg.id);
            const atMax = backgrounds.length >= 2;
            const disabled = !selected && atMax;
            const icon = BACKGROUND_ICONS[bg.id];

            return (
              <TiltCard
                key={bg.id}
                onClick={() => !disabled && toggleBackground(bg.id)}
                className={`group flex flex-col items-center justify-center gap-2 px-3 py-5 rounded-xl border transition-all duration-200 ${
                  selected
                    ? 'text-white shadow-lg border-transparent'
                    : disabled
                    ? 'bg-white text-gray-300 border-gray-200 opacity-50 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 cursor-pointer'
                }`}
                style={selected ? { backgroundColor: PRIMARY, borderColor: PRIMARY } : {}}
              >
                {selected && (
                  <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 20 }}>
                    <AnimatedCheckmark size={20} color="#FFFFFF" />
                  </div>
                )}
                <span
                  className="block"
                  style={{ color: selected ? '#fff' : PRIMARY, transition: 'transform 0.2s ease' }}
                  onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.animation = 'iconBounce 0.45s ease-in-out'; }}
                  onAnimationEnd={(e) => { e.currentTarget.style.animation = ''; }}
                >
                  {icon}
                </span>
                <span className={`text-xs font-semibold text-center leading-tight ${selected ? 'text-white' : ''}`}>
                  {bg.label}
                </span>
              </TiltCard>
            );
          })}

          {/* Other — background */}
          {(() => {
            const selected = backgroundOtherSelected;
            const atMax = backgrounds.length >= 2;
            const disabled = !selected && atMax;
            return (
              <TiltCard
                onClick={() => !disabled && toggleBackground('other')}
                className={`group flex flex-col items-center justify-center gap-2 px-3 py-5 rounded-xl border transition-all duration-200 ${
                  selected
                    ? 'text-white shadow-lg border-transparent'
                    : disabled
                    ? 'bg-white text-gray-300 border-gray-200 opacity-50 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 cursor-pointer'
                }`}
                style={selected ? { backgroundColor: PRIMARY, borderColor: PRIMARY } : {}}
              >
                {selected && (
                  <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 20 }}>
                    <AnimatedCheckmark size={20} color="#FFFFFF" />
                  </div>
                )}
                <span
                  className="block"
                  style={{ color: selected ? '#fff' : PRIMARY }}
                  onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.animation = 'iconBounce 0.45s ease-in-out'; }}
                  onAnimationEnd={(e) => { e.currentTarget.style.animation = ''; }}
                >
                  <PlusCircle size={ICON_SIZE} />
                </span>
                <span className={`text-xs font-semibold text-center leading-tight ${selected ? 'text-white' : ''}`}>
                  Other
                </span>
              </TiltCard>
            );
          })()}
        </div>

        {/* Other background — text input */}
        <AnimatePresence>
          {backgroundOtherSelected && (
            <motion.div
              key="bg-other-input"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ overflow: 'hidden' }}
            >
              <input
                type="text"
                value={profile.backgroundOther || ''}
                onChange={(e) => update({ backgroundOther: sanitizeFreeText(e.target.value) })}
                placeholder="e.g. Veterinarian, nonprofit director, small-business owner"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none"
                style={{ fontSize: '0.95rem' }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${PRIMARY}33`; e.currentTarget.style.borderColor = PRIMARY; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* ── SECTION 2: Policy Priorities ── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
        <div className="mb-5">
          <span className="text-sm font-semibold text-gray-700">
            Top 3 Policy Priorities{' '}
          </span>
          <span className="text-sm font-semibold" style={{ color: PRIMARY }}>
            (Select exactly 3)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {POLICY_PRIORITIES.map((policy) => {
            const selected = priorities.includes(policy.id);
            const atMax = priorities.length >= 3;
            const disabled = !selected && atMax;
            const icon = POLICY_ICONS[policy.id];

            return (
              <TiltCard
                key={policy.id}
                onClick={() => !disabled && togglePriority(policy.id)}
                className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 ${
                  selected
                    ? 'text-white shadow-lg border-transparent'
                    : disabled
                    ? 'bg-white text-gray-300 border-gray-200 opacity-50 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 cursor-pointer'
                }`}
                style={selected ? { backgroundColor: PRIMARY, borderColor: PRIMARY } : {}}
              >
                {selected && (
                  <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 20 }}>
                    <AnimatedCheckmark size={20} color="#FFFFFF" />
                  </div>
                )}
                <span
                  className="flex-shrink-0"
                  style={{ color: selected ? '#fff' : PRIMARY, transition: 'transform 0.2s ease' }}
                  onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.animation = 'iconBounce 0.45s ease-in-out'; }}
                  onAnimationEnd={(e) => { e.currentTarget.style.animation = ''; }}
                >
                  {icon}
                </span>
                <span className={`text-sm font-semibold ${selected ? 'text-white' : ''}`}>
                  {policy.label}
                </span>
              </TiltCard>
            );
          })}

          {/* Other — policy */}
          {(() => {
            const selected = policyOtherSelected;
            const atMax = priorities.length >= 3;
            const disabled = !selected && atMax;
            return (
              <TiltCard
                onClick={() => !disabled && togglePriority('other-policy')}
                className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 ${
                  selected
                    ? 'text-white shadow-lg border-transparent'
                    : disabled
                    ? 'bg-white text-gray-300 border-gray-200 opacity-50 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 cursor-pointer'
                }`}
                style={selected ? { backgroundColor: PRIMARY, borderColor: PRIMARY } : {}}
              >
                {selected && (
                  <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 20 }}>
                    <AnimatedCheckmark size={20} color="#FFFFFF" />
                  </div>
                )}
                <span
                  className="flex-shrink-0"
                  style={{ color: selected ? '#fff' : PRIMARY }}
                  onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.animation = 'iconBounce 0.45s ease-in-out'; }}
                  onAnimationEnd={(e) => { e.currentTarget.style.animation = ''; }}
                >
                  <PlusCircle size={ICON_SIZE} />
                </span>
                <span className={`text-sm font-semibold ${selected ? 'text-white' : ''}`}>
                  Other
                </span>
              </TiltCard>
            );
          })()}
        </div>

        {/* Other policy — text input */}
        <AnimatePresence>
          {policyOtherSelected && (
            <motion.div
              key="policy-other-input"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ overflow: 'hidden' }}
            >
              <input
                type="text"
                value={profile.policyOther || ''}
                onChange={(e) => update({ policyOther: sanitizeFreeText(e.target.value) })}
                placeholder="e.g. Mental health reform, housing affordability, water rights"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none"
                style={{ fontSize: '0.95rem' }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${PRIMARY}33`; e.currentTarget.style.borderColor = PRIMARY; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* ── SECTION 3: Your Defining Moment ── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-12"
      >
        <div className="mb-4">
          <span className="text-sm font-semibold text-gray-700">
            Your Defining Moment{' '}
          </span>
          <span className="text-sm text-gray-400">(Optional)</span>
        </div>

        <textarea
          value={profile.definingStory || ''}
          onChange={(e) => {
            update({ definingStory: sanitizeFreeText(e.target.value) });
          }}
          placeholder="e.g. After watching my own district's schools cut veterans programs, I knew I had to run..."
          rows={5}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 resize-none transition-all duration-200 focus:outline-none"
          style={{
            fontSize: '0.95rem',
            lineHeight: '1.7',
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = `0 0 0 2px ${PRIMARY}33`;
            e.currentTarget.style.borderColor = PRIMARY;
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        />
        <div className="flex justify-end mt-1.5">
          <span
            className={`text-xs tabular-nums ${
              storyLen >= 500
                ? 'text-red-500 font-semibold'
                : storyLen >= 450
                ? 'text-amber-500'
                : 'text-gray-400'
            }`}
          >
            {storyLen}/500 characters
          </span>
        </div>
      </motion.section>

      {/* ── SECTION 4: Key Endorsements ── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-4"
      >
        <div className="mb-4">
          <span className="text-sm font-semibold text-gray-700">
            Key Endorsements{' '}
          </span>
          <span className="text-sm text-gray-400">(Optional)</span>
        </div>

        {/* Endorsement tags */}
        <AnimatePresence>
          {endorsements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mb-4"
            >
              {endorsements.map((endorsement) => (
                <motion.span
                  key={endorsement}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  layout
                  className="inline-flex items-center gap-2 pl-4 pr-3 py-2 text-sm font-semibold rounded-full border-2"
                  style={{
                    borderColor: PRIMARY,
                    color: PRIMARY,
                    backgroundColor: 'white',
                  }}
                >
                  {endorsement}
                  <button
                    onClick={() => removeEndorsement(endorsement)}
                    className="ml-0.5 hover:opacity-70 transition-opacity rounded-full flex items-center justify-center"
                    style={{ color: PRIMARY }}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <input
            type="text"
            value={endorsementInput}
            onChange={(e) => setEndorsementInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addEndorsement(endorsementInput);
              }
            }}
            placeholder="e.g. Sheriff Jones — then press Enter"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none"
            style={{ fontSize: '0.95rem' }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = `0 0 0 2px ${PRIMARY}33`;
              e.currentTarget.style.borderColor = PRIMARY;
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          />
        </div>
      </motion.section>
    </StageContainer>
  );
}
