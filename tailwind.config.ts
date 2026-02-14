import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Apple-Style Design System
        'apple': {
          // Primary
          'blue': '#007AFF',
          'blue-dark': '#0051D5',
          'blue-light': '#E3F2FF',
          
          // Grays
          'gray-6': '#F5F5F7',
          'gray-5': '#E8E8ED',
          'gray-4': '#D2D2D7',
          'gray-3': '#86868B',
          'gray-2': '#6E6E73',
          'gray-1': '#1D1D1F',
          
          // Semantic
          'green': '#34C759',
          'orange': '#FF9500',
          'red': '#FF3B30',
          'yellow': '#FFCC00',
          'teal': '#5AC8FA',
          'purple': '#AF52DE',
          'pink': '#FF2D55',
          
          // Backgrounds Light
          'bg-primary': '#FFFFFF',
          'bg-secondary': '#F5F5F7',
          'bg-tertiary': '#FFFFFF',
          
          // Backgrounds Dark
          'bg-dark-primary': '#000000',
          'bg-dark-secondary': '#1C1C1E',
          'bg-dark-tertiary': '#2C2C2E',
        },
        
        // Legacy Stadthirsch (deprecated, for reference only)
        'stadthirsch': {
          50: '#f8f7f4',
          100: '#efece5',
          200: '#dcd5c7',
          300: '#c4b8a3',
          400: '#a9987d',
          500: '#8c7a62',
          600: '#6f614d',
          700: '#5a4d3f',
          800: '#4a4036',
          900: '#3d352f',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro', 'Segoe UI', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        // Apple Typography Scale
        'large-title': ['32px', { lineHeight: '40px', letterSpacing: '-0.5px', fontWeight: '700' }],
        'title-1': ['28px', { lineHeight: '34px', letterSpacing: '-0.5px', fontWeight: '700' }],
        'title-2': ['22px', { lineHeight: '28px', letterSpacing: '-0.5px', fontWeight: '600' }],
        'title-3': ['20px', { lineHeight: '26px', letterSpacing: '-0.5px', fontWeight: '500' }],
        'headline': ['17px', { lineHeight: '24px', letterSpacing: '-0.2px', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '24px', letterSpacing: '0' }],
        'callout': ['15px', { lineHeight: '22px', letterSpacing: '0' }],
        'subheadline': ['14px', { lineHeight: '20px', letterSpacing: '0' }],
        'caption': ['12px', { lineHeight: '16px', letterSpacing: '0' }],
        'caption-2': ['11px', { lineHeight: '14px', letterSpacing: '0.1px' }],
      },
      spacing: {
        // 8pt Grid System
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        'full': '9999px',
      },
      boxShadow: {
        // Subtle Apple-style shadows
        'card': '0 1px 2px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.02)',
        'card-hover': '0 2px 4px rgba(0,0,0,0.04), 0 8px 16px rgba(0,0,0,0.02)',
        'elevated': '0 2px 4px rgba(0,0,0,0.04), 0 8px 16px rgba(0,0,0,0.02)',
        'modal': '0 4px 20px rgba(0,0,0,0.08)',
        'input-focus': '0 0 0 3px rgba(0,122,255,0.15)',
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'apple-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
      maxWidth: {
        'content': '680px',
        'content-lg': '720px',
        'content-xl': '800px',
      },
    },
  },
  plugins: [],
}
export default config
