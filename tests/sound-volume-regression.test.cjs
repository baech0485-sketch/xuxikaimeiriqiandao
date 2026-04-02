const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const soundsSource = fs.readFileSync(path.join(rootDir, 'lib/sounds.ts'), 'utf8')

test('任务完成与交互音效应使用更高的音量配置', () => {
  assert.match(soundsSource, /completePrimary:\s*0\.4/, '任务完成主音应提高到 0.4')
  assert.match(soundsSource, /completeSecondary:\s*0\.34/, '任务完成副音应提高到 0.34')
  assert.match(soundsSource, /celebrationMain:\s*0\.3/, '庆祝主音应提高到 0.3')
  assert.match(soundsSource, /petTapPrimary:\s*0\.22/, '宠物点击主音应提高到 0.22')
  assert.match(soundsSource, /collectAccent:\s*0\.3/, '收集星星高音应提高到 0.3')
})
