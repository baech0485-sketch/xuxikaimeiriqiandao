import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 多邻国风格配色
        duo: {
          green: '#58CC02',
          'green-dark': '#46A302',
          'green-light': '#D7FFB8',
          blue: '#1CB0F6',
          'blue-dark': '#1899D6',
          'blue-light': '#DDF4FF',
          red: '#FF4B4B',
          'red-dark': '#EA2B2B',
          orange: '#FF9600',
          'orange-dark': '#E68600',
          yellow: '#FFC800',
          purple: '#CE82FF',
          bg: '#F7F7F7',
          surface: '#FFFFFF',
          border: '#E5E5E5',
          text: '#3C3C3C',
          'text-secondary': '#777777',
          'text-light': '#AFAFAF',
        },
        // 保留旧色兼容（映射到多邻国风格）
        clay: {
          primary: '#58CC02',
          'primary-light': '#D7FFB8',
          pink: '#FF9600',
          'pink-light': '#FFE8CC',
          mint: '#58CC02',
          'mint-light': '#D7FFB8',
          amber: '#FF9600',
          'amber-light': '#FFE8CC',
          gold: '#FFC800',
          'gold-light': '#FFF4CC',
          text: '#3C3C3C',
          'text-muted': '#777777',
          'text-light': '#AFAFAF',
          bg: '#F7F7F7',
          'bg-pink': '#F7F7F7',
          'bg-purple': '#F7F7F7',
          'bg-blue': '#F7F7F7',
          card: '#FFFFFF',
        },
        // 保留旧色兼容
        candy: {
          pink: '#FF9600',
          'pink-light': '#FFE8CC',
          blue: '#1CB0F6',
          'blue-light': '#DDF4FF',
          yellow: '#FFC800',
          'yellow-light': '#FFF4CC',
          mint: '#58CC02',
          'mint-light': '#D7FFB8',
          purple: '#CE82FF',
          'purple-light': '#F3E5FF',
          orange: '#FF9600',
          'orange-light': '#FFE8CC',
          red: '#FF4B4B',
        },
      },
      fontFamily: {
        kid: ['"Fredoka"', '"Noto Sans SC"', 'sans-serif'],
        display: ['"Fredoka"', '"Noto Sans SC"', 'sans-serif'],
        body: ['"Nunito"', '"Noto Sans SC"', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        'clay': '8px 8px 20px rgba(124,106,239,0.08), -4px -4px 12px rgba(255,255,255,0.95), inset 0 2px 0 rgba(255,255,255,0.8)',
        'clay-sm': '4px 4px 10px rgba(124,106,239,0.06), -2px -2px 8px rgba(255,255,255,0.8), inset 0 1px 0 rgba(255,255,255,0.6)',
        'clay-pressed': '2px 2px 6px rgba(0,0,0,0.06), inset 0 2px 4px rgba(0,0,0,0.04)',
        'clay-glow': '0 0 20px rgba(124,106,239,0.15), 0 4px 12px rgba(124,106,239,0.08)',
        'kid': '6px 6px 14px rgba(0,0,0,0.06), -3px -3px 10px rgba(255,255,255,0.9)',
        'kid-lg': '8px 8px 20px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.95)',
        'kid-glow': '0 0 16px rgba(124,106,239,0.2), 0 4px 12px rgba(0,0,0,0.05)',
        'inner-soft': 'inset 0 2px 4px rgba(0,0,0,0.04)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'slide-cloud': 'slide-cloud 40s linear infinite',
        'slide-cloud-2': 'slide-cloud 55s linear infinite',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'wiggle': 'wiggle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-soft': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.03)', opacity: '0.95' },
        },
        'slide-cloud': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(calc(100vw + 100%))' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
