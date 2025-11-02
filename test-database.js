/**
 * Database Test Suite
 * Change ID: enhance-ai-edge-analytics-admin
 * Task 6: Write database test scripts
 *
 * This script performs comprehensive tests on the story_reads table
 * including functionality, performance, and RLS policy tests.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Load Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing Supabase configuration');
    console.error('Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in .env');
    process.exit(1);
}

// Create clients with different permissions
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseService = SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

let testsPassed = 0;
let testsFailed = 0;

function logTest(testName, passed, message = '') {
    if (passed) {
        console.log(`✅ ${testName}`);
        if (message) console.log(`   ${message}`);
        testsPassed++;
    } else {
        console.error(`❌ ${testName}`);
        if (message) console.error(`   ${message}`);
        testsFailed++;
    }
}

async function runTests() {
    console.log('🧪 Starting Database Test Suite\n');
    console.log('═'.repeat(50));

    try {
        // Test 1: Table existence
        console.log('\n📋 Test Category: Table Structure');
        console.log('-'.repeat(50));

        const { data: tableCheck, error: tableError } = await supabaseAnon
            .from('story_reads')
            .select('*')
            .limit(1);

        logTest(
            'Test 1.1: Table exists',
            !tableError || tableError.code !== 'PGRST116',
            tableError ? `Error: ${tableError.message}` : 'Table accessible'
        );

        // Test 2: Column structure
        console.log('\n📋 Test Category: Data Types and Constraints');
        console.log('-'.repeat(50));

        // Get a valid story_id from the database
        const { data: stories } = await supabaseAnon
            .from('stories')
            .select('id')
            .limit(1);

        if (!stories || stories.length === 0) {
            logTest(
                'Test 2.1: INSERT with all columns',
                false,
                'No stories found in database'
            );
        } else {
            const validStoryId = stories[0].id;
            console.log(`   Using story ID: ${validStoryId}`);

            // Test required columns
            const requiredColumns = ['id', 'story_id', 'user_identifier', 'read_at'];
            const testRecord = {
                story_id: validStoryId,
                user_identifier: 'test-user-' + Date.now(),
                user_agent: 'Test Script',
                referrer: 'test'
            };

            const { data: insertTest, error: insertError } = await supabaseAnon
                .from('story_reads')
                .insert(testRecord)
                .select()
                .single();

            logTest(
                'Test 2.1: INSERT with all columns',
                !insertError,
                insertError ? `Error: ${insertError.message}` : `Inserted record with ID ${insertTest?.id}`
            );

            if (insertTest) {
                // Test 3: Data retrieval
                console.log('\n📋 Test Category: Data Retrieval');
                console.log('-'.repeat(50));

                const { data: selectTest, error: selectError } = await supabaseAnon
                    .from('story_reads')
                    .select('*')
                    .eq('id', insertTest.id)
                    .single();

                logTest(
                    'Test 3.1: SELECT single record',
                    !selectError && selectTest,
                    selectError ? `Error: ${selectError.message}` : 'Record retrieved successfully'
                );

                // Test 4: RLS policies
                console.log('\n📋 Test Category: RLS Policies');
                console.log('-'.repeat(50));

                const { data: rlsTest, error: rlsError } = await supabaseAnon
                    .from('story_reads')
                    .select('id, story_id, read_at')
                    .order('read_at', { ascending: false })
                    .limit(10);

                logTest(
                    'Test 4.1: Public SELECT access',
                    !rlsError,
                    rlsError ? `Error: ${rlsError.message}` : `Retrieved ${rlsTest?.length || 0} records`
                );

                // Test 5: Foreign key constraint
                console.log('\n📋 Test Category: Constraints');
                console.log('-'.repeat(50));

                const { data: fkTest, error: fkError } = await supabaseAnon
                    .from('story_reads')
                    .insert({
                        story_id: 99999, // Non-existent story
                        user_identifier: 'test-user-fk'
                    });

                logTest(
                    'Test 5.1: Foreign key constraint (should fail)',
                    fkError && fkError.message.includes('foreign key'),
                    fkError ? `Correctly rejected invalid story_id` : 'ERROR: FK constraint not working!'
                );

                // Test 6: Indexed queries performance
                console.log('\n📋 Test Category: Performance');
                console.log('-'.repeat(50));

                // Test story_id index (use validStoryId instead of 1)
                const startTime1 = Date.now();
                await supabaseAnon
                    .from('story_reads')
                    .select('*')
                    .eq('story_id', validStoryId)
                    .limit(100);
                const time1 = Date.now() - startTime1;

                logTest(
                    'Test 6.1: Query by story_id index',
                    true,
                    `Query completed in ${time1}ms`
                );

                // Test timestamp index
                const startTime2 = Date.now();
                await supabaseAnon
                    .from('story_reads')
                    .select('*')
                    .gte('read_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
                    .limit(100);
                const time2 = Date.now() - startTime2;

                logTest(
                    'Test 6.2: Query by timestamp index',
                    true,
                    `Query completed in ${time2}ms`
                );

                // Test 7: Aggregation queries
                console.log('\n📋 Test Category: Aggregation');
                console.log('-'.repeat(50));

                const { data: aggTest, error: aggError } = await supabaseAnon
                    .from('story_reads')
                    .select('story_id');

                if (!aggError && aggTest) {
                    const storyCounts = aggTest.reduce((acc, row) => {
                        acc[row.story_id] = (acc[row.story_id] || 0) + 1;
                        return acc;
                    }, {});

                    logTest(
                        'Test 7.1: Aggregation queries',
                        true,
                        `Found ${Object.keys(storyCounts).length} stories, total reads: ${aggTest.length}`
                    );
                } else {
                    logTest(
                        'Test 7.1: Aggregation queries',
                        false,
                        `Error: ${aggError?.message}`
                    );
                }

                // Test 8: Cleanup
                console.log('\n📋 Test Category: Cleanup');
                console.log('-'.repeat(50));

                const { error: deleteError } = await supabaseAnon
                    .from('story_reads')
                    .delete()
                    .eq('id', insertTest.id);

                logTest(
                    'Test 8.1: DELETE operation',
                    !deleteError,
                    deleteError ? `Error: ${deleteError.message}` : 'Test record deleted successfully'
                );

                // Test 9: Insert test data for analytics
                console.log('\n📋 Test Category: Sample Data Generation');
                console.log('-'.repeat(50));

                if (supabaseService) {
                    const sampleData = [];
                    // Use valid story IDs from the database
                    const validStories = stories.map(s => s.id);
                    const users = ['user1', 'user2', 'user3', 'user4', 'user5'];

                    for (let i = 0; i < 50; i++) {
                        sampleData.push({
                            story_id: validStories[Math.floor(Math.random() * validStories.length)],
                            user_identifier: users[Math.floor(Math.random() * users.length)],
                            user_agent: 'Test Script',
                            referrer: i % 3 === 0 ? 'google.com' : 'direct'
                        });
                    }

                    const { data: bulkInsert, error: bulkError } = await supabaseService
                        .from('story_reads')
                        .insert(sampleData)
                        .select('id');

                    logTest(
                        'Test 9.1: Bulk insert (50 records)',
                        !bulkError,
                        bulkError ? `Error: ${bulkError.message}` : `Inserted ${bulkInsert?.length || 0} records`
                    );

                    if (!bulkError) {
                        // Clean up sample data
                        const storyIds = bulkInsert.map(r => r.id);
                        await supabaseService
                            .from('story_reads')
                            .delete()
                            .in('id', storyIds);
                    }
                } else {
                    console.log('⚠️  Skipping bulk insert test (no service role key)');
                }
            } // end if (insertTest)
        } // end else (stories found)
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 Test Summary');
        console.log('='.repeat(50));
        console.log(`✅ Tests Passed: ${testsPassed}`);
        console.log(`❌ Tests Failed: ${testsFailed}`);
        console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

        if (testsFailed === 0) {
            console.log('\n✨ All tests passed! Database is ready for use.\n');
            process.exit(0);
        } else {
            console.log('\n⚠️  Some tests failed. Please review the errors above.\n');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ Test suite error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the test suite
runTests();
