/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fredoka', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif']
      },
      colors: {
        obsidian: {
          950: '#070A11',
          900: '#0B0F19',
          800: '#111827',
          700: '#1E293B',
          600: '#334155'
        },
        cosmic: {
          dark: '#0B0F19',
          card: '#111827',
          border: '#1E293B',
          accent: '#0284C7',
          cyan: '#38BDF8',
          magenta: '#F43F5E',
          gold: '#F59E0B',
          emerald: '#10B981'
        }
      }
    },
  },
  plugins: [],
}
