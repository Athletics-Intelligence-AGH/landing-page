/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        // Primary brand green (lime / electric)
        brand: {
          50:  '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          DEFAULT: '#84cc16',
        },
        // Neon accent overrides for glow effects
        neon: {
          green: '#A3FF12',
          blue:  '#4FD1FF',
        },
        signal: {
          DEFAULT: '#ef4444',
          500: '#ef4444',
          600: '#dc2626',
        },
        // Dark theme – primary backgrounds
        dark: {
          DEFAULT: '#070B14',
          50:  '#0D1525',
          100: '#0F1728',
          200: '#111827',
          300: '#1A2233',
          400: '#243148',
        },
        surface: {
          DEFAULT: '#0c0d10',
          900: '#0c0d10',
          800: '#111318',
          700: '#1a1d24',
          600: '#252830',
        },
      },
      fontFamily: {
        sans: [
          "Bricolage Grotesque Variable",
          "Inter Variable",
          "Inter",
          ...defaultTheme.fontFamily.sans,
        ],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
