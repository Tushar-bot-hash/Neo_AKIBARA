/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
        extend: {
                borderRadius: {
                        lg: '0px',
                        md: '0px',
                        sm: '0px'
                },
                fontFamily: {
                        heading: ['Teko', 'sans-serif'],
                        body: ['Outfit', 'sans-serif']
                },
                colors: {
                        background: 'hsl(0 0% 2%)',
                        foreground: 'hsl(0 0% 98%)',
                        card: {
                                DEFAULT: '#09090b',
                                foreground: '#fafafa'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        primary: {
                                DEFAULT: '#ff0055',
                                foreground: '#ffffff'
                        },
                        secondary: {
                                DEFAULT: '#00f0ff',
                                foreground: '#000000'
                        },
                        muted: {
                                DEFAULT: '#18181b',
                                foreground: '#a1a1aa'
                        },
                        accent: {
                                DEFAULT: '#7000ff',
                                foreground: '#ffffff'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))'
                        },
                        border: '#27272a',
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring))',
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        }
                },
                keyframes: {
                        'accordion-down': {
                                from: {
                                        height: '0'
                                },
                                to: {
                                        height: 'var(--radix-accordion-content-height)'
                                }
                        },
                        'accordion-up': {
                                from: {
                                        height: 'var(--radix-accordion-content-height)'
                                },
                                to: {
                                        height: '0'
                                }
                        }
                },
                animation: {
                        'accordion-down': 'accordion-down 0.2s ease-out',
                        'accordion-up': 'accordion-up 0.2s ease-out'
                }
        }
  },
  plugins: [require("tailwindcss-animate")],
};