/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './navigation/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors from existing design
        primary: '#2D6FFF',
        secondary: '#8E99AB',
        background: '#FFFFFF',
        text: {
          primary: '#0C1633',
          secondary: '#8E99AB',
        },
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      fontSize: {
        'heading-xl': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'heading-lg': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'heading-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};
