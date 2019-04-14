/* Kevin Palmer, 2019 */

//<--------------------CREATE THE MAP-------------------->


//Create the map and set the initial map settings

//Mapbox access token
L.mapbox.accessToken = 'pk.eyJ1IjoicmtwYWxtZXJqciIsImEiOiJjaXZzd25ha3YwNTVmMnRxcmZqMG82MWk5In0.J7XdNJ6-0wr7cgeH6e-7xw';

//Basemaps
let mapboxStreets = L.mapbox.tileLayer('mapbox.streets');
let esriWorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

let map = L.mapbox.map('mainMap', 'mapbox.streets', {
	layers: [mapboxStreets],
	minZoom: 6,
	maxZoom: 14,
	maxBounds: [[27.742778, -97.4019444], [47.62, -65.65]]
}).setView([37.347222, -81.633333], 6);

//Create Map Panes <-- See url: https://jsfiddle.net/3v7hd2vx/90/
map.createPane("arcPane").style.zIndex = 240; // between tiles and overlays
map.createPane("countyPane").style.zIndex = 250; // between overlays and shadows
map.createPane("statePane").style.zIndex = 260; // between overlays and shadows
map.createPane("propPane").style.zIndex = 450; // between overlays and shadows
map.createPane("popupPane").style.zIndex = 700; // between overlays and shadows

//Basemaps control variables
let baseMaps = {
	'Mapbox Streets': mapboxStreets,
	'ESRI Imagery': esriWorldImagery
};

//Data Overlays
let propEmpLyr = L.layerGroup();
let propProLyr = L.layerGroup();

//Function to instantiate the map data
function createMapData(){
	//Call the get data functions to add data to map
	getPropEmpLyr(map);
	getPropProLyr(map);
	getARCOutlineLyr(map);
	getStatesLyr(map);
	getCountiesLyr(map);
}

//Overlay control variables
let overlays = {
	'Coal Employment Data': propEmpLyr,
	'Coal Production Data':propProLyr
};

//Add basemaps and overlays controls to the map
L.control.layers(baseMaps, overlays).addTo(map);


//<--------------------GET THE JSON DATA-------------------->


//Function to import the county coal employment data (used by the createMap function)
function getPropEmpLyr(map){
	//Load the data using jQuery
	$.ajax('data/Appalachia_Coal_Emp_POINTS.json', {
		dataType: 'json',
		success: function(data){
			//Create an attributes array with the received data
			let empAttributes = processPropEmpData(data);
			//Create the map symbols using this data
			createPropEmpSymbols(data, map, empAttributes);
			//Create the legend using this data
			createPropEmpLegend(map, empAttributes);
			//Create the sequence controls using this data
			createPropSequenceControls(map, empAttributes);
		}
	});
}

//Function to import the county coal employment data (used by the createMap function)
function getPropProLyr(map){
	//Load the data using jQuery
	$.ajax('data/Appalachia_Coal_Pro_POINTS.json', {
		dataType: 'json',
		success: function(data){
			//Create an attributes array with the received data
			let proAttributes = processPropProData(data);
			//Create the map symbols using this data
			createPropProSymbols(data, map, proAttributes);
			//Create the legend using this data
			//createPropProLegend(map, attributes);
			//Create the sequence controls using this data
			//createPropSequenceControls(map, proAttributes);
		}
	});
}

//Function to get the ARC outline (used by the createMap function) - just for reference purposes
function getARCOutlineLyr(map){
	//Load the data using jQuery
	$.ajax('data/ARC_Region_Outline.json', {
		dataType: 'json',
		success: function(data){
			//Create the ARC polygon using this data
			createARC(data, map);
		}
	});
}

//Function to get the states (used by the createMap function) - just for reference purposes
function getStatesLyr(map){
	//Load the data using jQuery
	$.ajax('data/States.json', {
		dataType: 'json',
		success: function(data){
			//Create the state polygons using this data
			createStates(data, map);
		}
	});
}

//Function to get the counties (used by the createMap function)
function getCountiesLyr(map){
	//Load the data using jQuery
	$.ajax('data/Counties.json', {
		dataType: 'json',
		success: function(data){
			//Create an attributes array with the received data
			let countyAttributes = processCountyData(data);
			//Create the county polygons using this data
			createCounties(data, map, countyAttributes);
		}
	});
}


//<--------------------PROCESS THE JSON DATA-------------------->


//Create an array of the sequential attributes from the JSON to keep track of their order
//Function to build attributes array from the data
function processPropEmpData(data){
	//Empty array to hold attributes
	let empAttributes = [];

	//Properties of the first feature in the dataset
	let properties = data.features[0].properties;

	//Push each attribute name into attributes array
	for (let attribute in properties){
		//Only take attributes with job count values
		if (attribute.indexOf("F20") > -1){
			empAttributes.push(attribute);
		};
	};

	//Check results
	console.log('Prop Emp Symbol attributes: ' + empAttributes);
	for (i in empAttributes){
		console.log(i + ": " + empAttributes[i]);
	};

	//Return the array of attributes
	return empAttributes;
};

//Create an array of the sequential attributes from the JSON to keep track of their order
//Function to build attributes array from the data
function processPropProData(data){
	//Empty array to hold attributes
	let proAttributes = [];

	//Properties of the first feature in the dataset
	let properties = data.features[0].properties;

	//Push each attribute name into attributes array
	for (let attribute in properties){
		//Only take attributes with job count values
		if (attribute.indexOf("F20") > -1){
			proAttributes.push(attribute);
		};
	};

	//Check results
	console.log('Prop Pro Symbol attributes: ' + proAttributes);
	for (i in proAttributes){
		console.log(i + ": " + proAttributes[i]);
	};

	//Return the array of attributes
	return proAttributes;
};

//Create an array of attributes from the JSON to show the county data in the panel and popups
//Function to process the County data for hover popups
function processCountyData(data){
	//Empty array to hold attributes
	let countyAttributes = [];

	//Properties of the first feature in the dataset
	let properties = data.features[0].properties;

	//Push each attribute name into attributes array
	for (let attribute in properties){
		countyAttributes.push(attribute);
	};

	//Check results
	console.log('County attributes: ' + countyAttributes);
	for (i in countyAttributes){
		console.log(i + ": " + countyAttributes[i]);
	};

	//Return the array of attributes
	return countyAttributes;
}


//<--------------------STYLING/ADDING CONTENT TO THE MAP-------------------->


//<----------Proportional Emp Symbols
//Add circle markers for employment point features to the map - done (in AJAX callback)
function createPropEmpSymbols(data, map, empAttributes){

	//Add the loaded data to the map styled with the marker options
	L.geoJSON(data, {
		pointToLayer: function(feature, latlng){
			return empSymbols(feature, latlng, empAttributes);
		}
	}).addTo(propEmpLyr);

	propEmpLyr.addTo(map);
}

//Function to create proportional circle markers with popups
function empSymbols(feature, latlng, empAttributes){

	//Assign the current attribute based on the index of the attributes array
	let attribute = empAttributes[0];

	//For each feature, determine its value for the selected attribute
	let empAttValue = Number(feature.properties[attribute]);

	console.log(feature + ' : ' +attribute + ' : ' + empAttValue);

	//Update marker radius
	propMarkerEmpOptions.radius = calcPropEmpRadius(empAttValue);
	let layer =  L.circleMarker(latlng, propMarkerEmpOptions);

	//Add popups

	//Panel content
	let panelContent = '';
	for (let property in feature.properties) {
		panelContent += '<p>' + property + ': ' + feature.properties[property] + '</p>';
	}

	//Popup content
	let popupContent = '<p>' + feature.properties.NAME + ', ' + feature.properties.STATE_NAME + '</p>';

	layer.bindPopup(popupContent, {
		pane: 'popupPane',
		offset: new L.Point(0, -propMarkerEmpOptions.radius), //Offsets the popup from the symbol so they don't overlap.
		closeButton: false
	});

	//Event listeners to open popup on hover
	layer.on({

		mouseover: function(){
			this.openPopup();
		},
		mouseout: function(){
			this.closePopup();
		},

		click: function(){
			$('#panel').html(panelContent);
		}
	});

	//Return results
	return layer;
}

//Give each feature's circle marker a radius based on its attribute value
function calcPropEmpRadius(empAttValue){
	//Scale factor to adjust symbol size evenly
	let scaleFactor = 3;
	//Area based on attribute value and scale factor
	let area = empAttValue * scaleFactor;
	//Radius calculated based on area
	let empRadius = Math.sqrt(area/Math.PI);
	//Return radius value
	return empRadius;
}

//Variable to create proportional symbol marker options <-- Move this to CSS???
let propMarkerEmpOptions = {
	pane: 'propPane',
	fillColor: 'Orange',
	color: 'Black',
	weight: 1,
	opacity: 1,
	fillOpacity: 0.8
};


//<----------Proportional Pro Symbols
//Add circle markers for production point features to the map - done (in AJAX callback)
function createPropProSymbols(data, map, proAttributes){

	//Add the loaded data to the map styled with the marker options
	L.geoJSON(data, {
		pointToLayer: function(feature, latlng){
			return proSymbols(feature, latlng, proAttributes);
		}
	}).addTo(propProLyr);

	//propProLyr.addTo(map);
}

//Function to create proportional circle markers with popups
function proSymbols(feature, latlng, proAttributes){

	//Assign the current attribute based on the index of the attributes array
	let attribute = proAttributes[0];

	//For each feature, determine its value for the selected attribute
	let proAttValue = Number(feature.properties[attribute]);

	//Update marker radius
	propMarkerProOptions.radius = calcPropProRadius(proAttValue);
	let layer =  L.circleMarker(latlng, propMarkerProOptions);

	//Add popups

	//Panel content
	let panelContent = '';
	for (let property in feature.properties) {
		panelContent += '<p>' + property + ': ' + feature.properties[property] + '</p>';
	}

	//Popup content
	let popupContent = '<p>' + feature.properties.NAME + ', ' + feature.properties.STATE_NAME + '</p>';

	layer.bindPopup(popupContent, {
		pane: 'popupPane',
		offset: new L.Point(0, -propMarkerProOptions.radius), //Offsets the popup from the symbol so they don't overlap.
		closeButton: false
	});

	//Event listeners to open popup on hover
	layer.on({

		mouseover: function(){
			this.openPopup();
		},
		mouseout: function(){
			this.closePopup();
		},

		click: function(){
			$('#panel').html(panelContent);
		}
	});

	//Return results
	return layer;
}

//Give each feature's circle marker a radius based on its attribute value
function calcPropProRadius(proAttValue){
	//Scale factor to adjust symbol size evenly
	let scaleFactor = .3;
	//Area based on attribute value and scale factor
	let area = proAttValue/1000 * scaleFactor;
	//Radius calculated based on area
	let proRadius = Math.sqrt(area/Math.PI);
	//Return radius value
	return proRadius;
}

//Variable to create proportional symbol marker options <-- Move this to CSS???
let propMarkerProOptions = {
	pane: 'propPane',
	fillColor: 'Red',
	color: 'Black',
	weight: 1,
	opacity: 1,
	fillOpacity: 0.8
};


//Give each feature's circle marker a radius based on its attribute value
function calcPropRadius(empAttValue, proAttValue) {
	if (empAttValue) {
			//Scale factor to adjust symbol size evenly
		let scaleFactor = 3;
		//Area based on attribute value and scale factor
		let area = empAttValue * scaleFactor;
		//Radius calculated based on area
		let radius = Math.sqrt(area / Math.PI);
		//Return radius value
		return radius;
	};
	if (proAttValue) {
			//Scale factor to adjust symbol size evenly
		let scaleFactor = .5;
		//Area based on attribute value and scale factor
		let area = proAttValue / 1000 * scaleFactor;
		//Radius calculated based on area
		let radius = Math.sqrt(area / Math.PI);
		//Return radius value
		return radius;
	};
}

//<----------Reference layers
//Add polygon symbol for ARC boundary to the map - done (in AJAX callback)
function createARC(dataARC, map){

	arcLyr = L.layerGroup([]);

	//Add the loaded data to the map styled below
	L.geoJSON(dataARC, {
		pane: 'arcPane',
		color: 'Black',
		fillColor: 'Black',
		fillOpacity: .25,
		weight: 0,
		opacity: 1
	}).addTo(arcLyr);

	arcLyr.addTo(map);
}

//Add polygon symbols for states to the map - done (in AJAX callback)
function createStates(dataARC, map){

	let statesLyr = L.layerGroup([]);

	//Add the loaded data to the map styled below
	L.geoJSON(dataARC, {
		pane: 'statePane',
		color: "Black",
		fillColor: 'None',
		weight: 1,
		opacity: .5
	}).addTo(statesLyr);

	statesLyr.addTo(map);
}

//Add polygon symbols for counties to the map - done (in AJAX callback)
function createCounties(dataARC, map){

	let countiesLyr = L.layerGroup([]);

	//Add the loaded data to the map styled below
	 L.geoJSON(dataARC, {
		pane: 'countyPane',
		//onEachFeature: onEachCounty,
		color: "White",
		fillColor: 'None',
		weight: .5,
		opacity: 1
	}).addTo(countiesLyr);

	 countiesLyr.addTo(map);
}


//<--------------------SEQUENCE DATA UPDATES-------------------->


//Function to update the proportional employment circles based on year and also adjust popup offset
function updatePropEmpSymbols(map, attribute){
	map.eachLayer(function(layer){
		if (layer.feature && layer.feature.properties[attribute] && layer.feature.properties.METRIC === "Employment") {
			console.log(layer + ' : ' + layer.feature.properties[attribute]);
			//Update the layer style and popup

			//Access feature properties
			let props = layer.feature.properties;

			//Update each feature's radius based on new attribute values
			let radius = calcPropRadius(props[attribute]);
			layer.setRadius(radius);

			//Update popup content
			let popupContent = '<p>' + layer.feature.properties.NAME + ', ' + layer.feature.properties.STATE_NAME + '</p>';

			layer.bindPopup(popupContent, {
				pane: 'popupPane',
				offset: new L.Point(0, -radius), //Offsets the popup from the symbol so they don't overlap.
				closeButton: false
			});

			//Event listeners to open popup on hover
			layer.on({
				mouseover: function(){
					this.openPopup();
				},
				mouseout: function(){
					this.closePopup();
				},
			});
		};
	});
}

//Function to update the proportional production circles based on year and also adjust popup offset
function updatePropProSymbols(map, attribute){
	map.eachLayer(function(layer){
		if (layer.feature && layer.feature.properties[attribute] && layer.feature.properties.METRIC === "Production") {
			console.log(layer + ' : ' + layer.feature.properties[attribute]);
			//Update the layer style and popup

			//Access feature properties
			let props = layer.feature.properties;

			//Update each feature's radius based on new attribute values
			let radius = calcPropRadius(props[attribute]);
			layer.setRadius(radius);

			//Update popup content
			let popupContent = '<p>' + layer.feature.properties.NAME + ', ' + layer.feature.properties.STATE_NAME + '</p>';

			layer.bindPopup(popupContent, {
				pane: 'popupPane',
				offset: new L.Point(0, -radius), //Offsets the popup from the symbol so they don't overlap.
				closeButton: false
			});

			//Event listeners to open popup on hover
			layer.on({
				mouseover: function(){
					this.openPopup();
				},
				mouseout: function(){
					this.closePopup();
				},
			});
		};
	});
}


//<--------------------CREATE THE LEGEND-------------------->


//Calculate the max, mean, min values for a given attribute
function getCircleValues(map, attribute){
	//Start with min at highest possible and max at lowest value possible number
	let min = Infinity;
	let max = -Infinity;

	map.eachLayer(function(layer){
		//Get the attribute value
		if (layer.feature && layer.feature.properties.METRIC === "Employment"){
			let attributeValue = Number(layer.feature.properties[attribute]);

			//Test for min (exclude 0, otherwise no min will show up in legend)
			if (attributeValue < min && attributeValue != 0){
				min = attributeValue;
			};

			//Test for max
			if (attributeValue > max){
				max = attributeValue;
			};
		};
	});

	//Set mean
	let mean = (max + min) / 2;

	//Return values as an object
	return {
		max: max,
		mean: mean,
		min: min
	};
}

//Create legend based on min, mean, max values
function createPropEmpLegend(map, empAttributes){
	let legendControl = L.Control.extend({
		options: {
			position: 'bottomright'
		},

		onAdd: function(map){
			//Create the control container with a particular class name
			let legendContainer = L.DomUtil.create('div', 'legendControlContainer');

			//Create temporal legend here
			$(legendContainer).append('<h1>Appalachain Coal Employment</h1>');

			//Add temporal legend div to container
			$(legendContainer).append('<div id="temporalLegend">')

			//Start attribute legend svg string
			let svg = '<svg id="attributeLegend" width="340px" height="160px">';

			//Update proportional employment circle attributes and legend text when the data attribute is changed by the user
			//Object to base loop on
			let circles = {
				max: 45,
				mean: 100,
				min: 155
			};

			//Loop to add each circle and text to svg strings
			for (let circle in circles){
				//Circle string
				svg += '<circle class="legend-circle" id="' + circle + '" fill="Orange" fill-opacity="0.8" stroke="Black" cx="90"/>';

				//Text string
				svg += '<text id="' + circle + '-text" x="250" y="' + circles[circle] + '"></text>';
			};

			//Close svg string
			svg += "</svg>";

			//Add attribute legend svg to container
			$(legendContainer).append(svg);

			return legendContainer;
		}
	});

	map.addControl(new legendControl());

	updateLegend(map,empAttributes[0]);
};

//Update the legend with new attribute
function updateLegend(map, attribute){
	//Create content for legend
	let year = attribute.split("F")[1];
	let content = year;

	//Replace Legend Content
	$('#temporalLegend').html(content);

	//Get the max, mean, an min values as an object
	let circleValues = getCircleValues(map, attribute);

	for (key in circleValues){
		//Get the radius
		let radius = calcPropRadius(circleValues[key]);

		//Assign each `<circle>` element a center and radius based on the dataset max, mean, and min values of the current attribute
		$('#' + key).attr({
			cx: 80,
			cy: 159 - radius,
			r: radius
		});

		//Add Legend Text
		$('#' + key + '-text').text(circleValues[key])
	};
}


//<--------------------SEQUENCE CONTROLS-------------------->


//Create the sequence controls
function createPropSequenceControls(map, empAttributes, proAttributes){
	let SequenceControl = L.Control.extend({
		options: {
			position: 'bottomleft'
		},

		onAdd: function(){
			//Create control container div with a particular class name
			let sliderContainer = L.DomUtil.create('div', 'sequenceControlContainer');

			//...initialize other DOM elements, add listeners, etc.

			//Kill any mouse event listeners on the map
			L.DomEvent.addListener(sliderContainer, 'mousedown dblclick', function(){
				L.DomEvent.disableClickPropagation(sliderContainer);
			});

			return sliderContainer;
		}
	});

	map.addControl(new SequenceControl());

	//Create slider widget

	//Create range input element (slider) (the range type attribute is what makes the slider possible)
	$('.sequenceControlContainer').append('<input class="rangeSlider" type="range">');

	//Set slider attributes (2000-2016 (17 years))
	$('.rangeSlider').attr({
		min: 0,
		max: 16,
		value: 0,
		step: 1
	});

	//Create skip (reverse/forward) buttons
	$('.sequenceControlContainer').append('<button class="skip" id="reverse"><img alt="Reverse Button" src="img/icons/triangle-15.svg"></button>');
	$('.sequenceControlContainer').append('<button class="skip" id="forward"><img alt="Forward Button" src="img/icons/triangle-15.svg"></button>');


	//Listen for user input via affordances

	//Click listener for buttons
	$('.skip').click(function(e){
		e.stopPropagation();
		//Get the old index value
		let index = $('.rangeSlider').val();
		console.log(index);

		//For a forward step through the sequence, increment the attributes array index
		if ($(this).attr('id') == 'forward') {
			index++;
			//If past the last attribute, wrap around to the first attribute
			index = index > 16 ? 0 : index;
			//Reassign the current attribute based on the new attributes array index
			updatePropEmpSymbols(map, empAttributes[index]);
			updateLegend(map, empAttributes[index]);
			//updatePropProSymbols(map, proAttributes[index]);
			//For a reverse step, decrement the attributes array index
			console.log('Forward Click');
		} else if ($(this).attr('id') == 'reverse') {
			index--;
			//If past the last attribute, wrap around to the first attribute
			index = index < 0 ? 16 : index;
			//Reassign the current attribute based on the new attributes array index
			updatePropEmpSymbols(map, empAttributes[index]);
			updateLegend(map, empAttributes[index]);
			//updatePropProSymbols(map, proAttributes[index]);
			console.log('Reverse Click');
		};

		//Update the slider position based on the new index
		$('.rangeSlider').val(index);
	});

	//Input listener for slider
	$('.rangeSlider').on('input', function(e){
		e.stopPropagation();
		//Get the new index value
		let index = $(this).val();

		//Reassign the current attribute based on the new attributes array index
		updatePropEmpSymbols(map, empAttributes[index]);
		updateLegend(map, empAttributes[index]);
		//updatePropProSymbols(map, proAttributes[index]);
	});
}


//<--------------------LIFT OFF-------------------->


//Load the map once the rest of the web page document has finished loading.
$(document).ready(createMapData);
