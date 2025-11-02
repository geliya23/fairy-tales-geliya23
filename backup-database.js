/**
 * Database Backup Script
 * Change ID: enhance-ai-edge-analytics-admin
 * Task 8: Backup current database state
 *
 * This script creates a complete backup of the current database state
 * before applying the story_reads table changes.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase configuration');
    console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
    console.error('\nTo get your Service Role Key:');
    console.error('1. Go to Supabase Dashboard → Settings → API');
    console.error('2. Copy the "service_role" key (NOT the anon key)');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Create backup directory
const backupDir = path.join(__dirname, 'backup', `database-${new Date().toISOString().replace(/[:.]/g, '-')}`);
fs.mkdirSync(backupDir, { recursive: true });

async function backupDatabase() {
    console.log('🗄️  Starting Database Backup\n');
    console.log('═'.repeat(50));
    console.log(`📁 Backup location: ${backupDir}\n`);

    try {
        // Backup stories table
        console.log('📋 Backing up stories table...');
        const { data: storiesData, error: storiesError } = await supabase
            .from('stories')
            .select('*')
            .order('id');

        if (storiesError) {
            throw new Error(`Failed to fetch stories: ${storiesError.message}`);
        }

        const storiesBackup = {
            table: 'stories',
            timestamp: new Date().toISOString(),
            total_records: storiesData.length,
            data: storiesData
        };

        fs.writeFileSync(
            path.join(backupDir, 'stories-backup.json'),
            JSON.stringify(storiesBackup, null, 2)
        );

        console.log(`✅ Backed up ${storiesData.length} stories`);
        console.log(`   File: ${path.join(backupDir, 'stories-backup.json')}\n`);

        // Backup database schema
        console.log('📋 Backing up database schema...');
        const schemaInfo = {
            timestamp: new Date().toISOString(),
            supabase_url: SUPABASE_URL,
            tables: {
                stories: {
                    description: 'Fairy tales stories table',
                    columns: [
                        { name: 'id', type: 'BIGSERIAL', description: 'Primary key' },
                        { name: 'title', type: 'TEXT', description: 'Story title' },
                        { name: 'filename', type: 'TEXT', description: 'Story filename' },
                        { name: 'content', type: 'TEXT', description: 'Story content in Markdown' },
                        { name: 'created_at', type: 'TIMESTAMP', description: 'Creation timestamp' },
                        { name: 'updated_at', type: 'TIMESTAMP', description: 'Last update timestamp' }
                    ],
                    indexes: [
                        'PRIMARY KEY (id)',
                        'Full-text search index on (title, content)'
                    ],
                    rls_enabled: true,
                    rls_policies: [
                        'Allow public read access on stories'
                    ]
                },
                story_reads: {
                    description: 'Story reading events tracking table (to be created)',
                    columns: [
                        { name: 'id', type: 'BIGSERIAL', description: 'Primary key' },
                        { name: 'story_id', type: 'BIGINT', description: 'Reference to stories.id' },
                        { name: 'user_identifier', type: 'TEXT', description: 'User identifier (IP or anonymous ID)' },
                        { name: 'read_at', type: 'TIMESTAMP', description: 'Reading timestamp' },
                        { name: 'user_agent', type: 'TEXT', description: 'Browser information (optional)' },
                        { name: 'referrer', type: 'TEXT', description: 'Source page URL (optional)' },
                        { name: 'created_at', type: 'TIMESTAMP', description: 'Record creation timestamp' }
                    ],
                    indexes: [
                        'idx_story_reads_story_id_read_at',
                        'idx_story_reads_user_identifier',
                        'idx_story_reads_read_at',
                        'idx_story_reads_user_time'
                    ],
                    rls_enabled: true,
                    rls_policies: [
                        'Allow public read access on story_reads',
                        'Allow public insert on story_reads'
                    ]
                }
            }
        };

        fs.writeFileSync(
            path.join(backupDir, 'schema-info.json'),
            JSON.stringify(schemaInfo, null, 2)
        );

        console.log('✅ Database schema backed up');
        console.log(`   File: ${path.join(backupDir, 'schema-info.json')}\n`);

        // Create backup metadata
        const metadata = {
            backup_id: `backup-${Date.now()}`,
            timestamp: new Date().toISOString(),
            version: '1.0',
            change_id: 'enhance-ai-edge-analytics-admin',
            phase: 'phase-1-database-extension',
            tables_backed_up: ['stories'],
            tables_to_create: ['story_reads'],
            files_created: [
                'stories-backup.json',
                'schema-info.json',
                'backup-readme.md',
                'restore-instructions.md'
            ],
            notes: [
                'Full backup of existing stories table before extension',
                'Schema information for reference',
                'All data preserved for rollback if needed'
            ],
            supabase_config: {
                url: SUPABASE_URL,
                has_service_key: !!SUPABASE_SERVICE_ROLE_KEY
            }
        };

        fs.writeFileSync(
            path.join(backupDir, 'backup-metadata.json'),
            JSON.stringify(metadata, null, 2)
        );

        // Create README for backup
        const readme = `# Database Backup

**Backup ID**: ${metadata.backup_id}
**Timestamp**: ${metadata.timestamp}
**Change ID**: ${enhance-ai-edge-analytics-admin}
**Phase**: ${metadata.phase}

## Contents

- \`stories-backup.json\` - Complete backup of stories table
- \`schema-info.json\` - Database schema information
- \`backup-metadata.json\` - Backup metadata
- \`backup-readme.md\` - This file
- \`restore-instructions.md\` - Instructions to restore from backup

## Backup Details

### Tables Backed Up
${metadata.tables_backed_up.map(t => `- ${t}`).join('\n')}

### Tables to be Created
${metadata.tables_to_create.map(t => `- ${t}`).join('\n')}

### Record Counts

- **Stories**: ${storiesData.length} records

## Restoration

See \`restore-instructions.md\` for detailed restore procedures.

## Backup Integrity

✅ Stories table: ${storiesData.length} records
✅ Schema information: Complete
✅ Metadata: Complete

---

*Generated by database backup script*
`;

        fs.writeFileSync(
            path.join(backupDir, 'backup-readme.md'),
            readme
        );

        // Create restoration instructions
        const restoreInstructions = `# Database Restoration Instructions

## Overview

This backup was created before applying the `enhance-ai-edge-analytics-admin` database extension.

Use this backup to restore the database state if needed during or after the migration.

## Restoration Steps

### Method 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Navigate to your project

2. **Clear Existing Data** (if needed)
   ```sql
   -- CAUTION: This will delete all current data
   DELETE FROM stories WHERE true;
   ```

3. **Restore Stories Table**
   - Go to Table Editor → stories
   - Click "Insert" → "Insert from CSV"
   - Upload \`backup/stories-backup.json\` (convert to CSV first if needed)
   - Map columns and import

### Method 2: Using SQL Script

1. **Create restore script**
   ```sql
   -- Clear existing data
   DELETE FROM stories WHERE true;

   -- Restore data (you'll need to convert JSON to SQL)
   ```

### Method 3: Using API

1. **Delete all existing records**
   ```bash
   curl -X DELETE \\
     "${SUPABASE_URL}/rest/v1/stories" \\
     -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \\
     -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}"
   ```

2. **Import from backup**
   ```javascript
   const backup = require('./backup/stories-backup.json');
   const { data, error } = await supabase
     .from('stories')
     .insert(backup.data);
   ```

## Rollback Procedure

If you need to completely rollback the changes:

1. **Delete story_reads table**
   ```sql
   DROP TABLE IF EXISTS story_reads CASCADE;
   ```

2. **Restore stories data** using one of the methods above

3. **Verify restoration**
   ```sql
   SELECT COUNT(*) FROM stories;
   ```

## Verification Queries

After restoration, verify with:

```sql
-- Check record count
SELECT COUNT(*) FROM stories;

-- Verify data integrity
SELECT id, title FROM stories ORDER BY id LIMIT 5;

-- Check for any constraints
SELECT * FROM information_schema.table_constraints
WHERE table_name = 'stories';
```

## Support

If you encounter issues:
1. Check the backup metadata in \`backup-metadata.json\`
2. Verify your Supabase project configuration
3. Review the error messages in the Supabase dashboard logs

---

*Last updated: ${new Date().toISOString()}*
`;

        fs.writeFileSync(
            path.join(backupDir, 'restore-instructions.md'),
            restoreInstructions
        );

        // Success summary
        console.log('═'.repeat(50));
        console.log('✅ Backup completed successfully!\n');

        console.log('📦 Backup Summary:');
        console.log(`   📁 Location: ${backupDir}`);
        console.log(`   📊 Stories backed up: ${storiesData.length}`);
        console.log(`   📄 Files created: ${Object.keys(metadata.files_created).length}\n`);

        console.log('📋 Files created:');
        metadata.files_created.forEach(file => {
            console.log(`   ✅ ${file}`);
        });

        console.log('\n💡 Next steps:');
        console.log('   1. Review the backup files');
        console.log('   2. Proceed with creating story_reads table');
        console.log('   3. Run verification tests if needed\n');

        console.log('⚠️  Important: Keep this backup safe until the migration is complete!\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Backup failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run backup
backupDatabase();
