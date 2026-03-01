module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        bg: {
          canvas: '#080D17',
          base: '#0D1117',
          elevated: '#161B27',
          overlay: '#1E2433',
          sidebar: '#111827',
          modal: '#1E2433',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          tertiary: '#64748B',
          disabled: '#4B5563',
          inverse: '#FFFFFF',
        },
        action: {
          primary: '#2563EB',
          'primary-h': '#1D4ED8',
          ghost: 'transparent',
        },
        border: {
          subtle: '#1E2433',
          default: '#2A3347',
          strong: '#374151',
          active: '#2563EB',
        },
        version: {
          'badge-bg': '#059669',
          'badge-text': '#FFFFFF',
          'current-bg': '#064E3B',
          'current-border': '#22C55E',
        },
        diff: {
          added: '#22C55E',
          removed: '#EF4444',
          modified: '#3B82F6',
          'added-bg': 'rgba(34,197,94,0.12)',
          'removed-bg': 'rgba(239,68,68,0.12)',
          'modified-bg': 'rgba(59,130,246,0.12)',
        },
        workspace: {
          'admin-badge': '#059669',
          'editor-badge': '#2563EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
