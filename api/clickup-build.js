/**
 * Build ClickUp custom_fields[] for the Political Brand Onboarding Form
 * list from sanitized form `payload` + raw `state` (needed for nested objects
 * like customColors, customFonts, profile arrays). Mirrors campaign-intake
 * pattern. Drop-downs are sent as orderindex INTEGERS.
 */

import { FIELD_IDS, FIELD_TYPES, PRIMARY_LIST_ID } from './clickup-field-map.js';

/** Other lists that hold dropdown definitions for workspace-shared fields
 *  we now write from this form (PAC Type, Nonprofit Type, FEC Status, etc.).
 *  Campaign Intake (Form 1) and Sales Active Deals both define these — we
 *  pull from both so resolveOption can find the option set. */
const SECONDARY_OPTION_LISTS = [
  '901113726567', // Campaign Intake — defines most PAC + Nonprofit dropdowns
  '901113549967', // Sales Active Deals — defines Subject Type, Election Year, signing-authority fields
];

/** Form sends short kebab IDs like `federal` or `c3` for some dropdowns,
 *  but ClickUp's option names are full labels (`Federal PAC`,
 *  `501(c)(3) - Charitable`). This per-field translation table maps the
 *  form ID to the exact ClickUp option name so resolveOption matches by
 *  name. Keyed by field name as it appears in FIELD_IDS. */
const FORM_ID_TO_OPTION_NAME = {
  'PAC Type': {
    'federal':    'Federal PAC',
    'state':      'State PAC',
    'super':      'Super PAC',
    'hybrid':     'Hybrid PAC',
    'carey':      'Carey Committee',
    'leadership': 'Leadership PAC',
    'other':      'Other',
  },
  'FEC Registration Status': {
    'registered':    'Registered',
    'in-progress':   'In Progress',
    'not-yet':       'Not Yet',
    'na-state-only': 'N/A (state-only)',
  },
  'Nonprofit Type': {
    'c3':    '501(c)(3) - Charitable',
    'c4':    '501(c)(4) - Social Welfare / Advocacy',
    'c6':    '501(c)(6) - Trade Association',
    '527':   '527 / Political Org',
    'other': 'Other',
  },
  'Lobbying Activity': {
    'none':               'None',
    'insubstantial':      'Insubstantial (c3 substantial-part test)',
    '501h-elected':       '501(h) elected (c3)',
    'primary-purpose-c4': 'Primary purpose (c4)',
    'na':                 'N/A',
  },
  'IRS Determination Status': {
    'approved':           'Approved',
    'pending':            'Pending',
    'revoked':            'Revoked',
    'fiscally-sponsored': 'Fiscally Sponsored',
    'na':                 'N/A',
  },
  'Nonprofit Tone Anchor': {
    'advocacy': 'Advocacy',
    'service':  'Service',
    'research': 'Research / Policy',
    'member':   'Member-Facing',
    'donor':    'Donor-Facing',
  },
  'Subject Type': {
    'candidate': 'Candidate',
    'party':     'Party',
    'pac':       'PAC',
    'nonprofit': 'Nonprofit',
  },
  // Brand Core: form ids case-match ClickUp option names except for
  // 'nonpartisan' (CU labels it 'Non-Partisan' with a hyphen). Without
  // this map, `nonpartisan` selections silently drop in resolveOption.
  'Brand Core': {
    'nonpartisan': 'Non-Partisan',
  },
};

/** Labels fields where the form sends slug IDs (e.g. 'border') and the
 *  ClickUp option names are user-friendly labels (e.g. 'Border &
 *  Immigration'). Source of truth: src/data/brandData.js. Without these
 *  translations, resolveLabels matches nothing and the field stays empty.
 *  Keyed by ClickUp field name. */
const LABELS_SLUG_TO_NAME = {
  'Platform Pillars': {
    // Party + PAC issue focus share this field
    'border':           'Border & Immigration',
    'economy':          'Economy & Jobs',
    'tax':              'Lower Taxes',
    '2a':               '2nd Amendment',
    'pro-life':         'Pro-Life',
    'religious-liberty':'Religious Liberty',
    'parental-rights':  'Parental Rights',
    'election':         'Election Integrity',
    'law-order':        'Law & Order',
    'energy':           'Energy Independence',
    'education':        'Education Reform',
    'healthcare':       'Healthcare',
    'veterans':         'Veterans',
    'limited-gov':      'Limited Government',
    'free-speech':      'Free Speech',
    'accountability':   'Government Accountability',
    'agriculture':      'Agriculture & Rural',
    'infrastructure':   'Infrastructure',
    'other':            'Other',
  },
  'Target Voter Segments': {
    // Party segments; PAC donors and Nonprofit audiences also write here.
    'working-class':    'Working Class',
    'suburban':         'Suburban Families',
    'rural':            'Rural Voters',
    'evangelical':      'Evangelical / Faith Communities',
    'small-business':   'Small Business Owners',
    'veterans':         'Veterans & Military Families',
    'youth':            'Youth (Under 35)',
    'minority':         'Minority Communities',
    'parents':          'Parents of School-Age Children',
    'libertarian':      'Libertarian-Leaning',
    'independent':      'Independent / Swing Voters',
    'first-time':       'First-Time Voters',
    'other':            'Other',
  },
};

const empty = (v) =>
  v === undefined || v === null ||
  (typeof v === 'string' && v.trim() === '') ||
  (Array.isArray(v) && v.length === 0);

export async function getDropdownOptionsMap() {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) throw new Error('CLICKUP_API_TOKEN missing');
  const listIds = [PRIMARY_LIST_ID, ...SECONDARY_OPTION_LISTS];
  const map = {};
  for (const listId of listIds) {
    try {
      const r = await fetch(
        `https://api.clickup.com/api/v2/list/${listId}/field`,
        { headers: { Authorization: token } },
      );
      const data = await r.json().catch(() => ({}));
      if (!r.ok) continue;
      for (const f of data.fields || []) {
        if (f.type !== 'drop_down' && f.type !== 'labels') continue;
        // First list wins — Brand list takes precedence so its option IDs
        // are preferred when the same field UUID exists in multiple lists.
        if (!map[f.id]) map[f.id] = f.type_config?.options || [];
      }
    } catch {
      /* ignore — best-effort */
    }
  }
  return map;
}

function resolveOption(raw, options) {
  if (!options || !options.length) return null;
  const norm = (s) => String(s ?? '').trim().toLowerCase();
  const target = norm(raw);
  if (!target) return null;
  const byId = options.find((o) => o.id === raw);
  if (byId) return byId.orderindex;
  const byName = options.find((o) => norm(o.name) === target);
  if (byName) return byName.orderindex;
  if (/^\d+$/.test(target)) {
    const byIdx = options.find((o) => Number(o.orderindex) === Number(target));
    if (byIdx) return byIdx.orderindex;
  }
  return null;
}

function resolveLabels(raw, options) {
  if (!options || !options.length) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  const norm = (s) => String(s ?? '').trim().toLowerCase();
  const ids = [];
  for (const v of arr) {
    if (empty(v)) continue;
    const opt = options.find((o) =>
      o.id === v ||
      norm(o.name) === norm(v) ||
      norm(o.label) === norm(v),
    );
    if (opt) ids.push(opt.id);
  }
  return ids;
}

/**
 * Translate form state → flat {fieldName: value} map. Handles the nested
 * shape (candidate.*, party.*, profile.*, customColors.*, customFonts.*).
 */
function flattenState(state, payload) {
  const candidate    = state.candidate    || {};
  const party        = state.party        || {};
  const pac          = state.pac          || {};
  const nonprofit    = state.nonprofit    || {};
  const profile      = state.profile      || {};
  const customColors = state.customColors || {};
  const customFonts  = state.customFonts  || {};
  const subjectType  = payload.subject_type;
  const isCandidate  = subjectType === 'candidate';
  const isParty      = subjectType === 'party';
  const isPac        = subjectType === 'pac';
  const isNonprofit  = subjectType === 'nonprofit';

  // Founding Story (single-select dropdown shared across party/pac/nonprofit).
  // Each subject keeps its own multi-select array in state — we collapse to
  // the first entry for the dropdown, then dump the full list into the matching
  // "Other" text field as a CSV when there's overflow.
  const pickFirst = (arr) => Array.isArray(arr) && arr.length ? arr[0] : (arr || null);
  const foundingStoryValue =
    isParty     ? pickFirst(profile.foundingStories)
  : isPac       ? pickFirst(profile.pacFoundingStories)
  : isNonprofit ? pickFirst(profile.nonprofitFoundingStories)
  : null;
  const foundingStoryOtherValue =
    isParty     ? profile.foundingStoryOther
  : isPac       ? (profile.pacFoundingStoryOther || (Array.isArray(profile.pacFoundingStories) && profile.pacFoundingStories.length > 1 ? profile.pacFoundingStories.slice(1).join(', ') : ''))
  : isNonprofit ? (profile.nonprofitFoundingStoryOther || (Array.isArray(profile.nonprofitFoundingStories) && profile.nonprofitFoundingStories.length > 1 ? profile.nonprofitFoundingStories.slice(1).join(', ') : ''))
  : null;

  // Target Voter Segments (labels field on Brand list — reused for PAC donor
  // segments and Nonprofit audiences). The label IDs come from the Brand list
  // option set — for PAC/Nonprofit we send the segment IDs as plain strings;
  // resolveLabels will skip any that don't match Brand-list labels.
  const segmentsValue =
    isParty     ? profile.targetSegments
  : isPac       ? profile.pacTargetDonors
  : isNonprofit ? profile.nonprofitAudiences
  : null;
  const segmentOtherValue =
    isParty     ? profile.targetSegmentOther
  : isPac       ? profile.pacTargetDonorOther
  : isNonprofit ? profile.nonprofitAudienceOther
  : null;

  // Platform Pillars (labels field — reused for PAC issue focus).
  const pillarsValue =
    isParty ? profile.platformPillars
  : isPac   ? profile.pacIssueFocus
  : null;
  const pillarOtherValue =
    isParty ? profile.platformPillarOther
  : isPac   ? profile.pacIssueFocusOther
  : null;

  // Coalitions / Partners (free text — reused for all 3 non-candidate subjects).
  const coalitionsValue =
    isParty     ? profile.coalitions
  : isPac       ? profile.pacCoalitions
  : isNonprofit ? profile.nonprofitCoalitions
  : null;

  // Geographic fields — Party, PAC, and Nonprofit each have state/states/cityCounty.
  // Workspace-shared field "States Covered" is text; "City / County" is short_text.
  const statesValue =
    isParty     ? (Array.isArray(party.states) && party.states.length ? party.states.join(', ') : party.state || null)
  : isPac       ? (Array.isArray(pac.states) && pac.states.length ? pac.states.join(', ') : pac.state || null)
  : isNonprofit ? (Array.isArray(nonprofit.states) && nonprofit.states.length ? nonprofit.states.join(', ') : nonprofit.state || null)
  : null;
  const cityCountyValue =
    isParty     ? party.cityCounty
  : isPac       ? pac.cityCounty
  : isNonprofit ? nonprofit.cityCounty
  : null;
  // PAC has its own "PAC States Covered" short_text field; use that for pac too.
  const pacStatesValue =
    isPac ? (Array.isArray(pac.states) && pac.states.length ? pac.states.join(', ') : pac.state || null)
  : null;

  // Lead Spokesperson (workspace-shared short_text — used by party / pac / nonprofit).
  const spokespersonValue =
    isParty     ? party.spokesperson
  : isPac       ? pac.spokesperson
  : isNonprofit ? nonprofit.spokesperson
  : null;

  const out = {
    // Subject Type drives ClickUp views — workspace-shared dropdown.
    'Subject Type':            payload.subject_type,

    // Candidate
    'Race Focus':              isCandidate ? candidate.raceFocus : null,
    'Candidate Type':          isCandidate ? candidate.candidateType : null,
    // Party Affiliation applies to candidate AND party flows — form stores both
    // under candidate.partyAffiliation (party flow lacks a dedicated state key).
    'Party Affiliation (brand)': (isCandidate || isParty) ? candidate.partyAffiliation : null,

    // Party
    'Party Acronym (brand)':   isParty ? party.acronym : null,

    // PAC basics — workspace-shared field UUIDs (also live on Campaign Intake)
    'PAC Legal Name':            isPac ? pac.legalName : null,
    'PAC Type':                  isPac ? pac.pacType : null,
    'PAC Scope':                 isPac ? pac.scope : null,
    'PAC States Covered':        pacStatesValue,
    'PAC Year Established':      isPac ? pac.yearEstablished : null,
    'PAC Mission':               isPac ? pac.mission : null,
    'PAC IE-Only?':              isPac ? pac.ieOnly : null,
    'PAC Connected Status':      isPac ? pac.connectedStatus : null,
    'PAC Affiliated Committees': isPac ? profile.pacAffiliatedCandidates : null,

    // Nonprofit basics
    // "Legal organization name" is workspace-shared — Party uses it for the party's full name.
    'Legal organization name':    isParty ? party.name : isNonprofit ? nonprofit.legalName : null,
    'Nonprofit Type':             isNonprofit ? nonprofit.nonprofitType : null,
    'Nonprofit Scope':            isNonprofit ? nonprofit.scope : null,
    // "Founded Year" is workspace-shared — Party also has a foundedYear input.
    'Founded Year':               isParty ? party.foundedYear : isNonprofit ? nonprofit.foundedYear : null,
    'Nonprofit Mission':          isNonprofit ? nonprofit.mission : null,
    'Nonprofit Membership-Based?':isNonprofit ? nonprofit.membershipBased : null,
    'Lobbying Activity':          isNonprofit ? nonprofit.lobbyingActivity : null,
    'IRS Determination Status':   isNonprofit ? nonprofit.irsDeterminationStatus : null,
    'Nonprofit Cause Areas':      isNonprofit && Array.isArray(profile.nonprofitCauseAreas)
                                    ? profile.nonprofitCauseAreas.join(', ')
                                    : null,
    'Nonprofit Tone Anchor':      isNonprofit ? profile.nonprofitToneAnchor : null,

    // Shared across non-candidate subjects
    'States Covered':          statesValue,
    'City / County':           cityCountyValue,
    'Election Year':           isPac ? pac.electionYear : (isCandidate ? candidate.electionYear : null),
    'FEC Registration Status': isPac ? pac.fecRegistrationStatus : null,
    'Lead Spokesperson':       spokespersonValue,

    // Profile (candidate-mode + party-mode + reused for PAC/Nonprofit)
    'Professional Backgrounds': profile.backgrounds,
    'Background Other':         profile.backgroundOther,
    'Policy Priorities (ranked)': Array.isArray(profile.policyPriorities)
      ? profile.policyPriorities.join(', ') : profile.policyPriorities,
    'Policy Other':             profile.policyOther,
    'Founding Story':           foundingStoryValue,
    'Founding Story Other':     foundingStoryOtherValue,
    'Platform Pillars':         pillarsValue,
    'Platform Pillar Other':    pillarOtherValue,
    'Target Voter Segments':    segmentsValue,
    'Target Segment Other':     segmentOtherValue,
    'Coalitions / Partners':    coalitionsValue,
    // Brand
    'Brand Core':               state.brandCore,
    'Sub-Direction(s)':         Array.isArray(state.subDirection)
      ? state.subDirection.join(', ') : state.subDirection,
    // Logo
    'Has Existing Logo?':       state.hasExistingLogo === true ? 'Yes'
                                : state.hasExistingLogo === false ? 'No' : null,
    'Logo Type Preference':     state.hasExistingLogo ? null : state.logoType,
    'Logo Notes':               state.logoNotes,
    // Colors
    'Color Mode':               state.colorMode,
    'Color Primary':            customColors.primary,
    'Color Secondary':          customColors.secondary,
    'Color Accent':             customColors.accent,
    'Color Background':         customColors.background,
    'Color Text':               customColors.text,
    'Color Highlight':          customColors.additional,
    // Fonts
    'Heading Font':             customFonts.heading,
    'Body Font':                customFonts.body,
  };
  return out;
}

// Fallback "Other" text field for label fields whose options aren't seeded
// in ClickUp yet. Preserves submission data instead of silently dropping it.
const LABELS_FALLBACK_OTHER = {
  'Platform Pillars':      'Platform Pillar Other',
  'Target Voter Segments': 'Target Segment Other',
};

export function buildCustomFields(state, payload, optionsMap = {}) {
  const flat = flattenState(state, payload);
  const out = [];
  const unresolved = [];
  const labelFallbacks = {}; // {otherFieldName: csv}

  for (const [name, raw] of Object.entries(flat)) {
    if (empty(raw)) continue;
    const fid = FIELD_IDS[name];
    if (!fid) continue;
    const type = FIELD_TYPES[name];
    if (type === 'attachment') continue;

    let value = raw;
    if (type === 'date') {
      const d = new Date(`${String(raw).slice(0, 10)}T12:00:00Z`);
      if (isNaN(d.getTime())) continue;
      value = d.getTime();
    } else if (type === 'drop_down') {
      const translated = FORM_ID_TO_OPTION_NAME[name]?.[String(raw)] ?? raw;
      const idx = resolveOption(translated, optionsMap[fid]);
      if (idx === null || idx === undefined) {
        unresolved.push({ fieldName: name, fieldId: fid, value: String(raw) });
        continue;
      }
      value = idx;
    } else if (type === 'labels') {
      // Translate form slugs → ClickUp option names where applicable so
      // resolveLabels can match by name (slugs themselves don't appear in
      // option lists). Untranslated values pass through unchanged.
      const slugMap = LABELS_SLUG_TO_NAME[name];
      const translated = slugMap
        ? (Array.isArray(raw) ? raw : [raw]).map((v) => slugMap[String(v).trim().toLowerCase()] ?? v)
        : raw;
      const ids = resolveLabels(translated, optionsMap[fid]);
      if (!ids.length) {
        // Label options not seeded in ClickUp — fall back to writing raw
        // values into the corresponding "...Other" text field as CSV.
        const otherName = LABELS_FALLBACK_OTHER[name];
        if (otherName) {
          const csv = (Array.isArray(raw) ? raw : [raw])
            .filter((x) => !empty(x))
            .map((x) => String(x).trim())
            .join(', ');
          if (csv) {
            const prior = labelFallbacks[otherName];
            labelFallbacks[otherName] = prior ? `${prior}, ${csv}` : csv;
          }
        }
        unresolved.push({ fieldName: name, fieldId: fid, value: JSON.stringify(raw) });
        continue;
      }
      value = ids;
    } else if (type === 'number' || type === 'currency') {
      const n = Number(raw);
      if (!Number.isFinite(n)) continue;
      value = n;
    } else {
      // short_text / text / url / email / phone
      if (Array.isArray(raw)) {
        value = raw.filter((x) => !empty(x)).join(', ');
        if (!value) continue;
      } else if (typeof raw === 'object') {
        value = JSON.stringify(raw);
      } else {
        value = String(raw).trim();
      }
      if (!value) continue;
    }
    out.push({ id: fid, value });
  }

  // Apply label fallbacks — only write to an "Other" field if it wasn't
  // already set from the form's explicit Other input, and don't overwrite.
  const alreadyWritten = new Set(out.map((f) => f.id));
  for (const [otherName, csv] of Object.entries(labelFallbacks)) {
    const fid = FIELD_IDS[otherName];
    if (!fid || alreadyWritten.has(fid)) continue;
    if (FIELD_TYPES[otherName] !== 'text' && FIELD_TYPES[otherName] !== 'short_text') continue;
    out.push({ id: fid, value: csv });
  }

  return { fields: out, unresolved };
}
