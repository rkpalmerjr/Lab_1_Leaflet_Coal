/* Kevin Palmer, 2019 */

//GOAL: Proportional symbols representing attribute values of mapped features
//STEPS:

//1-2-1.1 Create the Leaflet map--done (in createMap()).

//Mapbox access token.
L.mapbox.accessToken = 'pk.eyJ1IjoicmtwYWxtZXJqciIsImEiOiJjaXZzd25ha3YwNTVmMnRxcmZqMG82MWk5In0.J7XdNJ6-0wr7cgeH6e-7xw';

//Function to instantiate the map.
function createMap(){
	//Create the map and set the map settings.
	const map = L.mapbox.map('mainMap', 'mapbox.streets', {
		minZoom: 6,
		maxZoom: 10,
		maxBounds: [[27.742778, -97.4019444], [47.62, -65.65]]
	})
	.setView([37.347222, -81.633333], 6);
	//Call the getData function to add data to map.
	getData(map);
}

//1-2-1.2 Import GeoJSON data--done (in getData())
//Function to get/import the geojson data (used by the createMap function).
function getData(map){
	//Load the data.
	$.ajax('data/Coal_Emp.json', {
		dataType: 'json',
		success: function(data){
			//Create an attributes array with the received data
			let attributes = processData(data);

			createPropSymbols(data, map, attributes);
			createSequenceControls(map, attributes);
		}
	});
}

//1-2-3.3 Create an array of the sequential attributes to keep track of their order
//Function to build attributes array from the data
function processData(data){
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

	//Check result
	console.log(attributes);
	for (i in attributes){
		console.log(i + ": " + attributes[i]);
	};

	return attributes;
};

//Styling the map layers/data

//1-2-1.6 Give each feature's circle marker a radius based on its attribute value.
function calcPropRadius(attValue){
	//Scale factor to adjust symbol size evenly.
	let scaleFactor = 0.5;
	//area based on attribute value and scale factor.
	let area = attValue * scaleFactor;
	//radius calculated based on area
	let radius = Math.sqrt(area/Math.PI);
	return radius;
}

//Variable to create marker options.
let markerOptions = {
fillColor: '#ff7800',
color: '#000',
weight: 1,
opacity: 1,
fillOpacity: 0.8
};

//1-2-1.4 Determine which attribute to visualize with proportional symbols
//letiable to determine which attribute to visualize with proportional symbols.
//let attribute = 'F2009';

//Function to create circle markers with popups.
function symbols(feature, latlng, attributes){

	console.log(attributes[0]);
	//1-2-3.4 Assign the current attribute based on the index of the attributes array
	let attribute = attributes[0];

	console.log(attribute);

	//1-2-1.5 For each feature, determine its value for the selected attribute
	let attValue = Number(feature.properties[attribute]);
	//Examine the attribute value to check that it is correct.
	console.log(feature.properties, attValue);
	//Update marker radius.
	markerOptions.radius = calcPropRadius(attValue);
	//Return results.
	let layer =  L.circleMarker(latlng, markerOptions);

	//Add popups
	let panelContent = '';
	for (let property in feature.properties) {
		panelContent += '<p>' + property + ': ' + feature.properties[property] + '</p>';
	}
	let popupContent = '<p>' + feature.properties.COUNTY_NAME + ', ' + feature.properties.STATE_NAME + '</p>';

	layer.bindPopup(popupContent, {
		offset: new L.Point(0, -markerOptions.radius), //Offsets the popup from the symbol so they don't overlap.
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
	//
	return layer;
}
/*
//Function to add popups to each mapped feature.
function popUps(feature, layer) {
	//Create string with all properties.
	let popupContent = '';
	if (feature.properties) {
		//Loop to add feature property names and values to string.
		for (let property in feature.properties) {
			popupContent += '<p>' + property + ': ' + feature.properties[property] + '</p>';
		}
		layer.bindPopup(popupContent);
	}
}
*/

//1-2-1.3 Add circle markers for point features to the map--done (in AJAX callback).
function createPropSymbols(data, map, attributes){
	//Add the loaded data to the map styled with the marker options.
	L.geoJSON(data, {
		//onEachFeature: popUps,
		pointToLayer: function(feature, latlng){
			return symbols(feature, latlng, attributes);
		}
	}).addTo(map);
}

//
function updatePropSymbols(map, attribute){
	map.eachLayer(function(layer){
		if (layer.feature && layer.feature.properties[attribute]){
			//Update the layer style and popup
			//Access feature properties
			let props = layer.feature.properties;

			//Update each feature's radius based on new attribute values
			let radius = calcPropRadius(props[attribute]);
			layer.setRadius(radius);

			//Update popup content
			let popupContent = '<p>' + layer.feature.properties.COUNTY_NAME + ', ' + layer.feature.properties.STATE_NAME + '</p>';
/*
			//Update panel content
			for (let property in layer.feature.properties) {
				panelContent += '<p>' + property + ': ' + layer.feature.properties[property] + '</p>';
			};
*/
			layer.bindPopup(popupContent, {
				offset: new L.Point(0, -markerOptions.radius), //Offsets the popup from the symbol so they don't overlap.
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
/*
				click: function(){
					$('#panel').html(panelContent);
				}
*/
			});
		};
	});
}

function createSequenceControls(map, attributes){
	let SequenceControl = L.Control.extend({
		options: {
			position: 'bottomleft'
		},

		onAdd: function(map){
			//Create control container div with a particular class name
			let sliderContainer = L.DomUtil.create('div', 'sequenceControlContainer');

			//...initialize other DOM elements, add listeners, etc.

			//Kill any mouse event listeners on the map
			L.DomEvent.addListener(sliderContainer, 'input mousedown dblclick', function(ev){
				L.DomEvent.stopPropagation(ev);
			//$(sliderContainer).dblclick(function(e){
				//e.stopPropagation();
			});

			return sliderContainer;
		}
	});

	map.addControl(new SequenceControl());

	//1-2-3.1 Create slider widget
	//Create range input element (slider) (the range type attribute is what makes the slider possible)
	$('.sequenceControlContainer').append('<input class="rangeSlider" type="range">');
	//Set slider attributes (2000-2015 (16 years))
	$('.rangeSlider').attr({
		min: 0,
		max: 15,
		value: 0,
		step: 1
	});

	//1-2-3.2 Create skip (reverse/forward) buttons
	$('.sequenceControlContainer').append('<button class="skip" id="reverse"><img alt="Reverse Button" src="img/icons/triangle-15.svg"></button>');
	$('.sequenceControlContainer').append('<button class="skip" id="forward"><img alt="Forward Button" src="img/icons/triangle-15.svg"></button>');
	//$('#reverse').html('<img alt="Reverse Button" src="img/icons/triangle-15.svg">');
	//$('#forward').html('<img alt="Forward Button" src="img/icons/triangle-15.svg">');

	//1-2-3.5 Listen for user input via affordances
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
			index = index > 15 ? 0 : index;
			//1-2-3.9 Reassign the current attribute based on the new attributes array index
			updatePropSymbols(map, attributes[index]);
			//1-2-3.6 For a reverse step, decrement the attributes array index
			console.log('Forward Click');
		} else if ($(this).attr('id') == 'reverse') {
			index--;
			//1-2-3.7 If past the last attribute, wrap around to the first attribute
			index = index < 0 ? 15 : index;
			//1-2-3.9 Reassign the current attribute based on the new attributes array index
			updatePropSymbols(map, attributes[index]);
			console.log('Reverse Click');
		};

		//1-2-3.8 Update the slider position based on the new index
		$('.rangeSlider').val(index);
	});

	//Input listener for slider
	$('.rangeSlider').on('input', function(e){
		e.stopPropagation();
		//Get the new index value
		let index = $(this).val();
		//1-2-3.9 Reassign the current attribute based on the new attributes array index
		updatePropSymbols(map, attributes[index]);
	});

}


/*
//1-2-3 Create new sequence controls
function createSequenceControls(map, attributes){
	//1-2-3.1 Create slider widget
	//Create range input element (slider) (the range type attribute is what makes the slider possible)
	$('#panel').append('<input class="rangeSlider" type="range">');
	//Set slider attributes (2000-2015 (16 years))
	$('.rangeSlider').attr({
		min: 0,
		max: 15,
		value: 0,
		step: 1
	});

	//1-2-3.2 Create skip (reverse/forward) buttons
	$('#panel').append('<button class="skip" id="reverse"><img alt="Reverse Button" src="img/icons/triangle-15.svg"></button>');
	$('#panel').append('<button class="skip" id="forward"><img alt="Forward Button" src="img/icons/triangle-15.svg"></button>');
	//$('#reverse').html('<img alt="Reverse Button" src="img/icons/triangle-15.svg">');
	//$('#forward').html('<img alt="Forward Button" src="img/icons/triangle-15.svg">');

	//1-2-3.5 Listen for user input via affordances
	//Click listener for buttons
	$('.skip').click(function() {
		//Get the old index value
		let index = $('.rangeSlider').val();
		console.log(index);

		//1-2-3.6 For a forward step through the sequence, increment the attributes array index
		if ($(this).attr('id') == 'forward') {
			index++;
			//1-2-3.7 If past the last attribute, wrap around to the first attribute
			index = index > 15 ? 0 : index;
			//1-2-3.9 Reassign the current attribute based on the new attributes array index
			updatePropSymbols(map, attributes[index]);
			//1-2-3.6 For a reverse step, decrement the attributes array index
			console.log('Forward Click');
		} else if ($(this).attr('id') == 'reverse') {
			index--;
			//1-2-3.7 If past the last attribute, wrap around to the first attribute
			index = index < 0 ? 15 : index;
			//1-2-3.9 Reassign the current attribute based on the new attributes array index
			updatePropSymbols(map, attributes[index]);
			console.log('Reverse Click');
		};

		//1-2-3.8 Update the slider position based on the new index
		$('.rangeSlider').val(index);
	});

	//Input listener for slider
	$('.rangeSlider').on('input', function(){
		//Get the new index value
		let index = $(this).val();
		//1-2-3.9 Reassign the current attribute based on the new attributes array index
		updatePropSymbols(map, attributes[index]);
	});
}
*/

//Load the map once the rest of the web page document has finished loading.
$(document).ready(createMap);
