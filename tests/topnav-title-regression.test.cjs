const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const topNavSource = fs.readFileSync(path.join(rootDir, 'components/TopNav.tsx'), 'utf8')

test('顶部标题应显示为徐熙凯 小宠伴学', () => {
  assert.match(
    topNavSource,
    /徐熙凯 小宠伴学/,
    '顶部标题应包含“徐熙凯 小宠伴学”',
  )
})
