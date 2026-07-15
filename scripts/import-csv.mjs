import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  realtime: {
    transport: ws,
  },
});

async function importCSVs() {
  try {
    console.log('Reading CSV files...');

    const part1Path = path.join(process.cwd(), 'masterlist_upload_part1.csv');
    const part2Path = path.join(process.cwd(), 'masterlist_upload_part2.csv');

    const part1Data = fs.readFileSync(part1Path, 'utf-8');
    const part2Data = fs.readFileSync(part2Path, 'utf-8');

    const records1 = parse(part1Data, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const records2 = parse(part2Data, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const allRecords = [...records1, ...records2];
    console.log(`Total records to import: ${allRecords.length}`);

    // Transform CSV to contacts table format
    const contacts = allRecords.map((record) => ({
      company: record['Title'] || '',
      contact_person: record['Contact Person'] || '',
      prefix: record['Prefix'] || '',
      contact_number: record['Contact Number'] || '',
      email: record['Email'] === '0' || record['Email'] === '' ? null : record['Email'],
      address: record['Description'] || '',
      area_code: record['Area Code'] || '',
      status: 'New',
      comments: null,
    }));

    // Batch insert (500 per request to avoid timeout)
    const batchSize = 500;
    let inserted = 0;

    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      const { error } = await supabase.from('contacts').insert(batch);

      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        process.exit(1);
      }

      inserted += batch.length;
      console.log(`Inserted ${inserted}/${contacts.length}`);
    }

    console.log(`✅ Successfully imported ${inserted} contacts!`);

    // Verify count
    const { count, error: countError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`Total contacts in database: ${count}`);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

importCSVs();
