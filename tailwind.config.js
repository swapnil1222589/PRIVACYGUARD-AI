/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        app: 'var(--bg-app)',
        sidebar: 'var(--bg-sidebar)',
        sidebarActive: 'var(--bg-sidebar-active)',
        textSidebar: 'var(--text-sidebar)',
        textSidebarActive: 'var(--text-sidebar-active)',
        topbar: 'var(--bg-topbar)',
        card: 'var(--bg-card)',
        cardElevated: 'var(--bg-card-elevated)',
        inputBg: 'var(--bg-input)',
        borderTheme: 'var(--border-color)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        primaryPurple: 'var(--color-primary)',
        secondaryPurple: 'var(--color-secondary-purple)',
        accentCyan: 'var(--color-accent)',
        successGreen: 'var(--color-success)',
        warningOrange: 'var(--color-warning)',
        dangerRed: 'var(--color-danger)',
        pii: {
          email: '#8B5CF6',
          phone: '#06B6D4',
          ip: '#3B82F6',
          pan: '#F59E0B',
          aadhaar: '#EC4899',
          creditCard: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
      },
    },
  },
  plugins: [],
};
