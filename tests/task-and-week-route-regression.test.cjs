const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8')
}

test('任务常量包含骑自行车任务', () => {
  const constantsSource = readProjectFile('lib/constants.ts')

  assert.match(constantsSource, /key:\s*'cycling'/, '应定义 cycling 任务 key')
  assert.match(constantsSource, /name:\s*'骑自行车'/, '应定义骑自行车任务名称')
  assert.match(constantsSource, /foodName:\s*'果汁'/, '骑自行车任务应配置对应奖励食物')
})

test('每日记录模型为骑自行车任务预留持久化字段', () => {
  const dailyRecordSource = readProjectFile('lib/models/DailyRecord.ts')

  assert.match(dailyRecordSource, /\bcycling:\s*TaskStatus\b/, '任务类型定义中应包含 cycling')
  assert.match(
    dailyRecordSource,
    /cycling:\s*\{\s*type:\s*TaskStatusSchema,\s*default:\s*\(\)\s*=>\s*\(\{\}\)\s*\}/s,
    'Mongoose schema 中应包含 cycling 字段',
  )
})

test('本周记录接口必须禁用静态缓存', () => {
  const weekRouteSource = readProjectFile('app/api/daily/week/route.ts')

  assert.match(
    weekRouteSource,
    /export const dynamic = 'force-dynamic'/,
    '周记录接口必须显式声明 force-dynamic，避免星星领取状态卡住',
  )
})
