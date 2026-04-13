import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'scroll': 'scroll 20s linear infinite',
        'flip': 'flip 6s infinite steps(2, end)',
        'rotate': 'kitrotate 3s linear infinite both',
        'shine': 'shine 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        flip: {
          to: {
            transform: 'rotate(360deg)',
          },
        },
        kitrotate: {
          to: {
            transform: 'rotate(90deg)',
          },
        },
        shine: {
          from: { backgroundPosition: '0 0' },
          to: { backgroundPosition: '100% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
