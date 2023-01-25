/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js}'],
	darkMode: 'class',
	theme: {
		extend: {
			keyframes: {
				typing: {
					'0%': { maxWidth: '0%' },
					'100%': { maxWidth: '100%' },
				},
				blinking: {
					'0%': { borderColor: 'transparent' },
					'50%': { borderColor: 'white' },
					'100%': { borderColor: 'transparent' },
				},
			},
			animation: {
				typing: 'typing 3.5s steps(30, end) infinite, blinking .8s infinite',
			},
		},
	},
	plugins: [],
};
