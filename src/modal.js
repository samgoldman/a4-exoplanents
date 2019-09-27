import './modal.css'

const modal = document.querySelector("#instructionModal");

const module = {
	initInstructions: function () {
		// When the user clicks anywhere outside of the modal, close it
		window.onclick = event => {
			if (event.target === modal)  modal.style.display = "none";
		};
	},
	displayInstructions: function() {
		modal.style.display = "block";
	}
};

export default module;
