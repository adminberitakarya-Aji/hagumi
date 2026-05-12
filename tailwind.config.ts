/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        japanese: ['"Zen Kaku Gothic New"', 'sans-serif'],
      },
      colors: {
        hagumi: {
          pink:    '#ff6b9d',
          'pink-light': '#ffb3cc',
          purple:  '#9b59b6',
          'purple-dark': '#6c3483',
          gold:    '#f1c40f',
          peach:   '#ffcba4',
          sakura:  '#ffb7c5',
          night:   '#1a0533',
          dusk:    '#4a2080',
          dawn:    '#ff9a8b',
        }
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'petal-fall': 'petalFall 8s linear infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        petalFall: {
          '0%':   { transform: 'translateY(-20px) rotate(0deg)', opacity: '0' },
          '10%':  { opacity: '1' },
          '90%':  { opacity: '0.6' },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' },
        },
        sparkle: {
          '0%, 100%': { transform: 'scale(0.8) rotate(-10deg)', opacity: '0.6' },
          '50%':      { transform: 'scale(1.3) rotate(10deg)',  opacity: '1' },
        },
      },
      backgroundImage: {
        'morning': 'linear-gradient(180deg, #FFB347 0%, #FFCC80 30%, #FFF3E0 60%, #E8F5E9 100%)',
        'afternoon': 'linear-gradient(180deg, #42A5F5 0%, #90CAF9 40%, #E3F2FD 70%, #F1F8E9 100%)',
        'evening': 'linear-gradient(180deg, #FF7043 0%, #FF8A65 30%, #FFCCBC 60%, #FCE4EC 100%)',
        'night': 'linear-gradient(180deg, #0d0428 0%, #1a0a4a 30%, #2d1b6e 55%, #4a2080 70%, #1a0533 100%)',
      }
    },
  },
  plugins: [],
}
