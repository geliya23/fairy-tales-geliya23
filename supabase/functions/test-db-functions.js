/**
 * Quick test for database functions
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFunctions() {
    console.log('🧪 Testing Database Functions\n');
    
    try {
        // Test 1: Check if functions exist
        console.log('1️⃣ Checking if functions exist...');
        const { data: functions, error: funcError } = await supabase
            .rpc('get_top_stories', { p_interval: '7 days', p_limit: 5 });
            
        if (funcError) {
            console.error('❌ Function get_top_stories not found or error:', funcError.message);
        } else {
            console.log('✅ get_top_stories works:', functions);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
    
    try {
        // Test 2: Check stories table
        console.log('\n2️⃣ Checking stories table...');
        const { data: stories, error: storyError } = await supabase
            .from('stories')
            .select('id, title')
            .limit(5);
            
        if (storyError) {
            console.error('❌ Stories table error:', storyError.message);
        } else {
            console.log('✅ Stories table:', stories);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
    
    try {
        // Test 3: Check story_reads table
        console.log('\n3️⃣ Checking story_reads table...');
        const { data: reads, error: readError } = await supabase
            .from('story_reads')
            .select('id, story_id')
            .limit(5);
            
        if (readError) {
            console.error('❌ story_reads table error:', readError.message);
        } else {
            console.log('✅ story_reads table:', reads);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testFunctions();
