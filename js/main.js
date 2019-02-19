/* Kevin Palmer, 2019 */

//GOAL: Proportional symbols representing attribute values of mapped features
//STEPS:

//1. Create the Leaflet map--done (in createMap()).

//Mapbox access token.
L.mapbox.accessToken = 'pk.eyJ1IjoicmtwYWxtZXJqciIsImEiOiJjaXZzd25ha3YwNTVmMnRxcmZqMG82MWk5In0.J7XdNJ6-0wr7cgeH6e-7xw';

//Function to instantiate the map.
function createMap(){
	//Create the map and set the map settings.
	var map = L.mapbox.map('mainMap', 'mapbox.streets', {
		minZoom: 6,
		maxZoom: 10,
		maxBounds: [[27.742778, -97.4019444],[47.62,-65.65]]
	})
	.setView([37.347222, -81.633333], 6);
	//Call the getData function to add data to map.
	getData(map);
}

//2. Import GeoJSON data--done (in getData())

//Function to get the geojson data (used by the createMap function).
function getData(map){
	//Load the data.
	$.ajax('data/Coal_Emp.json', {
		dataType: 'json',
		success: function(data) {
			createPropSymbols(data, map);
		}
	});
}

//Styling the map layers/data

//6. Give each feature's circle marker a radius based on its attribute value.
function calcPropRadius(attValue) {
	//Scale factor to adjust symbol size evenly.
	var scaleFactor = .75;
	//area based on attribute value and scale factor.
	var area = attValue * scaleFactor;
	//radius calculated based on area
	var radius = Math.sqrt(area/Math.PI);
	return radius;
}

//Variable to create marker options.
var markerOptions = {
fillColor: '#ff7800',
color: '#000',
weight: 1,
opacity: 1,
fillOpacity: 0.8
};

//4. Determine which attribute to visualize with proportional symbols
//Variable to determine which attribute to visualize with proportional symbols.
var attribute = 'F2009';

//Function to create circle markers with popups.
function symbols(feature, latlng) {
	//5. For each feature, determine its value for the selected attribute
	var attValue = Number(feature.properties[attribute]);
	//Examine the attribute value to check that it is correct.
	console.log(feature.properties, attValue);
	//Update marker radius.
	markerOptions.radius = calcPropRadius(attValue);
	//Return results.
	var layer =  L.circleMarker(latlng,markerOptions);

	//Add popups
	var panelContent = '';
	for (var property in feature.properties) {
		panelContent += '<p>' + property + ': ' + feature.properties[property] + '</p>';
	}
	var popupContent = '<p>' + feature.properties.COUNTY_NAME + ', ' + feature.properties.STATE_NAME + '</p>';

	layer.bindPopup(popupContent, {
		offset: new L.Point(0,-markerOptions.radius), //Offsets the popup from the symbol so they don't overlap.
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
	var popupContent = '';
	if (feature.properties) {
		//Loop to add feature property names and values to string.
		for (var property in feature.properties) {
			popupContent += '<p>' + property + ': ' + feature.properties[property] + '</p>';
		}
		layer.bindPopup(popupContent);
	}
}
*/
//3. Add circle markers for point features to the map--done (in AJAX callback).
function createPropSymbols(data,map) {
	//Add the loaded data to the map styled with the marker options.
	L.geoJSON(data, {
		//onEachFeature: popUps,
		pointToLayer: symbols
	}).addTo(map);
}

//Load the map once the rest of the web page document has finished loading.
$(document).ready(createMap);
