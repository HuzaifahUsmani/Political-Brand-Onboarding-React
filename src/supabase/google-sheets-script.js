/**
 * Operation 1776 — Supabase → Google Sheets Sync
 * ─────────────────────────────────────────────────
 * HOW TO SET UP:
 *   1. Open your Google Sheet
 *   2. Extensions → Apps Script
 *   3. Paste this entire file, replacing what's there
 *   4. Replace SUPABASE_SERVICE_KEY below with your service_role key
 *      (Supabase → Settings → API → service_role → Reveal)
 *   5. Click Run → importFromSupabase (grant permissions when prompted)
 *   6. To auto-refresh: Triggers → Add Trigger →
 *        Function: importFromSupabase
 *        Event: Time-driven → Hour timer → Every hour
 */

const SUPABASE_URL = 'https://nwgiydfpclhvhjxvljpz.supabase.co';
const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // ← replace this

// Columns to show in the sheet (in order)
// Must match brand_submissions table column names exactly
const COLUMNS = [
  'id',
  'created_at',
  'candidate_name',
  'candidate_office',
  'candidate_office_custom',
  'candidate_state',
  'candidate_district',
  'election_year',
  'party_affiliation',
  'race_focus',
  'candidate_type',
  'backgrounds',
  'background_other',
  'policy_priorities',
  'policy_other',
  'defining_story',
  'family_status',
  'endorsements',
  'brand_core',
  'sub_direction',
  'color_mode',
  'color_primary',
  'color_secondary',
  'color_accent',
  'color_background',
  'color_text',
  'color_highlight',
  'font_heading',
  'font_body',
  'logo_type',
  'collateral_items',
  'collateral_total',
];

/**
 * Main function — pulls all submissions and writes to the active sheet.
 * Run manually or set as a timed trigger.
 */
function importFromSupabase() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  try {
    const rows = fetchAllSubmissions();

    if (rows.length === 0) {
      sheet.clearContents();
      sheet.getRange(1, 1).setValue('No submissions yet.');
      return;
    }

    // Clear existing content
    sheet.clearContents();

    // Write header row
    const headers = COLUMNS.map(col =>
      col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    );
    sheet.appendRow(headers);

    // Style header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#1C2E5B');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(10);

    // Write data rows
    rows.forEach(row => {
      const values = COLUMNS.map(col => {
        const val = row[col];
        if (val === null || val === undefined) return '';
        if (col === 'created_at') return formatDate(val);
        if (col === 'collateral_total' && val) return `$${val}`;
        return String(val);
      });
      sheet.appendRow(values);
    });

    // Auto-resize columns
    sheet.autoResizeColumns(1, headers.length);

    // Freeze header row
    sheet.setFrozenRows(1);

    // Add alternating row colors
    const dataRange = sheet.getRange(2, 1, rows.length, COLUMNS.length);
    dataRange.setBackground('#F9FAFB');

    // Log success
    Logger.log(`✅ Imported ${rows.length} submissions at ${new Date().toISOString()}`);

  } catch (err) {
    Logger.log(`❌ Error: ${err.message}`);
    SpreadsheetApp.getUi().alert(`Sync failed: ${err.message}`);
  }
}

/**
 * Fetch all rows from brand_submissions, newest first.
 * Uses the service_role key — bypasses RLS safely server-side.
 */
function fetchAllSubmissions() {
  const url = `${SUPABASE_URL}/rest/v1/brand_submissions` +
    `?select=${COLUMNS.join(',')}&order=created_at.desc`;

  const response = UrlFetchApp.fetch(url, {
    method: 'GET',
    headers: {
      'apikey':        SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type':  'application/json',
    },
    muteHttpExceptions: true,
  });

  const code = response.getResponseCode();
  if (code !== 200) {
    throw new Error(`Supabase returned ${code}: ${response.getContentText()}`);
  }

  return JSON.parse(response.getContentText());
}

/** Format ISO timestamp to readable date */
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'MMM d, yyyy h:mm a');
}
