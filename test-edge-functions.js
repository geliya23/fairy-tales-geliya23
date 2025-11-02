/**
 * Edge Functions Test Suite
 * Tests all Edge Functions created in Phase 2
 */

require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const BASE_URL = `${SUPABASE_URL}/functions/v1`;

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

// Test 1: generate-story
async function testGenerateStory() {
    console.log('\n🧪 Test 1: generate-story function');
    console.log('-'.repeat(50));

    try {
        const response = await fetch(`${BASE_URL}/generate-story`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: 'Write a short fairy tale about a brave little mouse who finds a magical cheese.',
                model: 'gpt-3.5-turbo',
                temperature: 0.8
            })
        });

        const result = await response.json();

        logTest(
            'generate-story returns success response',
            result.success === true,
            result.success ? `Generated story ID: ${result.data?.id}` : `Error: ${result.error?.message}`
        );

        if (result.success && result.data) {
            logTest(
                'generate-story returns valid data',
                result.data.id && result.data.title && result.data.content,
                `Title: ${result.data.title}`
            );

            // Return story ID for tracking test
            return result.data.id;
        }

        return null;
    } catch (error) {
        logTest('generate-story function', false, `Error: ${error.message}`);
        return null;
    }
}

// Test 2: analytics/track
async function testAnalyticsTrack(storyId) {
    console.log('\n🧪 Test 2: analytics/track function');
    console.log('-'.repeat(50));

    try {
        const response = await fetch(`${BASE_URL}/analytics-track`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                story_id: storyId,
                user_identifier: 'test-user-' + Date.now(),
                user_agent: 'Node.js Test Script',
                referrer: 'test-script'
            })
        });

        const result = await response.json();

        logTest(
            'analytics/track returns success response',
            result.success === true,
            result.success ? `Tracked reading event ID: ${result.data?.id}` : `Error: ${result.error?.message}`
        );

        if (result.success && result.data) {
            logTest(
                'analytics/track returns valid data',
                result.data.id && result.data.story_id === storyId,
                `Story ID: ${result.data.story_id}`
            );
        }

        return result.success;
    } catch (error) {
        logTest('analytics/track function', false, `Error: ${error.message}`);
        return false;
    }
}

// Test 3: analytics/summary
async function testAnalyticsSummary() {
    console.log('\n🧪 Test 3: analytics/summary function');
    console.log('-'.repeat(50));

    try {
        const response = await fetch(`${BASE_URL}/analytics-summary?period=7d&limit=10`, {
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        const result = await response.json();

        logTest(
            'analytics/summary returns success response',
            result.success === true,
            result.success ? `Total reads: ${result.data?.total_reads}` : `Error: ${result.error?.message}`
        );

        if (result.success && result.data) {
            logTest(
                'analytics/summary returns valid data structure',
                typeof result.data.total_reads === 'number' &&
                Array.isArray(result.data.top_stories) &&
                Array.isArray(result.data.time_series),
                `Top stories: ${result.data.top_stories?.length || 0}`
            );

            if (result.data.top_stories.length > 0) {
                logTest(
                    'analytics/summary returns story data',
                    result.data.top_stories[0].id &&
                    result.data.top_stories[0].title &&
                    result.data.top_stories[0].read_count !== undefined,
                    `First story: ${result.data.top_stories[0].title}`
                );
            }
        }

        return result.success && result.data?.top_stories?.[0]?.id;
    } catch (error) {
        logTest('analytics/summary function', false, `Error: ${error.message}`);
        return false;
    }
}

// Test 4: analytics/story/{id}
async function testAnalyticsStory(storyId) {
    console.log('\n🧪 Test 4: analytics/story function');
    console.log('-'.repeat(50));

    try {
        const response = await fetch(`${BASE_URL}/analytics-story/${storyId}?period=30d`, {
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        const result = await response.json();

        logTest(
            'analytics/story returns success response',
            result.success === true,
            result.success ? `Total reads: ${result.data?.total_reads}` : `Error: ${result.error?.message}`
        );

        if (result.success && result.data) {
            logTest(
                'analytics/story returns valid data structure',
                result.data.story_id === storyId &&
                typeof result.data.total_reads === 'number' &&
                typeof result.data.unique_readers === 'number',
                `Unique readers: ${result.data.unique_readers}`
            );

            logTest(
                'analytics/story includes trend data',
                Array.isArray(result.data.read_trend),
                `Trend points: ${result.data.read_trend?.length || 0}`
            );

            logTest(
                'analytics/story includes referrer data',
                Array.isArray(result.data.top_referrers),
                `Top referrers: ${result.data.top_referrers?.length || 0}`
            );
        }

        return result.success;
    } catch (error) {
        logTest('analytics/story function', false, `Error: ${error.message}`);
        return false;
    }
}

// Test 5: Error handling - invalid story ID
async function testErrorHandling() {
    console.log('\n🧪 Test 5: Error handling');
    console.log('-'.repeat(50));

    try {
        // Test with non-existent story ID
        const response = await fetch(`${BASE_URL}/analytics-story/99999`, {
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        const result = await response.json();

        logTest(
            'Returns 404 for non-existent story',
            result.success === false && result.error?.code === 'STORY_NOT_FOUND',
            `Error code: ${result.error?.code}`
        );

        // Test with invalid input
        const response2 = await fetch(`${BASE_URL}/generate-story`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: 'short' // Too short
            })
        });

        const result2 = await response2.json();

        logTest(
            'Validates input for generate-story',
            result2.success === false && result2.error?.code === 'INVALID_INPUT',
            `Error: ${result2.error?.message}`
        );

        return true;
    } catch (error) {
        logTest('Error handling tests', false, `Error: ${error.message}`);
        return false;
    }
}

// Main test runner
async function runTests() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║        Edge Functions Test Suite - Phase 2                  ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`\n🔗 Base URL: ${BASE_URL}`);

    try {
        // Test 1: Generate story
        const storyId = await testGenerateStory();

        // Test 2: Track reading event
        if (storyId) {
            await testAnalyticsTrack(storyId);
        }

        // Test 3: Get analytics summary
        const hasSummary = await testAnalyticsSummary();

        // Test 4: Get story analytics (use a valid story ID or fallback)
        const testStoryId = storyId || 13; // Use known story ID
        await testAnalyticsStory(testStoryId);

        // Test 5: Error handling
        await testErrorHandling();

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 Test Summary');
        console.log('='.repeat(60));
        console.log(`✅ Tests Passed: ${testsPassed}`);
        console.log(`❌ Tests Failed: ${testsFailed}`);
        console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

        if (testsFailed === 0) {
            console.log('\n✨ All Edge Functions are working correctly!\n');
            process.exit(0);
        } else {
            console.log('\n⚠️  Some tests failed. Please review the errors above.\n');
            console.log('🔧 Troubleshooting:');
            console.log('1. Ensure Edge Functions are deployed');
            console.log('2. Check environment variables (OPENAI_API_KEY, etc.)');
            console.log('3. Run the SQL functions in create-analytics-functions.sql');
            console.log('4. Check Supabase Dashboard → Edge Functions → Logs\n');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ Test suite error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run tests
runTests();
