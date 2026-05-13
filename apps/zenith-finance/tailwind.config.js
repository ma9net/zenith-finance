const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}', './libs/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      colors: {
        zenith: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          text: 'var(--color-text-main)',
          muted: 'var(--color-text-muted)',
          primary: 'rgb(var(--brand-primary))',
        },
      },
      borderColor: {
        glass: 'var(--glass-border)',
      },
    },
  },
  plugins: [],
};
