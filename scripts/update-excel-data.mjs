/**
 * update-excel-data.mjs
 * -----------------------------------------------------------------------------
 * Syncs contact data from an Excel masterlist into the Supabase `contacts` table.
 *
 * Matching is done by company name (exact match against contacts.company).
 * For each matched contact:
 *   - job_title is ALWAYS updated (overwrites existing value).
 *   - prefix, contact_person, contact_number, email, area_code are updated
 *     ONLY when the current DB value is empty (null / '').
 *   - address, status, comments are NEVER touched.
 *
 * Column mappings (Excel -> Supabase):
 *   Customer                       -> company        (match key, not written)
 *   Title                          -> prefix         (update if empty)
 *   First Name + Last Name         -> contact_person (concatenate, update if empty)
 *   Job Title                      -> job_title      (always update)
 *   Tel Num                        -> contact_number (update if empty)
 *   Email Address                  -> email          (update if empty)
 *   Area Code                      -> area_code      (update if empty)
 *   Address fields                 -> NOT TOUCHED
 *   Lifecycle / Debtor / Rating    -> skipped
 *
 * Usage:  node scripts/update-excel-data.mjs
 * -----------------------------------------------------------------------------
 */

import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();

// ----------------------------------------------------------------------------
// Config
// ----------------------------------------------------------------------------
const EXCEL_PATH =
  '/Users/ericmagto/Projects/raykan/marketing/cold calling/CEBU,LAPULAPU CITY.xlsx';
const SHEET_NAME = 'masterlist'; // clean, structured sheet with proper headers
const DB_PAGE_SIZE = 1000; // rows per fetch page when loading existing contacts
const UPDATE_BATCH_SIZE = 100; // updates flushed per batch

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

/** Trim/stringify a cell value; return '' for null/undefined/empty. */
function cell(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

/** A DB field counts as "empty" when it is null, undefined, or blank string. */
function isEmpty(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

/** Normalize a company name for matching (case-insensitive, collapse whitespace). */
function normalizeCompany(name) {
  return cell(name).toUpperCase().replace(/\s+/g, ' ');
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------
async function main() {
  console.log('='.repeat(70));
  console.log('Excel -> Supabase contacts sync');
  console.log('='.repeat(70));

  // --- Validate credentials ---
  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      'Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env',
    );
    process.exit(1);
  }

  // --- Validate Excel file exists ---
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`Error: Excel file not found at:\n  ${EXCEL_PATH}`);
    process.exit(1);
  }
  console.log(`Excel file: ${path.basename(EXCEL_PATH)}`);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    realtime: { transport: ws },
    auth: { persistSession: false },
  });

  // --- Read + parse the Excel masterlist sheet ---
  const workbook = xlsx.readFile(EXCEL_PATH);
  if (!workbook.SheetNames.includes(SHEET_NAME)) {
    console.error(
      `Error: Sheet "${SHEET_NAME}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`,
    );
    process.exit(1);
  }

  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[SHEET_NAME], {
    defval: '',
  });
  console.log(`Parsed ${rows.length} rows from sheet "${SHEET_NAME}".`);

  // --- Build Excel lookup keyed by normalized company name ---
  // If the Excel has duplicate company names, the first occurrence wins.
  const excelByCompany = new Map();
  let excelDuplicates = 0;
  let excelBlankCompany = 0;

  for (const row of rows) {
    const company = cell(row['Customer']);
    if (!company) {
      excelBlankCompany++;
      continue;
    }
    const key = normalizeCompany(company);
    if (excelByCompany.has(key)) {
      excelDuplicates++;
      continue; // keep first occurrence
    }

    const firstName = cell(row['First Name']);
    const lastName = cell(row['Last Name']);
    const contactPerson = [firstName, lastName].filter(Boolean).join(' ').trim();

    excelByCompany.set(key, {
      company,
      prefix: cell(row['Title']),
      contact_person: contactPerson,
      job_title: cell(row['Job Title']),
      contact_number: cell(row['Tel Num']),
      email: cell(row['Email Address']),
      area_code: cell(row['Area Code']),
    });
  }

  console.log(
    `Excel companies indexed: ${excelByCompany.size}` +
      (excelDuplicates ? ` (${excelDuplicates} duplicate rows skipped)` : '') +
      (excelBlankCompany ? ` (${excelBlankCompany} blank-company rows skipped)` : ''),
  );

  // --- Load all existing contacts from Supabase (paginated) ---
  console.log('Loading existing contacts from Supabase...');
  const contacts = [];
  for (let from = 0; ; from += DB_PAGE_SIZE) {
    const to = from + DB_PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('contacts')
      .select(
        'id, company, prefix, contact_person, contact_number, email, area_code, job_title',
      )
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      if (/job_title/.test(error.message) && /does not exist/.test(error.message)) {
        console.error('');
        console.error(
          'Error: the "contacts.job_title" column does not exist in the database.',
        );
        console.error(
          'This script requires it. Apply the migration first by running the SQL in',
        );
        console.error('  supabase/add_job_title.sql');
        console.error(
          'via Supabase Dashboard -> SQL Editor, then re-run this script.',
        );
        console.error('');
      }
      console.error('Error fetching contacts:', error.message);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    contacts.push(...data);
    if (data.length < DB_PAGE_SIZE) break;
  }
  console.log(`Loaded ${contacts.length} contacts from database.`);

  // --- Group DB contacts by normalized company name (to detect multi-matches) ---
  const dbByCompany = new Map();
  for (const c of contacts) {
    const key = normalizeCompany(c.company);
    if (!key) continue;
    if (!dbByCompany.has(key)) dbByCompany.set(key, []);
    dbByCompany.get(key).push(c);
  }

  // --- Compute per-contact updates ---
  const stats = {
    excelRows: rows.length,
    excelCompanies: excelByCompany.size,
    matchedCompanies: 0,
    multiMatchCompanies: 0,
    contactsUpdated: 0,
    contactsNoChange: 0,
    notFound: 0,
    errors: 0,
  };

  const updates = []; // { id, patch }

  for (const [key, src] of excelByCompany) {
    const matches = dbByCompany.get(key);

    if (!matches || matches.length === 0) {
      stats.notFound++;
      continue;
    }

    stats.matchedCompanies++;
    if (matches.length > 1) {
      stats.multiMatchCompanies++;
      console.warn(
        `WARNING: "${src.company}" matches ${matches.length} DB rows ` +
          `(ids: ${matches.map((m) => m.id).join(', ')}). Applying to all.`,
      );
    }

    for (const contact of matches) {
      const patch = {};

      // Always update job_title (only if the Excel actually has a value).
      if (!isEmpty(src.job_title) && src.job_title !== contact.job_title) {
        patch.job_title = src.job_title;
      }

      // Update-if-empty fields: only fill when DB value is blank AND Excel has a value.
      const fillIfEmpty = [
        'prefix',
        'contact_person',
        'contact_number',
        'email',
        'area_code',
      ];
      for (const field of fillIfEmpty) {
        if (isEmpty(contact[field]) && !isEmpty(src[field])) {
          patch[field] = src[field];
        }
      }

      if (Object.keys(patch).length === 0) {
        stats.contactsNoChange++;
        continue;
      }

      updates.push({ id: contact.id, patch });
    }
  }

  console.log(
    `Planned ${updates.length} row update(s) across ${stats.matchedCompanies} matched compan${stats.matchedCompanies === 1 ? 'y' : 'ies'}.`,
  );

  // --- Apply updates in batches (~UPDATE_BATCH_SIZE per batch) ---
  // Supabase has no multi-row-different-values UPDATE, so each row is its own
  // request; we batch them with Promise.all to keep throughput reasonable.
  for (let i = 0; i < updates.length; i += UPDATE_BATCH_SIZE) {
    const batch = updates.slice(i, i + UPDATE_BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async ({ id, patch }) => {
        const { error } = await supabase
          .from('contacts')
          .update(patch)
          .eq('id', id);
        return { id, error };
      }),
    );

    for (const { id, error } of results) {
      if (error) {
        stats.errors++;
        console.error(`  Error updating contact id=${id}: ${error.message}`);
      } else {
        stats.contactsUpdated++;
      }
    }

    const done = Math.min(i + UPDATE_BATCH_SIZE, updates.length);
    console.log(`  Applied ${done}/${updates.length} updates...`);
  }

  // --- Summary ---
  console.log('');
  console.log('='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`Excel rows processed:        ${stats.excelRows}`);
  console.log(`Excel unique companies:      ${stats.excelCompanies}`);
  console.log(`Companies matched in DB:     ${stats.matchedCompanies}`);
  console.log(`Companies not found in DB:   ${stats.notFound}`);
  console.log(`Companies w/ multiple matches: ${stats.multiMatchCompanies}`);
  console.log(`Contacts successfully updated: ${stats.contactsUpdated}`);
  console.log(`Contacts already up-to-date:   ${stats.contactsNoChange}`);
  console.log(`Errors:                      ${stats.errors}`);
  console.log('='.repeat(70));

  if (stats.errors > 0) {
    console.error(`Completed with ${stats.errors} error(s).`);
    process.exit(1);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
