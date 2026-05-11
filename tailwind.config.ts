import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#4CFF91',
          200: '#359C5A',
        },
        gray: {
          100: '#FFFFFF',
          200: '#E8E6DF',
          300: '#B3B2B0',
          400: '#666666',
          500: '#383838',
        },
        line: {
          100: '#252525',
          200: '#323232',
        },
        bg: {
          100: '#0D0D0D',
          200: '#141414',
        },
      },
      fontFamily: {
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        sans: ['Pretendard', 'var(--font-jetbrains-mono)', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
      },
    },
  },
  plugins: [],
};

export default config;
