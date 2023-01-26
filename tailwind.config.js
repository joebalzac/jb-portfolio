/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js}'],
	darkMode: 'class',
	theme: {
		extend: {
			keyframes: {
				typing: {
					'0%': { maxWidth: '0%' },
					'90%': { maxWidth: '100%' },
					'100%': { maxWidth: '0%' },
				},
				blinking: {
					'0%': { borderColor: 'transparent' },
					'50%': { borderColor: 'white' },
					'100%': { borderColor: 'transparent' },
				},
				typingDark: {
					'0%': { borderColor: 'transparent' },
					'50%': { borderColor: 'black' },
					'100%': { borderColor: 'transparent' },
				},
			},
			animation: {
				typing: 'typing 3.5s steps(30, end) infinite, blinking .8s infinite',

				typingDark:
					'typing 3.5s steps(30, end) infinite, typingDark .8s infinite',
			},
		},
	},
	plugins: [],
};
