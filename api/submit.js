/**
 * POST /api/submit  — Form 2 (Political Brand Discovery)
 *
 * Replaces the legacy browser-direct Supabase write. The frontend now
 * sends form state to this server endpoint, which:
 *   1. Sanitizes + validates the payload (mirrors src/supabase/submissions.js).
 *   2. Inserts into Supabase `brand_submissions` using the secret key.
 *   3. Best-effort ClickUp task creation in Political Brand Onboarding Form
 *      list, with description + Linked Client → Active Clients master.
 *   4. Updates Active Clients master with Subject Type, Brand Onboarding
 *      Submitted At, Form 2 Supabase Row ID (if a clientId is supplied).
 *
 * Required env vars:
 *   - SUPABASE_URL
 *   - SUPABASE_SECRET_KEY
 *   - CLICKUP_API_TOKEN
 */

import { createClient } from '@supabase/supabase-js';
import {
  PRIMARY_LIST_ID,
  ACTIVE_CLIENTS_LIST_ID,
  ACTIVE_CLIENTS_FIELD_IDS,
  FIELD_IDS,
} from './clickup-field-map.js';
import { buildCustomFields, getDropdownOptionsMap } from './clickup-build.js';
import { recordAudit } from './audit.js';

// ─── Validation primitives (kept consistent with src/utils/sanitize.js) ──
const HEX  = /^#[0-9A-Fa-f]{6}$/;
const YEAR = /^[0-9]{4}$/;
const VALID_SUBJECT_TYPES = ['candidate','party','pac','nonprofit'];
const VALID_PARTY_TYPES   = ['republican','america-first','non-partisan','independent','third-party','coalition','other'];
const VALID_PARTY_SCOPES  = ['national','multi-state','state','local'];
const VALID_PAC_TYPES     = ['federal','state','super','hybrid','carey','leadership','other'];
const VALID_PAC_SCOPES    = ['federal','multi-state','state','local'];
const VALID_PAC_CONNECTED = ['connected','non-connected','na'];
const VALID_FEC_STATUS    = ['registered','in-progress','not-yet','na-state-only'];
const VALID_YES_NO        = ['yes','no'];
const VALID_NP_TYPES      = ['c3','c4','c6','527','other'];
const VALID_NP_SCOPES     = ['national','multi-state','state','local'];
const VALID_LOBBYING      = ['none','insubstantial','501h-elected','primary-purpose-c4','na'];
const VALID_IRS_STATUS    = ['approved','pending','revoked','fiscally-sponsored','na'];
const VALID_TONE_ANCHORS  = ['advocacy','service','research','member','donor'];
const VALID_BRAND_CORES   = ['commander','patriot','reformer','community','executive','nonpartisan'];
const VALID_LOGO_TYPES    = ['emblem','symbol-text','monogram','wordmark'];
const VALID_RACE_FOCUS    = ['primary','general','runoff'];

const trim = (s, max=120) => typeof s === 'string' ? s.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, max) || null : null;
const free = (s, max=500) => typeof s === 'string' ? s.replace(/[\x00-\x1F\x7F]/g, '').slice(0, max).trim() || null : null;
const district = (s) => trim(s, 30);
const safeHex  = (v) => HEX.test(v)  ? v : null;
const safeYear = (v) => YEAR.test(v) ? v : null;
const safeEnum = (v, allowed) => allowed.includes(v) ? v : null;
const safeFont = (v) => typeof v === 'string' ? v.replace(/[^a-zA-Z0-9\s\-]/g, '').slice(0, 80) || null : null;
const toCSV = (arr) => Array.isArray(arr) && arr.length
  ? arr.map(item => trim(typeof item === 'string' ? item : item?.label || item?.id || '', 100)).filter(Boolean).join(', ').slice(0, 500) || null
  : null;


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { return res.status(400).json({ error: 'Invalid JSON body' }); }

  const { state = {} } = body || {};
  const candidate    = state.candidate    || {};
  const party        = state.party        || {};
  const pac          = state.pac          || {};
  const nonprofit    = state.nonprofit    || {};
  const profile      = state.profile      || {};
  const customColors = state.customColors || {};
  const customFonts  = state.customFonts  || {};
  const subjectType  = VALID_SUBJECT_TYPES.includes(state.subjectType) ? state.subjectType : 'candidate';

  // ── Build sanitized payload ───────────────────────────────
  const payload = {
    client_id:               state.clientId ? String(state.clientId).slice(0, 40) : null,
    subject_type:            safeEnum(subjectType, VALID_SUBJECT_TYPES),

    // Candidate basics
    candidate_name:          trim(candidate.fullName, 120),
    candidate_office:        trim(candidate.office, 120),
    candidate_office_custom: trim(candidate.officeCustom, 120),
    candidate_state:         trim(candidate.state, 60),
    candidate_district:      district(candidate.district),
    election_year:           safeYear(candidate.electionYear),
    party_affiliation:       trim(candidate.partyAffiliation, 60),
    race_focus:              safeEnum(candidate.raceFocus, VALID_RACE_FOCUS),
    candidate_type:          trim(candidate.candidateType, 60),

    // Party basics
    party_name:              trim(party.name, 120),
    party_acronym:           trim(party.acronym, 60),
    party_type:              safeEnum(party.partyType, VALID_PARTY_TYPES),
    party_type_other:        trim(party.partyTypeOther, 120),
    party_scope:             safeEnum(party.scope, VALID_PARTY_SCOPES),
    party_state:             trim(party.state, 60),
    party_states:            toCSV(party.states),
    party_city_county:       trim(party.cityCounty, 120),
    party_founded_year:      safeYear(party.foundedYear),
    party_spokesperson:      trim(party.spokesperson, 120),

    // Profile
    backgrounds:             toCSV(profile.backgrounds),
    background_other:        free(profile.backgroundOther, 200),
    policy_priorities:       toCSV(profile.policyPriorities),
    policy_other:            free(profile.policyOther, 200),

    // Party profile
    party_founding_story:        trim(profile.foundingStory, 120),
    party_founding_story_other:  free(profile.foundingStoryOther, 200),
    party_platform_pillars:      toCSV(profile.platformPillars),
    party_platform_pillar_other: free(profile.platformPillarOther, 200),
    party_target_segments:       toCSV(profile.targetSegments),
    party_target_segment_other:  free(profile.targetSegmentOther, 200),
    party_coalitions:            free(profile.coalitions, 500),

    // Brand
    brand_core:         safeEnum(state.brandCore, VALID_BRAND_CORES),
    sub_direction:      Array.isArray(state.subDirection) ? toCSV(state.subDirection) : trim(state.subDirection, 60),
    logo_type:          state.hasExistingLogo ? null : safeEnum(state.logoType, VALID_LOGO_TYPES),
    has_existing_logo:  state.hasExistingLogo ?? null,
    existing_logo_url:  state.existingLogoUrl ? String(state.existingLogoUrl).slice(0, 2000) : null,
    logo_notes:         free(state.logoNotes, 100),

    // Colors
    color_mode:       state.colorMode || null,
    color_primary:    safeHex(customColors.primary),
    color_secondary:  safeHex(customColors.secondary),
    color_accent:     safeHex(customColors.accent),
    color_background: safeHex(customColors.background),
    color_text:       safeHex(customColors.text),
    color_highlight:  safeHex(customColors.additional),

    // Fonts
    font_heading: safeFont(customFonts.heading),
    font_body:    safeFont(customFonts.body),

    // PAC top-level columns (migration 2026-05-12_pac_nonprofit.sql)
    pac_legal_name:              subjectType === 'pac' ? trim(pac.legalName, 120) : null,
    pac_type:                    subjectType === 'pac' ? safeEnum(pac.pacType, VALID_PAC_TYPES) : null,
    pac_type_other:              subjectType === 'pac' ? trim(pac.pacTypeOther, 120) : null,
    pac_scope:                   subjectType === 'pac' ? safeEnum(pac.scope, VALID_PAC_SCOPES) : null,
    pac_state:                   subjectType === 'pac' ? trim(pac.state, 60) : null,
    pac_states:                  subjectType === 'pac' ? toCSV(pac.states) : null,
    pac_city_county:             subjectType === 'pac' ? trim(pac.cityCounty, 120) : null,
    pac_year_established:        subjectType === 'pac' ? safeYear(pac.yearEstablished) : null,
    pac_mission:                 subjectType === 'pac' ? free(pac.mission, 500) : null,
    pac_ie_only:                 subjectType === 'pac' ? safeEnum(pac.ieOnly, VALID_YES_NO) : null,
    pac_connected_status:        subjectType === 'pac' ? safeEnum(pac.connectedStatus, VALID_PAC_CONNECTED) : null,
    pac_fec_registration_status: subjectType === 'pac' ? safeEnum(pac.fecRegistrationStatus, VALID_FEC_STATUS) : null,
    pac_spokesperson:            subjectType === 'pac' ? trim(pac.spokesperson, 120) : null,
    pac_founding_stories:        subjectType === 'pac' ? toCSV(profile.pacFoundingStories) : null,
    pac_founding_story_other:    subjectType === 'pac' ? free(profile.pacFoundingStoryOther, 200) : null,
    pac_issue_focus:             subjectType === 'pac' ? toCSV(profile.pacIssueFocus) : null,
    pac_issue_focus_other:       subjectType === 'pac' ? free(profile.pacIssueFocusOther, 200) : null,
    pac_target_donors:           subjectType === 'pac' ? toCSV(profile.pacTargetDonors) : null,
    pac_target_donor_other:      subjectType === 'pac' ? free(profile.pacTargetDonorOther, 200) : null,
    pac_affiliated_candidates:   subjectType === 'pac' ? free(profile.pacAffiliatedCandidates, 500) : null,
    pac_coalitions:              subjectType === 'pac' ? free(profile.pacCoalitions, 500) : null,

    // Nonprofit top-level columns
    nonprofit_legal_name:               subjectType === 'nonprofit' ? trim(nonprofit.legalName, 120) : null,
    nonprofit_type:                     subjectType === 'nonprofit' ? safeEnum(nonprofit.nonprofitType, VALID_NP_TYPES) : null,
    nonprofit_type_other:               subjectType === 'nonprofit' ? trim(nonprofit.nonprofitTypeOther, 120) : null,
    nonprofit_scope:                    subjectType === 'nonprofit' ? safeEnum(nonprofit.scope, VALID_NP_SCOPES) : null,
    nonprofit_state:                    subjectType === 'nonprofit' ? trim(nonprofit.state, 60) : null,
    nonprofit_states:                   subjectType === 'nonprofit' ? toCSV(nonprofit.states) : null,
    nonprofit_city_county:              subjectType === 'nonprofit' ? trim(nonprofit.cityCounty, 120) : null,
    nonprofit_founded_year:             subjectType === 'nonprofit' ? safeYear(nonprofit.foundedYear) : null,
    nonprofit_mission:                  subjectType === 'nonprofit' ? free(nonprofit.mission, 500) : null,
    nonprofit_membership_based:         subjectType === 'nonprofit' ? safeEnum(nonprofit.membershipBased, VALID_YES_NO) : null,
    nonprofit_lobbying_activity:        subjectType === 'nonprofit' ? safeEnum(nonprofit.lobbyingActivity, VALID_LOBBYING) : null,
    nonprofit_irs_determination_status: subjectType === 'nonprofit' ? safeEnum(nonprofit.irsDeterminationStatus, VALID_IRS_STATUS) : null,
    nonprofit_spokesperson:             subjectType === 'nonprofit' ? trim(nonprofit.spokesperson, 120) : null,
    nonprofit_founding_stories:         subjectType === 'nonprofit' ? toCSV(profile.nonprofitFoundingStories) : null,
    nonprofit_founding_story_other:     subjectType === 'nonprofit' ? free(profile.nonprofitFoundingStoryOther, 200) : null,
    nonprofit_cause_areas:              subjectType === 'nonprofit' ? toCSV(profile.nonprofitCauseAreas) : null,
    nonprofit_cause_area_other:         subjectType === 'nonprofit' ? free(profile.nonprofitCauseAreaOther, 200) : null,
    nonprofit_audiences:                subjectType === 'nonprofit' ? toCSV(profile.nonprofitAudiences) : null,
    nonprofit_audience_other:           subjectType === 'nonprofit' ? free(profile.nonprofitAudienceOther, 200) : null,
    nonprofit_tone_anchor:              subjectType === 'nonprofit' ? safeEnum(profile.nonprofitToneAnchor, VALID_TONE_ANCHORS) : null,
    nonprofit_coalitions:               subjectType === 'nonprofit' ? free(profile.nonprofitCoalitions, 500) : null,

    // Full snapshot — preserves raw nested state for debugging / re-hydration.
    full_data: {
      subjectType,
      candidate, party, pac, nonprofit, profile,
      brandCore:        state.brandCore || null,
      subDirection:     state.subDirection || null,
      customColors, customFonts,
      hasExistingLogo:  state.hasExistingLogo ?? null,
      existingLogoUrl:  state.existingLogoUrl  || null,
      logoType:         state.logoType || null,
      logoNotes:        free(state.logoNotes, 100),
      collateralPriorities: Array.isArray(state.collateralPriorities) ? state.collateralPriorities : [],
    },
  };

  // ── Minimum-data guards ──────────────────────────────────
  if (subjectType === 'party') {
    if (!payload.party_name || payload.party_name.length < 2) {
      return res.status(400).json({ error: 'Party / organization name is required.' });
    }
  } else if (subjectType === 'pac') {
    const pacName = trim(pac.legalName, 120);
    if (!pacName || pacName.length < 2) {
      return res.status(400).json({ error: 'PAC legal name is required.' });
    }
  } else if (subjectType === 'nonprofit') {
    const npName = trim(nonprofit.legalName, 120);
    if (!npName || npName.length < 2) {
      return res.status(400).json({ error: 'Nonprofit legal name is required.' });
    }
  } else if (!payload.candidate_name || payload.candidate_name.length < 2) {
    return res.status(400).json({ error: 'Candidate name is required.' });
  }
  if (!payload.brand_core) {
    return res.status(400).json({ error: 'Brand core selection is required.' });
  }

  // ── Insert into Supabase ─────────────────────────────────
  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey   = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !secretKey) {
    return res.status(500).json({ error: 'Supabase env vars not configured.' });
  }
  const supabase = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } });

  const { data: row, error } = await supabase
    .from('brand_submissions')
    .insert([payload])
    .select()
    .single();
  if (error) {
    await recordAudit(supabase, {
      form: 'political-brand', client_id: payload.client_id, stage: 'supabase_insert',
      outcome: 'error', detail: error.message,
    });
    return res.status(500).json({ error: friendlySupabaseError(error), detail: error.message });
  }
  await recordAudit(supabase, {
    form: 'political-brand', client_id: payload.client_id, stage: 'supabase_insert',
    outcome: 'ok', detail: `row ${row.id}`,
  });

  // ── ClickUp sync — best effort ───────────────────────────
  const submittedAt = new Date().toISOString();
  const clientId    = state.clientId || null;
  const errors = [];

  // Build the ClickUp custom_fields[] array ONCE and persist it to the
  // Supabase row. The Worker's reconcileDownstreamFields cron reads
  // `clickup_fields` to gap-fill anything the best-effort inline sync below
  // drops under ClickUp rate-limiting.
  let customFields = [];
  let unresolved = [];
  let fieldFailures = [];
  try {
    const optionsMap = await getDropdownOptionsMap();
    const built = buildCustomFields(state, payload, optionsMap);
    customFields = built.fields;
    unresolved = built.unresolved;
  } catch (e) {
    console.error('[political-brand] buildCustomFields failed:', e);
    errors.push({ step: 'build_fields', detail: String(e.message || e) });
  }
  if (unresolved.length) {
    console.warn('[political-brand] unresolved dropdown values:', unresolved);
  }
  if (customFields.length) {
    const { error: cfErr } = await supabase
      .from('brand_submissions')
      .update({ clickup_fields: customFields })
      .eq('id', row.id);
    if (cfErr) console.error('[political-brand] clickup_fields persist failed:', cfErr);
  }

  const cuStart = Date.now();
  resetClickupRetryCount();
  try {
    const r = await syncClickUp({ state, payload, clientId, submittedAt, supabaseRowId: row.id, customFields });
    fieldFailures = r.fieldFailures || [];
    const attempts = 1 + getClickupRetryCount();
    const cuTaskId = r.task_id || null;
    await recordAudit(supabase, {
      form: 'political-brand', client_id: clientId, stage: 'clickup_sync',
      outcome: 'ok', attempt: attempts, clickup_task_id: cuTaskId,
      duration_ms: Date.now() - cuStart,
      detail: fieldFailures.length
        ? `task created; ${fieldFailures.length} field write(s) failed`
        : 'task created + fields written',
    });
    await supabase.from('brand_submissions').update({
      clickup_task_id:  cuTaskId,
      clickup_synced_at: new Date().toISOString(),
      clickup_attempts: attempts,
      clickup_error:    fieldFailures.length ? JSON.stringify(fieldFailures).slice(0, 500) : null,
    }).eq('id', row.id);
  } catch (e) {
    console.error('[political-brand] ClickUp sync failed:', e);
    errors.push({ step: 'clickup', detail: String(e.message || e) });
    const attempts = 1 + getClickupRetryCount();
    await recordAudit(supabase, {
      form: 'political-brand', client_id: clientId, stage: 'clickup_sync',
      outcome: 'error', attempt: attempts, duration_ms: Date.now() - cuStart,
      detail: String(e.message || e),
    });
    await supabase.from('brand_submissions').update({
      clickup_attempts: attempts,
      clickup_error:    String(e.message || e).slice(0, 500),
    }).eq('id', row.id);
  }

  const sheetStart = Date.now();
  await syncSheets({ payload, clientId, submittedAt, supabaseRowId: row.id })
    .then(() => recordAudit(supabase, {
      form: 'political-brand', client_id: clientId, stage: 'sheet_log',
      outcome: 'ok', duration_ms: Date.now() - sheetStart,
    }))
    .catch((e) => {
      errors.push({ step: 'sheets', detail: String(e.message || e) });
      return recordAudit(supabase, {
        form: 'political-brand', client_id: clientId, stage: 'sheet_log',
        outcome: 'error', duration_ms: Date.now() - sheetStart,
        detail: String(e.message || e),
      });
    });

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    ok: true,
    id: row.id,
    syncErrors: errors,
    fieldWriteFailures: fieldFailures,
    unresolvedDropdowns: unresolved,
  });
}


function friendlySupabaseError(err) {
  const code = err?.code || '';
  const msg  = String(err?.message || '');
  const det  = String(err?.details || '');
  if (code === '23505') {
    if (/no_rapid_duplicates/i.test(msg + det)) {
      return 'This candidate/office/year combination has already been submitted. Edit a field or contact your account manager.';
    }
    return 'This submission already exists. Edit a field or contact your account manager.';
  }
  if (code === '23502') {
    const m = msg.match(/column "([^"]+)"/);
    return m ? `Required field is missing: ${m[1].replace(/_/g, ' ')}.` : 'A required field is missing.';
  }
  if (code === '23514') {
    const m = msg.match(/check constraint "([^"]+)"/);
    return m ? `Invalid value for ${m[1].replace(/_check$/, '').replace(/_/g, ' ')}.` : 'One of the fields has an invalid value.';
  }
  if (code === '22001') return 'One of the fields is too long.';
  if (code === '22P02') return 'One of the fields has an invalid format.';
  if (code === '42P01') return 'Server configuration error — please contact support.';
  return 'Could not save your submission. Please try again or contact support.';
}


async function syncSheets({ payload, clientId, submittedAt, supabaseRowId }) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;
  // Strip client_id from payload — already at top-level client_id
  const { client_id: _drop, ...slim } = payload || {};
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      form: 'political_brand',
      client_id: clientId,
      submitted_at: submittedAt,
      supabase_row_id: supabaseRowId,
      payload: slim,
    }),
  });
}


// ─── ClickUp helpers ───────────────────────────────────────────────────

// Retry counter — incremented on every 429/5xx retry. syncClickUp() resets it
// before its run and reads it after so the audit log can report total attempts.
let clickupRetryCount = 0;
export function resetClickupRetryCount() { clickupRetryCount = 0; }
export function getClickupRetryCount() { return clickupRetryCount; }

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// Min spacing between sequential ClickUp writes. Form 2 fires 40-60+ calls per
// submission (per-field POSTs + propagateWorkspaceFields + master updates) on a
// single token shared with Forms 1 & 3 — without spacing, the back half of the
// field-write loop 429s and fields get silently dropped into fieldFailures.
const CLICKUP_WRITE_THROTTLE_MS = 130;

async function clickupFetch(path, opts = {}) {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) throw new Error('CLICKUP_API_TOKEN not set');
  const MAX_ATTEMPTS = 4; // 1 initial + 3 retries
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const r = await fetch(`https://api.clickup.com/api/v2${path}`, {
      ...opts,
      headers: { Authorization: token, 'Content-Type': 'application/json', Accept: 'application/json', ...(opts.headers || {}) },
    });
    if (r.ok) return r.json();
    // Retry on 429 (rate limit) and 5xx (transient server errors). Honor the
    // Retry-After header when present, otherwise exponential backoff (1s/2s/4s
    // capped at 5s) — deliberately slowing down to stay under ClickUp's limit.
    if ((r.status === 429 || r.status >= 500) && attempt < MAX_ATTEMPTS) {
      const retryAfter = Number(r.headers.get('Retry-After'));
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 5000)
        : Math.min(1000 * 2 ** (attempt - 1), 5000);
      console.warn(`[clickup] ${r.status} on ${path} — retry ${attempt}/${MAX_ATTEMPTS - 1} after ${waitMs}ms`);
      clickupRetryCount++;
      await new Promise((res) => setTimeout(res, waitMs));
      continue;
    }
    const txt = await r.text();
    throw new Error(`ClickUp ${r.status} ${path}: ${txt.slice(0, 300)}`);
  }
  throw new Error(`ClickUp request failed after ${MAX_ATTEMPTS} attempts: ${path}`);
}

async function findActiveClientByClientId(clientId) {
  if (!clientId) return null;
  const target = String(clientId).trim().toLowerCase();
  // Paginate — ClickUp caps /task at 100 per page. Stopping at page 0 means
  // any AC master beyond the first 100 tasks silently can't be found, which
  // skips the entire master-update + status flow with no error surfaced.
  for (let page = 0; page < 50; page++) {
    const result = await clickupFetch(
      `/list/${ACTIVE_CLIENTS_LIST_ID}/task?include_closed=true&subtasks=true&page=${page}`,
    );
    for (const t of result.tasks || []) {
      const cf = (t.custom_fields || []).find(
        (f) => f.name === 'Client ID' &&
               String(f.value || '').trim().toLowerCase() === target,
      );
      if (cf) return t;
    }
    if (result.last_page || !(result.tasks || []).length) break;
  }
  return null;
}

// Find the Worker-W3 stub task in the form list for this client.
// W3 pre-creates one task per form list at status 'to do' with Client ID +
// Linked Client set. We patch that stub instead of creating a duplicate.
async function findStubByClientId(listId, clientId) {
  if (!clientId) return null;
  const target = String(clientId).trim().toLowerCase();
  for (let page = 0; page < 50; page++) {
    const result = await clickupFetch(
      `/list/${listId}/task?include_closed=true&subtasks=false&page=${page}`,
    );
    for (const t of result.tasks || []) {
      if (t.parent) continue;
      const cf = (t.custom_fields || []).find(
        (f) => f.name === 'Client ID' &&
               String(f.value || '').trim().toLowerCase() === target,
      );
      if (cf) return t;
    }
    if (result.last_page || !(result.tasks || []).length) break;
  }
  return null;
}

// Active Clients "Subject Type" dropdown orderindex map.
// Matches the option order on the workspace-shared Subject Type field
// (UUID 32b92b09-...): Candidate=0, Party=1, Nonprofit=2, PAC=3.
const SUBJECT_TYPE_ORDERINDEX = {
  candidate: 0,
  party:     1,
  nonprofit: 2,
  pac:       3,
};

async function syncClickUp({ state, payload, clientId, submittedAt, supabaseRowId, customFields }) {
  const pacName  = state.pac?.legalName ? String(state.pac.legalName).trim() : null;
  const npName   = state.nonprofit?.legalName ? String(state.nonprofit.legalName).trim() : null;
  const displayName = payload.candidate_name || payload.party_name || pacName || npName || clientId || 'Unknown';
  const taskName    = `${displayName}${clientId ? ` (${clientId})` : ''} — Political Brand`;

  const activeClientTask = clientId ? await findActiveClientByClientId(clientId).catch(() => null) : null;
  // No description dump — all data lives in structured custom fields now.
  const description = '';

  // customFields is built + persisted to the Supabase row by the caller, so
  // the Worker reconciler can heal anything dropped by the write loop below.

  // Prefer the W3-created stub if it exists — patch it instead of creating
  // a duplicate. Falls back to create-new for paths where W3 didn't run.
  const stub = clientId ? await findStubByClientId(PRIMARY_LIST_ID, clientId).catch(() => null) : null;
  let newTask;
  if (stub) {
    newTask = stub;
    await clickupFetch(`/task/${newTask.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: taskName, description }),
    }).catch((e) => console.error('[political-brand] stub rename failed:', e.message));
    await clickupFetch(`/task/${newTask.id}/tag/subject:${payload.subject_type}`, {
      method: 'POST',
    }).catch((e) => console.error('[political-brand] stub tag failed:', e.message));
  } else {
    // Step 1: create the task WITHOUT inline custom_fields. ClickUp's inline
    // custom_fields array rejects the ENTIRE task creation if any single value
    // is invalid (bad phone, URL, dropdown option) — see docs/clickup-custom-fields.md §1.
    // When that happens no task is created, no 'submitted' webhook fires, and the
    // Worker F0 automation never flips the AC "Form 2 — Political Branding" subtask.
    // Forms 1 & 3 use this two-step pattern for exactly this reason.
    newTask = await clickupFetch(`/list/${PRIMARY_LIST_ID}/task`, {
      method: 'POST',
      body: JSON.stringify({
        name: taskName,
        description,
        status: 'to do',
        tags: [`subject:${payload.subject_type}`],
      }),
    });
  }

  // Step 2: write each custom field individually. Failures are logged but
  // never thrown — one bad value shouldn't lose the rest of the submission.
  // Whatever drops here, the Worker reconciler heals from clickup_fields.
  const fieldFailures = [];
  for (const cf of customFields) {
    try {
      await clickupFetch(`/task/${newTask.id}/field/${cf.id}`, {
        method: 'POST',
        body: JSON.stringify({ value: cf.value }),
      });
    } catch (e) {
      const detail = { fieldId: cf.id, error: String(e.message || e) };
      console.warn('[political-brand] field write failed:', detail);
      fieldFailures.push(detail);
    }
    await sleep(CLICKUP_WRITE_THROTTLE_MS);
  }

  if (activeClientTask && FIELD_IDS['Linked Client']) {
    await clickupFetch(`/task/${newTask.id}/field/${FIELD_IDS['Linked Client']}`, {
      method: 'POST',
      body: JSON.stringify({ value: { add: [activeClientTask.id] } }),
    }).catch((e) => console.error('linked-client failed:', e));
  }

  // Propagate workspace-shared fields (Client ID + every populated value on
  // the AC master) onto the new form-list task. Replaces Worker automation F0.
  const formWrittenFieldIds = new Set(customFields.map((c) => c.id));
  await propagateWorkspaceFields({
    sourceTask: activeClientTask,
    destTaskId: newTask.id,
    clientId,
    skipFieldIds: formWrittenFieldIds,
    label: 'political-brand',
  });

  if (activeClientTask) {
    const subjectOrderIndex = SUBJECT_TYPE_ORDERINDEX[payload.subject_type] ?? 0;
    const updates = [
      { fid: ACTIVE_CLIENTS_FIELD_IDS['Subject Type'],                  value: subjectOrderIndex },
      { fid: ACTIVE_CLIENTS_FIELD_IDS['Brand Onboarding Submitted At'], value: Date.parse(submittedAt) },
      { fid: ACTIVE_CLIENTS_FIELD_IDS['Form 2 Supabase Row ID'],        value: supabaseRowId },
    ].filter((u) => u.fid);
    for (const u of updates) {
      await clickupFetch(`/task/${activeClientTask.id}/field/${u.fid}`, {
        method: 'POST',
        body: JSON.stringify({ value: u.value }),
      }).catch((e) => console.error('master update failed:', u.fid, e.message));
    }

    // Edit-propagation: candidate.fullName / party.name / pac.legalName /
    // nonprofit.legalName → DBA / Trade Name on Active Clients master.
    const masterFieldByName = {};
    for (const cf of activeClientTask.custom_fields || []) masterFieldByName[cf.name] = cf;
    const dba =
        payload.subject_type === 'party'     ? payload.party_name
      : payload.subject_type === 'pac'       ? pacName
      : payload.subject_type === 'nonprofit' ? npName
      : payload.candidate_name;
    if (dba && masterFieldByName['DBA / Trade Name*']?.id) {
      await clickupFetch(`/task/${activeClientTask.id}/field/${masterFieldByName['DBA / Trade Name*'].id}`, {
        method: 'POST',
        body: JSON.stringify({ value: String(dba).trim() }),
      }).catch((e) => console.error('DBA propagation failed:', e.message));
    }

    // If all 3 form Submitted-At dates are now non-null on the master,
    // advance status to "all forms received".
    await maybeAdvanceAllFormsReceived(activeClientTask, { brand_onboarding: true })
      .catch((e) => console.error('[political-brand] status advance failed:', e.message));
  }

  // Flip the form-list task's own status to 'submitted' so ClickUp emits a
  // taskStatusUpdated webhook → Worker F0 + W5. Without this, the task
  // stays at 'to do' and downstream automations never fire.
  await clickupFetch(`/task/${newTask.id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'submitted' }),
  }).catch((e) => console.error('[political-brand] status flip to submitted failed:', e.message));

  return { task_id: newTask.id, active_client_id: activeClientTask?.id || null, fieldFailures };
}

async function maybeAdvanceAllFormsReceived(activeClientTask, justWrote) {
  const get = (name) => (activeClientTask.custom_fields || []).find((f) => f.name === name)?.value;
  const f1 = justWrote.campaign_intake || get('Campaign Intake Submitted At');
  const f2 = justWrote.brand_onboarding || get('Brand Onboarding Submitted At');
  const f3 = justWrote.website_content || get('Website Content Submitted At');
  if (!(f1 && f2 && f3)) return;
  const target = process.env.AC_ALL_FORMS_STATUS || 'all forms received';
  const current = activeClientTask.status?.status || '';
  if (current.toLowerCase() === target.toLowerCase()) return;
  await clickupFetch(`/task/${activeClientTask.id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: target }),
  });
}


// ─── Description builder ───────────────────────────────────────────────

function buildDescription(state, payload) {
  const name = payload.candidate_name || payload.party_name || 'Unknown';
  const lines = [
    `# Political Brand Discovery — ${name}`,
    '',
    `**Subject type:** ${payload.subject_type}`,
    `**Submitted:** ${new Date().toISOString()}`,
    '',
  ];
  if (payload.brand_core)    lines.push(`**Brand Core:** ${payload.brand_core}`);
  if (payload.sub_direction) lines.push(`**Sub Direction:** ${payload.sub_direction}`);
  if (payload.logo_type)     lines.push(`**Logo Type:** ${payload.logo_type}`);
  lines.push('');
  for (const [k, v] of Object.entries(state)) {
    if (['subjectType','brandCore','subDirection','logoType','currentStage','completedStages','submitting','submitted','submitError','clickupTaskId'].includes(k)) continue;
    if (v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) continue;
    lines.push(`## ${humanize(k)}`);
    lines.push(formatValue(v));
    lines.push('');
  }
  return lines.join('\n').slice(0, 8000);
}

async function setCustomField(taskId, fieldId, value) {
  return clickupFetch(`/task/${taskId}/field/${fieldId}`, {
    method: 'POST',
    body: JSON.stringify({ value }),
  });
}

// Propagate workspace-shared custom fields from the AC master onto a new
// form-list task. Always writes Client ID. Then, for every populated field
// on the AC master (skipping form-managed fields, attachments, relationships,
// and users), POSTs the same value onto the dest task. Failures are logged,
// never thrown. Replaces Worker automation F0.
async function propagateWorkspaceFields({ sourceTask, destTaskId, clientId, skipFieldIds, label }) {
  const CLIENT_ID_FIELD_UUID = 'fb5566ed-7a97-4337-a698-84b07d581fb8';
  if (clientId) {
    await setCustomField(destTaskId, CLIENT_ID_FIELD_UUID, clientId)
      .catch((e) => console.error(`[${label}] Client ID write failed:`, e.message));
  }
  if (!sourceTask) return;
  for (const f of sourceTask.custom_fields || []) {
    const fid = f.id;
    if (!fid || skipFieldIds?.has(fid)) continue;
    if (fid === CLIENT_ID_FIELD_UUID) continue;
    if (f.type === 'list_relationship' || f.type === 'attachment' || f.type === 'users') continue;
    const v = f.value;
    if (v === undefined || v === null || v === '' ||
        (Array.isArray(v) && v.length === 0) ||
        (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)) {
      continue;
    }
    let writeValue = v;
    if (f.type === 'drop_down' && typeof v === 'object' && v?.orderindex !== undefined) {
      writeValue = v.orderindex;
    }
    if (f.type === 'labels' && Array.isArray(v)) {
      writeValue = v.map((opt) => (typeof opt === 'string' ? opt : opt.id)).filter(Boolean);
      if (!writeValue.length) continue;
    }
    await setCustomField(destTaskId, fid, writeValue).catch((e) =>
      console.error(`[${label}] propagate field "${f.name}" failed:`, e.message),
    );
    await sleep(CLICKUP_WRITE_THROTTLE_MS);
  }
}

function humanize(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}
function formatValue(v) {
  if (Array.isArray(v)) {
    if (v.length && typeof v[0] === 'object') {
      return v.map((item, i) => `${i + 1}. ` + Object.entries(item).map(([k, x]) => `**${humanize(k)}:** ${x}`).join(' · ')).join('\n');
    }
    return v.map((x) => `- ${x}`).join('\n');
  }
  if (v && typeof v === 'object') {
    return Object.entries(v).map(([k, x]) => `- **${humanize(k)}:** ${x ?? ''}`).join('\n');
  }
  return String(v);
}
