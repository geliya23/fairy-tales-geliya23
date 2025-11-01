const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 验证环境变量
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ 错误: 请在 .env 文件中配置 SUPABASE_URL 和 SUPABASE_ANON_KEY');
  console.error('   复制 .env.example 为 .env 并填入配置');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function migrateStories() {
  try {
    console.log('🚀 开始迁移故事到Supabase...\n');

    // 1. 读取stories.json
    const storiesIndexPath = path.join(__dirname, 'stories.json');
    if (!fs.existsSync(storiesIndexPath)) {
      throw new Error('找不到 stories.json 文件');
    }

    const storiesIndex = JSON.parse(
      fs.readFileSync(storiesIndexPath, 'utf-8')
    );

    console.log(`📚 找到 ${storiesIndex.length} 个故事`);

    // 2. 遍历所有故事
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < storiesIndex.length; i++) {
      const story = storiesIndex[i];
      console.log(`\n处理第 ${i + 1}/${storiesIndex.length} 个故事: ${story.title}`);

      // 3. 读取故事内容
      const storyPath = path.join(__dirname, 'story', story.file);
      if (!fs.existsSync(storyPath)) {
        console.error(`❌ 文件不存在: ${storyPath}`);
        failCount++;
        continue;
      }

      const content = fs.readFileSync(storyPath, 'utf-8');

      // 4. 插入到Supabase
      const { data, error } = await supabase
        .from('stories')
        .insert([
          {
            title: story.title,
            filename: story.file,
            content: content
          }
        ])
        .select();

      if (error) {
        console.error(`❌ 插入失败: ${error.message}`);
        failCount++;
      } else {
        console.log(`✅ 成功插入: ${story.title}`);
        successCount++;
      }
    }

    // 5. 统计结果
    console.log('\n' + '='.repeat(50));
    console.log('📊 迁移完成统计:');
    console.log(`   ✅ 成功: ${successCount} 个故事`);
    console.log(`   ❌ 失败: ${failCount} 个故事`);
    console.log(`   📝 总计: ${storiesIndex.length} 个故事`);

    if (failCount === 0) {
      console.log('\n🎉 所有故事迁移成功！');
    } else {
      console.log('\n⚠️  部分故事迁移失败，请检查错误信息');
      process.exit(1);
    }

    // 6. 验证迁移结果
    console.log('\n🔍 验证迁移结果...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('stories')
      .select('id, title, filename')
      .order('id', { ascending: true });

    if (verifyError) {
      console.error('❌ 验证查询失败:', verifyError.message);
    } else {
      console.log(`✅ 数据库中共有 ${verifyData.length} 条记录`);
      console.log('\n数据库中的故事列表:');
      verifyData.forEach((story, index) => {
        console.log(`   ${index + 1}. ${story.title} (${story.filename})`);
      });
    }

  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    console.error('\n堆栈跟踪:');
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行迁移
migrateStories();
