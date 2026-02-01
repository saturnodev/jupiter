/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#6f06f9',
        'synth-magenta': '#ff00ff',
        'synth-cyan': '#00ffff',
        'synth-purple': '#7000ff',
        'background-dark': '#0d0221',
        'glass-border': '#33214a',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
