import './styles.css';
import * as modal from './modal';
import * as menu from './menu.js';

import * as d3Base from 'd3';
import { group } from 'd3-array';

modal.default.initInstructions();
modal.default.displayInstructions();

const d3 = Object.assign(d3Base, { group });

const div = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

const d3Data = {};

d3.json("exoplanets.json").then( function(rawPlanets){
	d3.rawPlanets = rawPlanets;

	for(let i = 0; i < rawPlanets.length; i++) {
		if (null === rawPlanets[i]["pl_orbper"]) rawPlanets[i]["pl_orbper"] = Math.random() * 100 + 10;
	}

	d3Data.systems = Array.from(d3.group(rawPlanets, d => d["pl_hostname"]), ([key, value]) => ({key, value}));

	draw();
});

const analyzeSystems = function () {
	menu.default.settings.gridSize = 200;
	d3Data.systems.forEach(system => {
		let prevUnscaledOrbitOuter = menu.default.settings.initialOrbitRadius + menu.default.settings.stellarRadius;
		let prevScaledOrbitOuter = menu.default.settings.initialOrbitRadius + menu.default.settings.stellarRadius;

		system.value.sort((a, b) => a["pl_orbper"] - b["pl_orbper"]);

		for (let idx = 0; idx < system.value.length; idx++) {
			system.value[idx].unscaledRadius = menu.default.settings.defaultRadius;
			system.value[idx].scaledRadius =
				system.value[idx]["pl_radj"] !== null ?
					Math.max(menu.default.settings.minRadius, system.value[idx]["pl_radj"] * menu.default.settings.scaleRatio) :
					menu.default.settings.defaultRadius;

			system.value[idx].unscaledOrbit = prevUnscaledOrbitOuter + menu.default.settings.orbitalDiff + system.value[idx].unscaledRadius;
			system.value[idx].scaledOrbit = prevScaledOrbitOuter + menu.default.settings.orbitalDiff + system.value[idx].scaledRadius;

			prevUnscaledOrbitOuter = system.value[idx].unscaledOrbit + system.value[idx].unscaledRadius;
			prevScaledOrbitOuter = system.value[idx].scaledOrbit + system.value[idx].scaledRadius;

			system.value[idx].initialAngle = Math.floor(Math.random() * 360);
		}

		const unscaledSystemRadius = prevUnscaledOrbitOuter + menu.default.settings.boxPadding;
		const scaledSystemRadius = prevScaledOrbitOuter + menu.default.settings.boxPadding;

		if (menu.default.settings.scale) {
			if (scaledSystemRadius*2 > menu.default.settings.gridSize) {
				menu.default.settings.gridSize = scaledSystemRadius*2
			}
		} else {
			if (unscaledSystemRadius*2 > menu.default.settings.gridSize) {
				menu.default.settings.gridSize = unscaledSystemRadius*2
			}
		}
	});
};

const draw = function() {
	// Reprocess all systems for orbital data and system radii
	analyzeSystems();

	const width = menu.default.settings.systemsPerLine * menu.default.settings.gridSize,
		height = Math.ceil(d3Data.systems.length / menu.default.settings.systemsPerLine) * menu.default.settings.gridSize;

	// Sort data appropriately
	if (menu.default.settings.systemSort !== null)
		if(menu.default.settings.systemSort === "alphabetical")
			d3Data.systems.sort((a, b) => a.key.localeCompare(b.key) * (menu.default.settings.ascending ? 1 : -1));
		else
			d3Data.systems.sort((a, b) => (a.value.length - b.value.length) * (menu.default.settings.ascending ? 1 : -1));

	// Add an SVG to the #app div
	const svg = d3.select("#app").append("svg")
		.attr("width", width)
		.attr("height", height);

	// Add a group for each system
	const systemGroups = svg
		.selectAll("g")
		.data(d3Data.systems)
		.enter()
		.filter(d => d.key !== "Sol" || menu.default.settings.includeSol) // Filter out Sol System if necessary
		.append("g")
		.attr("class", "system")
		.attr("transform", (d, i) =>
			`translate(${(i%menu.default.settings.systemsPerLine)*menu.default.settings.gridSize}, ${Math.floor(i/menu.default.settings.systemsPerLine)*menu.default.settings.gridSize})`);

	// Add a rectangle to each system to create a grid
	systemGroups
		.append("rect")
		.attr("width", menu.default.settings.gridSize)
		.attr("height", menu.default.settings.gridSize).attr("fill", "none").attr("stroke", "black");

	// Add a star to each system - circle with a constant, configurable radius, center
	systemGroups
		.append("circle")
		.attr("r", menu.default.settings.stellarRadius)
		.attr("fill", "yellow")
		.attr("cx", menu.default.settings.gridSize/2)
		.attr("cy", menu.default.settings.gridSize/2);

	// Add the orbits
	systemGroups
		.selectAll("g.orbit")
		.data(d => d.value)
		.enter()
		.append("g")
		.attr("class", "orbit")
		.attr("transform", `translate(${menu.default.settings.gridSize/2},${menu.default.settings.gridSize/2})`) // Center the group on the grid
		.append("circle")
		.attr("fill", "none")
		.attr("stroke", "grey")
		.attr("stroke-dasharray", "1, 2")
		.attr("r", d => menu.default.settings.scale ? d.scaledOrbit : d.unscaledOrbit); // Select correct orbit radius

	// Add the planets
	systemGroups
		.selectAll("g.planet")
		.data(d => d.value)
		.enter()
		.append("g")
		.attr("class", "planet")
		.attr("transform", d => `translate(${menu.default.settings.gridSize/2},${menu.default.settings.gridSize/2}) rotate(${d.initialAngle}) translate(${menu.default.settings.scale ? d.scaledOrbit : d.unscaledOrbit})`)
		.append("circle")
		.attr("fill", "blue")
		.attr("r", d => menu.default.settings.scale ? d.scaledRadius : d.unscaledRadius)
		.on("mouseover", (d) => {  // Mouseover text
			div.transition()
				.duration(200)
				.style("opacity", .9);
			div	.html(
				`${d["pl_name"]} <br/>
				Discovery Method: ${d["pl_discmethod"]}<br/>Radius: ${d["pl_radj"] === null ? "unknown" : d["pl_radj"] + " <i>R</i><sub>J</sub>"} <br/>
				Controversial: ${d["pl_controvflag"] === 1 ? "Yes" : "No"}<br/>Orbital Period: ${d["pl_orbper"]} days`)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
		})
		.on("mouseout", function() {  // Hide mouseover
			div.transition()
				.duration(500)
				.style("opacity", 0);
		});

	// Add the star system names
	systemGroups
		.append("text")
		.attr("text-anchor", "middle")
		.attr("fill", "black")
		.attr("x", menu.default.settings.gridSize/2)
		.attr("y", menu.default.settings.gridSize/100) // slight offset from the top
		.append("tspan")
		.attr("dominant-baseline", "hanging")
		.text(d => d.key);
};


d3.interval(function() {
	if (!menu.default.settings.pause) {
		d3.select("svg")
			.selectAll(".system")
			.filter((d, i) => {
				const y = Math.floor(i/menu.default.settings.systemsPerLine)*menu.default.settings.gridSize;
				return y > (window.scrollY - menu.default.settings.gridSize) && y < (window.scrollY + window.innerHeight + menu.default.settings.gridSize);
			})
			.selectAll(".planet")
			.attr("transform", d => {
				const newAngle = d.initialAngle + (50 / d["pl_orbper"] / menu.default.settings.timeScale);
				d.initialAngle = newAngle % 360;
				return `translate(${menu.default.settings.gridSize / 2},${menu.default.settings.gridSize / 2}) rotate(${newAngle}) translate(${menu.default.settings.scale ? d.scaledOrbit : d.unscaledOrbit})`;
			});
	}
}, 50);

const updateDisplay = function()  {
	if (document.querySelector("svg") !== undefined)
		document.querySelector("#app").removeChild(document.querySelector("svg"));

	draw();
};

menu.default.module.init(updateDisplay, modal.default.displayInstructions);
