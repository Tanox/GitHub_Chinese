/**
 * Tailwind CSS 配置（根级，与 src/ 源码解耦）
 * preflight:false 以保留现有自包含组件样式（public/css）
 * @file tailwind.config.ts
 */
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  corePlugins: {
    // 关闭 preflight，避免重置 web/collector-guide 原有自包含样式（public/css）
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        brand: '#2ea44f',
        rail: '#1c2128',
      },
    },
  },
  plugins: [],
};

export default config;
