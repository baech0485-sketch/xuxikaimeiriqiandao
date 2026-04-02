const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const homePageSource = fs.readFileSync(path.join(rootDir, 'app/page.tsx'), 'utf8')

test('首页应具备任务完成的乐观更新辅助函数', () => {
  assert.match(
    homePageSource,
    /function applyOptimisticTaskCompletion/,
    '任务完成应先做本地乐观更新，避免等待接口后才反馈',
  )
})

test('首页应具备星星收集的乐观更新辅助函数', () => {
  assert.match(
    homePageSource,
    /function applyOptimisticStarCollection/,
    '星星收集应先做本地乐观更新，避免等待接口后才反馈',
  )
})

test('首页不应人为延迟任务完成庆祝动画', () => {
  assert.doesNotMatch(
    homePageSource,
    /setTimeout\(\(\)\s*=>\s*setShowCelebration\(true\),\s*500\)/,
    '任务完成后不应再额外等待 500ms 才反馈',
  )
})

test('首页不应人为延迟星星收集后的状态刷新', () => {
  assert.doesNotMatch(
    homePageSource,
    /setTimeout\(\(\)\s*=>\s*\{\s*setStarBounce\(true\)[\s\S]*setWeekRefresh\(prev => prev \+ 1\)[\s\S]*\},\s*650\)/,
    '星星收集后不应再额外等待 650ms 才刷新计数和周历',
  )
})
