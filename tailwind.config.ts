import { nextui } from '@nextui-org/react';
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/(avatar|button|calendar|card|date-input|dropdown|input|modal|select|ripple|spinner|menu|divider|popover|listbox|scroll-shadow).js",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#883EE1",
        'primary-dark': "#6B31B3", // 새로 추가한 어두운 버전의 primary 색상
        secondary: "#A16DDE",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      width: {
        '1700': '1700px',
      },
      height: {
        '1100': '1100px',
      },
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  // 동적 CSS 클래스 보호를 위해 safelist 추가 가능
  safelist: [
    'bg-red-500',   // 동적으로 생성될 가능성이 있는 클래스
    'text-lg',      // 필요에 따라 동적 클래스를 추가
    // 예를 들어, 다양한 Tailwind 클래스들을 필요에 맞게 추가
  ],
  plugins: [nextui()],
};

export default config;
