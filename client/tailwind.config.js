/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        colors: {
            primary: '#0f172a', // Slate 900
            secondary: '#1e293b', // Slate 800
            accent: '#38bdf8', // Sky 400
            danger: '#ef4444', // Red 500
            success: '#22c55e', // Green 500
            warning: '#eab308', // Yellow 500
            white: '#ffffff',
            red: {
                400: '#f87171',
                500: '#ef4444',
            },
            blue: {
                500: '#3b82f6',
            },
            rose: {
                500: '#f43f5e',
            },
            amber: {
                500: '#f59e0b',
            },
            cyan: {
                500: '#06b6d4',
            },
            slate: {
                300: '#cbd5e1',
                400: '#94a3b8',
                700: '#334155',
                800: '#1e293b',
                900: '#0f172a',
                'bg': '#0f172a',
            },
            green: {
                500: '#22c55e',
            },
            indigo: {
                400: '#818cf8',
                500: '#6366f1',
            },
        },
        fontFamily: {
            sans: ['Inter', 'sans-serif'],
        },
    },
    plugins: [],
}
