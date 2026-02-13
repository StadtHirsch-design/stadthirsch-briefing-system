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
    },
  },
  plugins: [],
}
export default config
