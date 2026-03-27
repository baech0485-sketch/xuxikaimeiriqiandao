import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        clay: {
          primary: '#7C6AEF',
          'primary-light': '#E8E4FD',
          pink: '#FF8FAB',
          'pink-light': '#FFE0E8',
          mint: '#5CD4A0',
          'mint-light': '#D4F5E7',
          amber: '#FFB347',
          'amber-light': '#FFF0D4',
          gold: '#FFD93D',
          'gold-light': '#FFF8D4',
          text: '#2D1B69',
          'text-muted': '#7B6F8E',
          'text-light': '#A99BBF',
          bg: '#FFF8F0',
          'bg-pink': '#FFF0F5',
          'bg-purple': '#F0E6FF',
          'bg-blue': '#E8F4FD',
          card: 'rgba(255, 255, 255, 0.82)',
        },
        // 保留旧色兼容
        candy: {
          pink: '#FF8FAB',
          'pink-light': '#FFE0E8',
          blue: '#8CBFD6',
          'blue-light': '#DFF0F7',
          yellow: '#FFD93D',
          'yellow-light': '#FFF8D4',
          mint: '#5CD4A0',
          'mint-light': '#D4F5E7',
          purple: '#7C6AEF',
          'purple-light': '#E8E4FD',
          orange: '#FFB347',
          'orange-light': '#FFF0D4',
          red: '#FF6B6B',
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
