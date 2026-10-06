/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // The hero keeps its own hand-written CSS; skip Tailwind's global reset so it is untouched.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        night: '#030712',
        coal: '#0B1322',
        line: '#2D3A4D',
        accent: '#D4C5A9',
        teal: '#7BA7C7',
        paper: '#F7F5EF',
        ink: '#0E0E0E',
        mute: '#A7B2C0',
        dim: '#2C3E55',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Iowan Old Style"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
