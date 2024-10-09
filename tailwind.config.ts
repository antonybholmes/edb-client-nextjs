import type { Config } from 'tailwindcss'
const colors = require('tailwindcss/colors')

const config: Config = {
  content: [
    // './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    // './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    // './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    // './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    // './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['Inter', 'Helvetica', 'Arial'],
    },
    extend: {
      spacing: {
        0.25: '0.0625rem',
        '2px': '2px',
        1.2: '0.3rem',
        1.4: '0.35rem',
        2.5: '0.625rem',
        4.5: '1.125rem',
        5.5: '1.375rem',
        6.5: '1.625rem',
        '7.5': '1.875rem',
        '8.5': '2.125rem',
        '9': '2.25rem',
        '9.5': '2.375rem',
        15: '3.75rem',
        18: '4.5rem',
        100: '25rem',
        120: '30rem',
        128: '32rem',
        256: '64rem',
        '4/10': '40%',
        '9/10': '90%',
      },
      screens: {
        '2lg': '1152px',
        '2xl': '1440px',
        '3xl': '1600px',
        '4xl': '1800px',
        '5xl': '1920px',
        '6xl': '2048px',
      },
      scale: {
        101: '1.01',
        102: '1.02',
        104: '1.04',
      },
      lineHeight: {
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
      },
      colors: {
        gray: colors.neutral,
        //theme: colors.blue,
        border: 'rgb(var(--border) / <alpha-value>)',
        'light-border': 'rgb(var(--light-border) / <alpha-value>)',
        'dark-border': 'rgb(var(--dark-border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        body: 'rgb(var(--body) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          alt: 'rgb(var(--primary-alt) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        theme: {
          DEFAULT: 'rgb(var(--theme) / <alpha-value>)',
          alt: 'rgb(var(--theme-alt) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
          alt: 'rgb(var(--destructive-alt) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        shortcuts: {
          DEFAULT: 'rgb(var(--shortcuts) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
          foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
          alt: 'rgb(var(--popover-alt) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        overlay: {
          DEFAULT: 'rgb(var(--overlay) / <alpha-value>)',
        },
      },
      boxShadow: {
        box: '0 0 8px 2px rgba(0, 0, 0, 0.1)',
        box2: '0 0 8px 4px rgba(0, 0, 0, 0.25)',
        header: '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
        '4xl': '0 50px 100px -24px rgb(0 0 0 / 0.25)',
      },
      borderWidth: {
        3: '3px',
      },
      padding: {
        0.75: '0.1875rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        '110': '110',
        overlay: '200',
        modal: '300',
        alert: '400',
      },
      gridTemplateColumns: {
        // Simple 20 column grid
        16: 'repeat(16, minmax(0, 1fr))',
        20: 'repeat(20, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-13': 'span 13 / span 13',
        'span-14': 'span 14 / span 14',
        'span-15': 'span 15 / span 15',
        'span-18': 'span 18 / span 18',
      },
      strokeWidth: {
        2: '2px',
        3: '3px',
        4: '4px',
      },
      transitionProperty: {
        filter: 'filter',
        placeholder: 'opacity, filter, transform',
      },
      margin: {
        18: '4.5rem',
      },
      opacity: {
        98: '.98',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.83, 0, 0.17, 1)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
