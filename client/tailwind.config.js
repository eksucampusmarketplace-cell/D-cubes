/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C97A',
          dark: '#A0853D',
          subtle: 'rgba(201, 168, 76, 0.1)',
        },
        cream: '#F5F0E8',
        dark: {
          DEFAULT: '#111111',
          2: '#1A1A1A',
          3: '#222222',
          4: '#0A0A0A',
          5: '#0D0D0D',
          6: '#151515',
        },
        velvet: {
          DEFAULT: '#1A0F0F',
          light: '#2D1F1F',
          dark: '#0F0808',
        },
        champagne: '#F7E7CE',
        rose: '#B76E79',
        emerald: '#046307',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
        script: ['Great Vibes', 'cursive'],
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease forwards',
        'fade-down': 'fadeDown 0.8s ease forwards',
        'fade-in': 'fadeIn 1s ease forwards',
        'pulse-gold': 'pulseGold 3s ease infinite',
        'blink': 'blink 2s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.5s ease forwards',
        'scale-in': 'scaleIn 0.3s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,168,76,0.3)' },
          '50%': { boxShadow: '0 0 30px 10px rgba(201,168,76,0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.2)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C 0%, #E8C97A 50%, #C9A84C 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
        'velvet-gradient': 'linear-gradient(180deg, #1A0F0F 0%, #0F0808 100%)',
        'radial-gold': 'radial-gradient(ellipse at center, rgba(201,168,76,0.15) 0%, transparent 70%)',
        'radial-dark': 'radial-gradient(ellipse at top, rgba(26,15,15,0.8) 0%, transparent 60%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.1) 50%, transparent 100%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(201, 168, 76, 0.3)',
        'gold-lg': '0 0 40px rgba(201, 168, 76, 0.4)',
        'inner-gold': 'inset 0 0 20px rgba(201, 168, 76, 0.1)',
        'luxury': '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        'card': '0 10px 40px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
