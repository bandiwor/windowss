import type {Config} from 'tailwindcss'

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                accent: 'var(--accent-color)',
                'apps-font': 'var(--apps-font-color)',
                'apps-background': 'var(--apps-background-color)',
                'tray-font': 'var(--tray-font-color)',
                'tray-background': 'var(--tray-background-color)',
                'apps-header-background': 'var(--apps-header-background-color)',
                'apps-header-control-background': 'var(--apps-header-control-background)',
                'apps-header-control-background-hover': 'var(--apps-header-control-background-hover)',
                'background-elevation-xs': 'var(--background-elevation-color-xs)',
                'background-elevation-sm': 'var(--background-elevation-color-sm)',
                'background-elevation': 'var(--background-elevation-color)',
                'background-elevation-lg': 'var(--background-elevation-color-lg)',
                'background-elevation-xl': 'var(--background-elevation-color-xl)',
                'background-elevation-2xl': 'var(--background-elevation-color-2xl)',
            }
        },
    },
    plugins: [],
} satisfies Config

