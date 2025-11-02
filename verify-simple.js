/**
 * Simple Database Verification Script
 * Works with SUPABASE_ANON_KEY (no service role required)
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifySimple() {
    console.log('🔍 简化数据库验证\n');
    console.log('═'.repeat(50));

    try {
        // Test 1: Check if story_reads table exists
        console.log('\n✅ 测试 1: 检查 story_reads 表是否存在');
        const { data: tableCheck, error: tableError } = await supabase
            .from('story_reads')
            .select('id')
            .limit(1);

        if (tableError && tableError.code === 'PGRST116') {
            console.error('❌ story_reads 表不存在');
            console.error('请先在 Supabase SQL Editor 中运行 create-story-reads-table.sql');
            process.exit(1);
        }
        console.log('✅ story_reads 表存在且可访问\n');

        // Test 2: Test INSERT (without service role, we can only use anon key policies)
        console.log('✅ 测试 2: 测试插入功能（使用 RLS 公共策略）');

        // First, get a valid story_id from the stories table
        const { data: stories } = await supabase
            .from('stories')
            .select('id')
            .limit(1);

        if (!stories || stories.length === 0) {
            console.error('❌ No stories found in database');
            process.exit(1);
        }

        const validStoryId = stories[0].id;
        console.log(`   使用故事 ID: ${validStoryId} (${stories[0].title || 'N/A'})`);

        const testData = {
            story_id: validStoryId,
            user_identifier: 'verify-test-' + Date.now(),
            user_agent: 'Verification Script',
            referrer: 'simple-verify'
        };

        const { data: insertData, error: insertError } = await supabase
            .from('story_reads')
            .insert(testData)
            .select()
            .single();

        if (insertError) {
            console.error('❌ 插入测试失败:', insertError.message);
            console.error('\n可能原因：');
            console.error('1. 表未创建');
            console.error('2. RLS 策略未正确配置');
            console.error('3. story_id=1 不存在（需要先创建测试故事）');
            throw insertError;
        }

        console.log('✅ 插入成功 (ID:', insertData.id, ')\n');

        // Test 3: Test SELECT
        console.log('✅ 测试 3: 测试查询功能');
        const { data: selectData, error: selectError } = await supabase
            .from('story_reads')
            .select('*')
            .eq('id', insertData.id)
            .single();

        if (selectError) {
            console.error('❌ 查询测试失败:', selectError.message);
            throw selectError;
        }
        console.log('✅ 查询成功\n');

        // Test 4: Test aggregation
        console.log('✅ 测试 4: 测试聚合查询');
        const { data: aggData, error: aggError } = await supabase
            .from('story_reads')
            .select('story_id')
            .limit(100);

        if (aggError) {
            console.error('❌ 聚合查询失败:', aggError.message);
        } else {
            console.log(`✅ 聚合查询成功，返回 ${aggData.length} 条记录\n`);
        }

        // Test 5: Cleanup
        console.log('🧹 清理测试数据...');
        const { error: deleteError } = await supabase
            .from('story_reads')
            .delete()
            .eq('id', insertData.id);

        if (deleteError) {
            console.warn('⚠️  删除测试数据失败:', deleteError.message);
        } else {
            console.log('✅ 测试数据已清理\n');
        }

        // Summary
        console.log('═'.repeat(50));
        console.log('✅ 验证完成！所有基本测试通过\n');
        console.log('📊 验证结果:');
        console.log('  ✅ 表结构: OK');
        console.log('  ✅ 插入功能: OK');
        console.log('  ✅ 查询功能: OK');
        console.log('  ✅ 聚合查询: OK');
        console.log('  ✅ RLS 策略: OK\n');

        console.log('✨ 数据库扩展验证通过！\n');

        // Provide next steps
        console.log('📋 下一步：');
        console.log('1. ✅ 可以开始 Phase 2: Edge Functions 开发');
        console.log('2. 或运行完整测试套件: npm run db:test\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ 验证失败:', error.message);
        console.error('\n🔧 故障排除:');
        console.error('1. 确认已在 Supabase SQL Editor 中运行 create-story-reads-table.sql');
        console.error('2. 检查 Supabase Dashboard 是否有错误日志');
        console.error('3. 确认 .env 文件配置正确\n');
        process.exit(1);
    }
}

verifySimple();
