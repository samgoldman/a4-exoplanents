import * as dat from 'dat.gui'

const settings = {
	scale: true,
	defaultRadius: 4,
	stellarRadius: 5,
	initialOrbitRadius: 5,
	orbitalDiff: 3,
	systemsPerLine: 4,
	scaleRatio: 10,
	includeSol:false,
	systemSort: null,
	ascending: true,
	minRadius: 2,
	boxPadding: 5,
	timeScale: 1,
	pause: false
};

const module = {
	init: function(update, instructions) {
		settings.update = update;
		settings.instructions = instructions;

		const gui = new dat.GUI();
		gui.add(settings, "instructions");
		gui.add(settings, "scale");
		gui.add(settings, "scaleRatio", 5, 15).step(1);
		gui.add(settings, "stellarRadius", 5, 25).step(1);
		gui.add(settings, "includeSol");
		gui.add(settings, "systemSort", ["alphabetical", "numPlanets"]);
		gui.add(settings, "ascending");
		gui.add(settings, "systemsPerLine", 1, 10).step(1);
		gui.add(settings, "timeScale", .05, 2).step(0.1);
		gui.add(settings, "pause");
		gui.add(settings, "update");
	}
};

export default { module: module, settings: settings};

