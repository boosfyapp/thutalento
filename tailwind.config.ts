import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        primary: '#0369A1',
        secondary: '#0EA5E9',
        accent: '#22C55E',
        surface: '#0F1117',
        card: '#161B27',
        border: '#1E2A3A',
      },
    },
  },
  plugins: [],
}
export default config
