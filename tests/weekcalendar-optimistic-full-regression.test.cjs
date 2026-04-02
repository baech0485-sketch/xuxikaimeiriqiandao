const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const homePageSource = fs.readFileSync(path.join(rootDir, 'app/page.tsx'), 'utf8')
const weekCalendarSource = fs.readFileSync(path.join(rootDir, 'components/WeekCalendar.tsx'), 'utf8')

test('首页应向周历传递当前已达标日期用于即时领取星星', () => {
  assert.match(
    homePageSource,
    /optimisticFullDates=\{optimisticFullDates\}/,
    '首页应把当前已达标日期传给周历组件',
  )
})

test('周历组件应支持乐观达标日期并直接显示可领取星星', () => {
  assert.match(
    weekCalendarSource,
    /optimisticFullDates\?: string\[\]/,
    '周历组件应接收 optimisticFullDates 参数',
  )
  assert.match(
    weekCalendarSource,
    /const isOptimisticFull = optimisticFullDates\.includes\(dateStr\)/,
    '周历组件应判断当天是否属于乐观达标日期',
  )
  assert.match(
    weekCalendarSource,
    /status = \(record\.allCompleted \|\| isOptimisticFull\) \? 'full' : doneCount > 0 \? 'partial' : 'none'/,
    '周历组件应在乐观达标时直接把状态切为 full',
  )
})
