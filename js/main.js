/* Kevin Palmer, 2019 */

//Mapbox access token
L.mapbox.accessToken = 'pk.eyJ1IjoicmtwYWxtZXJqciIsImEiOiJjaXZzd25ha3YwNTVmMnRxcmZqMG82MWk5In0.J7XdNJ6-0wr7cgeH6e-7xw';

//Basemaps
let mapboxStreets = L.mapbox.tileLayer('mapbox.streets');
let Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

//Function to instantiate the map
function createMap(){
	//Create the map and set the initial map settings
	let map = L.mapbox.map('mainMap', 'mapbox.streets', {
		minZoom: 6,
		maxZoom: 14,
		maxBounds: [[27.742778, -97.4019444], [47.62, -65.65]]
	}).setView([37.347222, -81.633333], 6);

	//Basemaps control varibles
	let baseMaps = {
		'Mapbox Streets': mapboxStreets,
		'ESRI Imagery': Esri_WorldImagery
	};

	//Create Map Panes <-- See url: https://jsfiddle.net/3v7hd2vx/90/
	map.createPane("arcPane").style.zIndex = 240; // between tiles and overlays
	map.createPane("countyPane").style.zIndex = 250; // between overlays and shadows
	map.createPane("statePane").style.zIndex = 260; // between overlays and shadows
	map.createPane("propPane").style.zIndex = 450; // between overlays and shadows
	map.createPane("popupPane").style.zIndex = 700; // between overlays and shadows

	//Call the get data functions to add data to map
	getPropEmpData(map);
	//getPropProData(map);
	getARCOutline(map);
	getStates(map);
	getCounties(map);


	//Add basemaps controls to the map
	L.control.layers(baseMaps).addTo(map);
}

//Function to import the county coal employment data (used by the createMap function)
function getPropEmpData(map){
	//Load the data using jQuery
	$.ajax('data/Appalachia_Coal_Emp_POINTS.json', {
		dataType: 'json',
		success: function(data){
			//Create an attributes array with the received data
			let attributes = processPropEmpData(data);

			//Create the map symbols using this data
			createPropEmpSymbols(data, map, attributes);
			//Create the legend using this data
			createPropEmpLegend(map, attributes);
			//Create the sequence controls using this data
			createPropSequenceControls(map, attributes);
		}
	});
}
/*
//Function to import the county coal employment data (used by the createMap function)
function getPropProData(map){
	//Load the data using jQuery
	$.ajax('data/Appalachia_Coal_Emp_POINTS.json', {
		dataType: 'json',
		success: function(data){
			//Create an attributes array with the received data
			let attributes = processPropEmpData(data);

			//Create the map symbols using this data
			createPropEmpSymbols(data, map, attributes);
			//Create the legend using this data
			createPropEmpLegend(map, attributes);
			//Create the sequence controls using this data
			createPropSequenceControls(map, attributes);
		}
	});
}
*/
//Function to get the ARC outline (used by the createMap function) - just for reference purposes
function getARCOutline(map){
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
function getStates(map){
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
function getCounties(map){
	//Load the data using jQuery
	$.ajax('data/ARC_Region_Subregions.json', {
		dataType: 'json',
		success: function(data){
			//Create an attributes array with the received data
			let attributes = processCountyData(data);

			//Create teh county polygons using this data
			createCounties(data, map, attributes);
		}
	});
}


//Create an array of the sequential attributes from the JSON to keep track of their order
//Function to build attributes array from the data
function processPropEmpData(data){
	//Empty array to hold attributes
	let attributes = [];

	//Properties of the first feature in the dataset
	let properties = data.features[0].properties;

	//Push each attribute name into attributes array
	for (let attribute in properties){
		//Only take attributes with job count values
		if (attribute.indexOf("F20") > -1){
			attributes.push(attribute);
		};
	};

	//Check results
	console.log('Prop Symbol attributes: ' + attributes);
	for (i in attributes){
		console.log(i + ": " + attributes[i]);
	};

	//Return the array of attributes
	return attributes;
};

//Create an array of attributes from the JSON to show the county data in the panel and popups
//Function to process the County data for hover popups
function processCountyData(data){
	//Empty array to hold attributes
	let attributes = [];

	//Properties of the first feature in the dataset
	let properties = data.features[0].properties;

	//Push each attribute name into attributes array
	for (let attribute in properties){
		attributes.push(attribute);
	};

	//Check results
	console.log('County attributes: ' + attributes);
	for (i in attributes){
		console.log(i + ": " + attributes[i]);
	};

	//Return the array of attributes
	return attributes;
}


//Styling the map layers/data

//Give each feature's circle marker a radius based on its attribute value
function calcPropEmpRadius(attValue){
	//Scale factor to adjust symbol size evenly
	let scaleFactor = 3;
	//Area based on attribute value and scale factor
	let area = attValue * scaleFactor;
	//Radius calculated based on area
	let radius = Math.sqrt(area/Math.PI);
	//Return radius value
	return radius;
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


//Function to create proportional circle markers with popups
function symbols(feature, latlng, attributes){

	//Assign the current attribute based on the index of the attributes array
	let attribute = attributes[0];

	//For each feature, determine its value for the selected attribute
	let attValue = Number(feature.properties[attribute]);

	//Update marker radius
	propMarkerEmpOptions.radius = calcPropEmpRadius(attValue);
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


//Add circle markers for employment point features to the map - done (in AJAX callback)
function createPropEmpSymbols(data, map, attributes){
	//Add the loaded data to the map styled with the marker options
	L.geoJSON(data, {
		//onEachFeature: popUps,
		pointToLayer: function(feature, latlng){
			return symbols(feature, latlng, attributes);
		}
	}).addTo(map);
}

//Add polygon symbol for ARC boundary to the map - done (in AJAX callback)
function createARC(dataARC, map){
	//Add the loaded data to the map styled below
	L.geoJSON(dataARC, {
		pane: 'arcPane',
		color: 'Black',
		fillColor: 'Black',
		fillOpacity: .25,
		weight: 0,
		opacity: 1
	}).addTo(map);
}

//Add polygon symbols for states to the map - done (in AJAX callback)
function createStates(dataARC, map){
	//Add the loaded data to the map styled below
	L.geoJSON(dataARC, {
		pane: 'statePane',
		color: "Black",
		fillColor: 'None',
		weight: 1,
		opacity: .5
	}).addTo(map);
}

//Add polygon symbols for counties to the map - done (in AJAX callback)
function createCounties(dataARC, map){
	//Add the loaded data to the map styled below
	 L.geoJSON(dataARC, {
		pane: 'countyPane',
		//onEachFeature: onEachCounty,
		color: "White",
		fillColor: 'None',
		weight: .5,
		opacity: 1
	}).addTo(map);
}


//Function to update the proportional employment circles based on year and also adjust popup offset
function updatePropEmpSymbols(map, attribute){
	map.eachLayer(function(layer){
		if (layer.feature && layer.feature.properties[attribute]){
			//Update the layer style and popup

			//Access feature properties
			let props = layer.feature.properties;

			//Update each feature's radius based on new attribute values
			let radius = calcPropEmpRadius(props[attribute]);
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


//Create legend

//Calculate the max, mean, min values for a given attribute
function getCircleValues(map, attribute){
	//Start with min at highest possible and max at lowest value possible number
	let min = Infinity;
	let max = -Infinity;

	map.eachLayer(function(layer){
		//Get the attribute value
		if (layer.feature){
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
function createPropEmpLegend(map, attributes){
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

	updateLegend(map,attributes[0]);
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
		let radius = calcPropEmpRadius(circleValues[key]);

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


//Create the sequence controls
function createPropSequenceControls(map, attributes){
	let SequenceControl = L.Control.extend({
		options: {
			position: 'bottomleft'
		},

		onAdd: function(map){
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

		//1-2-3.6 For a forward step through the sequence, increment the attributes array index
		if ($(this).attr('id') == 'forward') {
			index++;
			//1-2-3.7 If past the last attribute, wrap around to the first attribute
			index = index > 16 ? 0 : index;
			//1-2-3.9 Reassign the current attribute based on the new attributes array index
			updatePropEmpSymbols(map, attributes[index]);
			updateLegend(map, attributes[index]);
			//1-2-3.6 For a reverse step, decrement the attributes array index
			console.log('Forward Click');
		} else if ($(this).attr('id') == 'reverse') {
			index--;
			//1-2-3.7 If past the last attribute, wrap around to the first attribute
			index = index < 0 ? 16 : index;
			//1-2-3.9 Reassign the current attribute based on the new attributes array index
			updatePropEmpSymbols(map, attributes[index]);
			updateLegend(map, attributes[index]);
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
		updatePropEmpSymbols(map, attributes[index]);
		updateLegend(map, attributes[index]);
	});
}

//Load the map once the rest of the web page document has finished loading.
$(document).ready(createMap);
