import { createContext, useContext, useReducer, useCallback } from 'react';
import { BRAND_CORES } from '../data/brandData';

const BrandContext = createContext();

const initialState = {
  currentStage: 0,
  completedStages: [],
  candidate: {
    fullName: '',
    office: '',
    state: '',
    district: '',
    electionYear: '',
    raceFocus: 'primary',
    candidateType: '',
    partyAffiliation: 'Republican',
  },
  profile: {
    backgrounds: [],
    policyPriorities: [],
    definingStory: '',
    familyStatus: '',
    endorsements: [],
  },
  brandCore: null,
  subDirection: null,
  colorMode: null,
  customColors: { primary: null, secondary: null, accent: null, background: null, text: null, highlight: null },
  websiteCopy: {
    hero: '',
    about: '',
    issues: ['', '', ''],
    endorsements: '',
    volunteer: '',
    donate: '',
    events: '',
    contact: '',
  },
  customFonts: { heading: null, body: null },
  logoType: null,
  collateralPriorities: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STAGE':
      return { ...state, currentStage: action.payload };
    case 'COMPLETE_STAGE':
      return {
        ...state,
        completedStages: [...new Set([...state.completedStages, action.payload])],
      };
    case 'UPDATE_CANDIDATE':
      return { ...state, candidate: { ...state.candidate, ...action.payload } };
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'SET_BRAND_CORE':
      return { ...state, brandCore: action.payload, subDirection: null };
    case 'SET_SUB_DIRECTION':
      return { ...state, subDirection: action.payload };
    case 'SET_COLOR_MODE':
      return { ...state, colorMode: action.payload };
    case 'SET_CUSTOM_COLORS':
      return { ...state, customColors: { ...state.customColors, ...action.payload } };
    case 'UPDATE_WEBSITE_COPY':
      return { ...state, websiteCopy: { ...state.websiteCopy, ...action.payload } };
    case 'SET_CUSTOM_FONTS':
      return { ...state, customFonts: { ...state.customFonts, ...action.payload } };
    case 'SET_LOGO_TYPE':
      return { ...state, logoType: action.payload };
    case 'SET_COLLATERAL_PRIORITIES':
      return { ...state, collateralPriorities: action.payload };
    case 'NEXT_STAGE':
      return {
        ...state,
        completedStages: [...new Set([...state.completedStages, state.currentStage])],
        currentStage: state.currentStage + 1,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function BrandProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const scrollTop = () => {
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 50);
  };

  const goToStage = useCallback((stage) => {
    dispatch({ type: 'SET_STAGE', payload: stage });
    scrollTop();
  }, []);

  const nextStage = useCallback(() => {
    dispatch({ type: 'NEXT_STAGE' });
    scrollTop();
  }, []);

  const prevStage = useCallback(() => {
    dispatch({ type: 'SET_STAGE', payload: Math.max(0, state.currentStage - 1) });
    scrollTop();
  }, [state.currentStage]);

  const getActiveColors = useCallback(() => {
    if (state.colorMode === 'custom' && state.customColors.primary) {
      return {
        primary: state.customColors.primary,
        secondary: state.customColors.secondary,
        accent: state.customColors.accent,
        background: state.customColors.background || '#F5F5F5',
        text: state.customColors.text || '#333333',
        highlight: state.customColors.highlight || state.customColors.secondary,
      };
    }
    if (state.brandCore && BRAND_CORES[state.brandCore]) {
      const c = BRAND_CORES[state.brandCore].colors;
      return { ...c, highlight: c.highlight || c.secondary };
    }
    return { primary: '#1C2E5B', secondary: '#B22234', accent: '#FFFFFF', background: '#F5F5F5', text: '#333333', highlight: '#B22234' };
  }, [state.colorMode, state.customColors, state.brandCore]);

  return (
    <BrandContext.Provider value={{ state, dispatch, goToStage, nextStage, prevStage, getActiveColors }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) throw new Error('useBrand must be used within a BrandProvider');
  return context;
}
