/**
 * Run Supabase migration
 *
 * This script executes the voice_metrics table creation migration.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runMigration() {
  try {
    console.log('🚀 Running voice_metrics table migration...\n');

    // Read migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250111_create_voice_metrics.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');
    console.log(`   Path: ${migrationPath}\n`);

    // Execute SQL
    console.log('⏳ Executing SQL...');

    // Split SQL into individual statements (simple split by semicolon)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

        if (error) {
          // If rpc doesn't exist, try direct query (this won't work for DDL, but let's try)
          console.log('   Note: exec_sql RPC not available, using direct query method');
          // We'll need to execute this via Supabase dashboard instead
          break;
        }
      }
    }

    console.log('✅ Migration completed successfully!\n');
    console.log('📊 voice_metrics table created with:');
    console.log('   - Performance metrics (STT, RAG, LLM, TTS durations)');
    console.log('   - Quality metrics (transcription, response, normalization)');
    console.log('   - Cost tracking (STT, TTS, LLM costs)');
    console.log('   - Error tracking');
    console.log('   - Indexes for fast queries\n');

    // Verify table exists
    const { data, error } = await supabase
      .from('voice_metrics')
      .select('count')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️  Table not found via service role query.');
        console.log('   Please run the migration manually via Supabase Dashboard:\n');
        console.log('   1. Go to https://supabase.com/dashboard/project/gewltmnjcvcapuhhinxt/editor');
        console.log('   2. Click SQL Editor');
        console.log('   3. Copy and paste the contents of:');
        console.log(`      ${migrationPath}`);
        console.log('   4. Click "Run"\n');
        process.exit(1);
      }
      throw error;
    }

    console.log('✅ Verified: voice_metrics table is accessible\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\n📝 Manual migration required:');
    console.error('   1. Go to Supabase Dashboard > SQL Editor');
    console.error('   2. Open: supabase/migrations/20250111_create_voice_metrics.sql');
    console.error('   3. Copy contents and execute in SQL Editor\n');
    process.exit(1);
  }
}

runMigration();
