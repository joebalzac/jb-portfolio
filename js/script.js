const darkSwitch = document.getElementById('darkMode');
const fullPage = document.querySelector('html');

darkSwitch.addEventListener('click', () => {
	fullPage.classList.toggle('dark');
});

let texts = ['Web Developer', 'Problem Solver', 'Logical Thinker'];

let currentIndex = 0;

const updateText = () => {
	let element = document.getElementById('myWord');
	element.textContent = texts[currentIndex];
	currentIndex = (currentIndex + 1) % texts.length;
};

updateText();

setInterval(updateText, 3500);
