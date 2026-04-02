const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const homePageSource = fs.readFileSync(path.join(rootDir, 'app/page.tsx'), 'utf8')

test('首页应具备投喂的乐观更新辅助函数', () => {
  assert.match(
    homePageSource,
    /function applyOptimisticFeed/,
    '投喂应先做本地乐观更新，避免投喂面板等待接口后才变化',
  )
})

test('投喂逻辑应在请求前先应用乐观更新', () => {
  assert.match(
    homePageSource,
    /const \{ nextRecord, nextUser \} = applyOptimisticFeed\(record, user, taskKey\)/,
    'handleFeed 应在发请求前先计算乐观更新结果',
  )
  assert.match(
    homePageSource,
    /if \(nextRecord\) setRecord\(nextRecord\)[\s\S]*if \(nextUser\) setUser\(nextUser\)[\s\S]*const res = await fetch\('\/api\/pet\/feed'/,
    '投喂面板应先更新本地状态，再请求接口',
  )
})
