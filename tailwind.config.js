/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#e6f7fa',
          100: '#cceff5',
          200: '#99dfeb',
          300: '#66cfe1',
          400: '#33bfd7',
          500: '#0891B2', // Ocean Blue
          600: '#067490',
          700: '#04576c',
          800: '#033a48',
          900: '#011d24',
        },
        secondary: {
          50: '#fff0f0',
          100: '#ffe1e1',
          200: '#ffc3c3',
          300: '#ffa5a5',
          400: '#ff8787',
          500: '#FF6B6B', // Coral
          600: '#cc5656',
          700: '#994040',
          800: '#662b2b',
          900: '#331515',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d9fbeb',
          200: '#b3f7d7',
          300: '#8df3c3',
          400: '#67efaf',
          500: '#10B981', // Sea Green
          600: '#0d9467',
          700: '#0a6f4d',
          800: '#064a34',
          900: '#03251a',
        },
        gray: {
          50: '#FAFAFA', // Neutral BG
          100: '#F5F5F5', // Section BG
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717', // Text Color
        }
      },
      backgroundImage: {
        'gradient-grid': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none' stroke='%23f8f9fa' stroke-width='0.5'/%3E%3C/svg%3E\")",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      spacing: {
        '18': '4.5rem',
        '112': '28rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#171717',
            fontSize: '16px',
            lineHeight: '1.6',
            a: {
              color: '#0891B2',
              textDecoration: 'none',
              transition: 'color 200ms ease',
              '&:hover': {
                color: '#067490',
              },
            },
            h1: {
              color: '#171717',
              fontWeight: '700',
              fontSize: '2.5rem',
            },
            h2: {
              color: '#171717',
              fontWeight: '600',
              fontSize: '2rem',
            },
            h3: {
              color: '#171717',
              fontWeight: '600',
              fontSize: '1.5rem',
            },
          },
        },
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};