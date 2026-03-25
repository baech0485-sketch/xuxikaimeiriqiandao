export const PET_TYPES = [
  { type: 'cat', name: '小橘猫', emoji: '🐱', image: '/pets/cat.webp', imagePng: '/pets/cat.png', imageEating: '/pets/cat-eating.webp', imageEatingPng: '/pets/cat-eating.png', imageHungry: '/pets/cat-hungry.webp', imageHungryPng: '/pets/cat-hungry.png', imageSad: '/pets/cat-sad.webp', imageSadPng: '/pets/cat-sad.png', personality: '贪吃又黏人', food: '小鱼干', foodEmoji: '🐟' },
  { type: 'dog', name: '柯基犬', emoji: '🐶', image: '/pets/dog.webp', imagePng: '/pets/dog.png', imageEating: '/pets/dog-eating.webp', imageEatingPng: '/pets/dog-eating.png', imageHungry: '/pets/dog-hungry.webp', imageHungryPng: '/pets/dog-hungry.png', imageSad: '/pets/dog-sad.webp', imageSadPng: '/pets/dog-sad.png', personality: '活泼爱运动', food: '骨头饼干', foodEmoji: '🦴' },
  { type: 'rabbit', name: '小白兔', emoji: '🐰', image: '/pets/rabbit.webp', imagePng: '/pets/rabbit.png', imageEating: '/pets/rabbit-eating.webp', imageEatingPng: '/pets/rabbit-eating.png', imageHungry: '/pets/rabbit-hungry.webp', imageHungryPng: '/pets/rabbit-hungry.png', imageSad: '/pets/rabbit-sad.webp', imageSadPng: '/pets/rabbit-sad.png', personality: '安静爱读书', food: '胡萝卜', foodEmoji: '🥕' },
  { type: 'panda', name: '小熊猫', emoji: '🐼', image: '/pets/panda.webp', imagePng: '/pets/panda.png', imageEating: '/pets/panda-eating.webp', imageEatingPng: '/pets/panda-eating.png', imageHungry: '/pets/panda-hungry.webp', imageHungryPng: '/pets/panda-hungry.png', imageSad: '/pets/panda-sad.webp', imageSadPng: '/pets/panda-sad.png', personality: '憨憨的学霸', food: '竹笋糕', foodEmoji: '🎋' },
  { type: 'dragon', name: '小飞龙', emoji: '🐉', image: '/pets/dragon.webp', imagePng: '/pets/dragon.png', imageEating: '/pets/dragon-eating.webp', imageEatingPng: '/pets/dragon-eating.png', imageHungry: '/pets/dragon-hungry.webp', imageHungryPng: '/pets/dragon-hungry.png', imageSad: '/pets/dragon-sad.webp', imageSadPng: '/pets/dragon-sad.png', personality: '神秘又酷炫', food: '星星果', foodEmoji: '⭐' },
] as const

export type PetType = typeof PET_TYPES[number]['type']

export const TASKS = [
  { key: 'literacy', name: '认字', emoji: '📝' },
  { key: 'math', name: '摩比爱数学', emoji: '🔢' },
  { key: 'writing', name: '写字', emoji: '✏️' },
  { key: 'reading', name: '读书', emoji: '📖' },
  { key: 'drawing', name: '画画', emoji: '🎨' },
  { key: 'skipping', name: '跳绳', emoji: '🤸' },
  { key: 'english', name: '学英语', emoji: '🔤' },
] as const

export type TaskKey = typeof TASKS[number]['key']

export const PET_MOODS = {
  happy: { label: '开心', message: '好开心！谢谢你喂我~', color: '#7BA88E' },
  hungry: { label: '饿了', message: '我饿了~快来喂我吧！', color: '#C4A060' },
  sad: { label: '伤心', message: '你是不是忘了我...', color: '#A0A0A0' },
  runaway: { label: '出走', message: '你的宠物离家出走了...', color: '#C08080' },
} as const

export type PetMood = keyof typeof PET_MOODS

export const DAILY_GOAL = 3          // 每日完成3个任务即算达标
export const RUNAWAY_DAYS = 3
export const RECALL_DAYS = 3
