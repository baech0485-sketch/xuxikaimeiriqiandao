import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        candy: {
          pink: '#E8A0B4',
          'pink-light': '#F5DFE5',
          blue: '#8CBFD6',
          'blue-light': '#DFF0F7',
          yellow: '#E8D48A',
          'yellow-light': '#F5EDD4',
          mint: '#8BC5A0',
          'mint-light': '#D6EDDE',
          purple: '#B8A0D6',
          'purple-light': '#E8DFEF',
          orange: '#DDB880',
          'orange-light': '#F2E6D0',
          red: '#D98A8A',
        },
        scene: {
          sky: '#D6E8F0',
          'sky-top': '#C0D8E8',
          grass: '#B8D8A8',
          'grass-dark': '#9AC088',
        },
      },
      fontFamily: {
        kid: ['"ZCOOL KuaiLe"', '"Noto Sans SC"', 'cursive', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        'kid': '0 2px 12px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.6) inset',
        'kid-lg': '0 4px 20px rgba(0,0,0,0.07), 0 0 0 1px rgba(255,255,255,0.6) inset',
        'kid-glow': '0 0 12px rgba(200,160,140,0.2), 0 2px 12px rgba(0,0,0,0.05)',
        'inner-soft': 'inset 0 2px 4px rgba(0,0,0,0.04)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'slide-cloud': 'slide-cloud 40s linear infinite',
        'slide-cloud-2': 'slide-cloud 55s linear infinite',
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
      },
    },
  },
  plugins: [],
}
export default config
