const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const foodTraySource = fs.readFileSync(path.join(rootDir, 'components/FoodTray.tsx'), 'utf8')
const feedRouteSource = fs.readFileSync(path.join(rootDir, 'app/api/pet/feed/route.ts'), 'utf8')

test('宠物出走时投喂面板不应被整个隐藏', () => {
  assert.doesNotMatch(
    foodTraySource,
    /if \(petMood === 'runaway'\) return null/,
    '出走状态仍应保留投喂入口用于召回',
  )
})

test('宠物出走时应显示召回引导文案', () => {
  assert.match(
    foodTraySource,
    /完成全部任务后可投喂召回/,
    '出走状态应提示完成全部任务后可投喂召回',
  )
})

test('出走状态的召回进度每天只能因首次投喂增加一次', () => {
  assert.match(
    feedRouteSource,
    /if \(record\.allCompleted && record\.fedCount === 1\)/,
    '召回进度应只在当天首次投喂后增加一次',
  )
})
