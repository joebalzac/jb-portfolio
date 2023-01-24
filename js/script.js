let texts = ['Web Developer', 'Problem Solver', 'Logical Thinker'];

let currentIndex = 0;

const updateText = () => {
	let element = document.getElementById('myWord');
	element.textContent = texts[currentIndex];
	currentIndex = (currentIndex + 1) % texts.length;
};

updateText();

setTimeout(updateText, 5000);
setInterval(updateText, 3500);
