/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                gaming: {
                    900: '#09090b', // Deep zinc background
                    800: '#18181b', // Card backgrounds
                    700: '#27272a', // Borders
                    accent: '#10b981', // Neon emerald 
                    accentHover: '#059669', // Darker emerald
                    text: '#f8fafc', // Light text
                    muted: '#a1a1aa' // Zinc 400
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Outfit', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'tilt': 'tilt 10s infinite linear',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 15px 0 rgba(16, 185, 129, 0.5)' },
                    '50%': { opacity: '.5', boxShadow: '0 0 5px 0 rgba(16, 185, 129, 0.2)' },
                },
                shimmer: {
                    'from': { backgroundPosition: '200% 0' },
                    'to': { backgroundPosition: '-200% 0' }
                },
                tilt: {
                    '0%, 50%, 100%': { transform: 'rotate(0deg)' },
                    '25%': { transform: 'rotate(1deg)' },
                    '75%': { transform: 'rotate(-1deg)' }
                }
            }
        },
    },
    plugins: [],
}
