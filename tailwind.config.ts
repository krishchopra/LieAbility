import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'blob': {
					'0%': {
						transform: 'translate(0px, 0px) scale(1)',
					},
					'33%': {
						transform: 'translate(30px, -50px) scale(1.1)',
					},
					'66%': {
						transform: 'translate(-20px, 20px) scale(0.9)',
					},
					'100%': {
						transform: 'translate(0px, 0px) scale(1)',
					},
				},
				'pulse-slow': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scale(1)',
					},
					'50%': {
						opacity: '0.85',
						transform: 'scale(1.05)',
					},
				},
				'float': {
					'0%': {
						transform: 'translateY(0px)',
					},
					'50%': {
						transform: 'translateY(-20px)',
					},
					'100%': {
						transform: 'translateY(0px)',
					},
				},
				'float-particle': {
					'0%': {
						transform: 'translate(0px, 0px) scale(1)',
						opacity: '0.6',
					},
					'33%': {
						transform: 'translate(10px, -15px) scale(1.05)',
						opacity: '1',
					},
					'66%': {
						transform: 'translate(-8px, 10px) scale(0.95)',
						opacity: '0.8',
					},
					'100%': {
						transform: 'translate(0px, 0px) scale(1)',
						opacity: '0.6',
					},
				},
				'light-beam': {
					'0%': {
						opacity: '0',
						transform: 'translateY(-20px)',
					},
					'50%': {
						opacity: '1',
						transform: 'translateY(0px)',
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(20px)',
					},
				},
				'floating-line': {
					'0%': {
						opacity: '0',
						transform: 'translateX(-20px)',
					},
					'50%': {
						opacity: '1',
						transform: 'translateX(0px)',
					},
					'100%': {
						opacity: '0',
						transform: 'translateX(20px)',
					},
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'blob': 'blob 7s infinite',
				'pulse-slow': 'pulse-slow 8s ease-in-out infinite',
				'float': 'float 12s ease-in-out infinite',
				'float-particle': 'float-particle 15s ease-in-out infinite',
				'light-beam': 'light-beam 10s ease-in-out infinite',
				'floating-line': 'floating-line 12s ease-in-out infinite',
			},
			animationDelay: {
				'1000': '1s',
				'2000': '2s',
				'3000': '3s',
				'4000': '4s',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
