'use strict';

var initialLocations = [
	{
		name: 'Milennium Park',
		lat: 41.8825523,
		long: -87.6225516
	},
	{
		name: 'The Art Institute of Chicago',
		lat: 41.8795845,
		long: -87.6237133
	},
	{
		name: 'Buckingham Fountain',
		lat: 41.8757943,
		long: -87.6189481
	},
	{
		name: 'Chicago Symphony Center',
		lat: 41.8789876,
		long: -87.6250648
	},
	{
		name: 'Harris Theater',
		lat: 41.8839451,
		long: -87.6218784
	},
	{
		name: 'Fine Arts Building',
		lat: 41.8764681,
		long: -87.624838
	},
	{
		name: 'Crown Fountain',
		lat: 41.8814912,
		long: -87.623729
	},
	{
		name: 'Harold Washington Library Center',
		lat: 41.8762968,
		long: -87.6282279
	}
];

var map;
var clientID;
var clientSecret;

var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.lat = data.lat;
	this.long = data.long;
	this.URL = "";
	this.street = "";
	this.city = "";
	this.phone = "";

	this.visible = ko.observable(true);

	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.long + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;

	$.getJSON(foursquareURL).done(function(data) {
		var info = data.response.venues[0];
		self.URL = info.url;
		if (typeof self.URL === 'undefined'){
			self.URL = "";
		}
		self.street = info.location.formattedAddress[0];
     	self.city = info.location.formattedAddress[1];
      	self.phone = info.contact.phone;
      	if (typeof self.phone === 'undefined'){
			self.phone = "";
		} else {
			self.phone = formatPhone(self.phone);
		}
	}).fail(function() {
		alert("There was an error with the Foursquare API call. Please refresh the page and try again to load Foursquare data.");
	});

	this.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" +
        '<div class="content">' + self.phone + "</div></div>";

	this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.lat, data.long),
			map: map,
			title: data.name
	});

	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

	this.marker.addListener('click', function(){
		self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" +
        '<div class="content"><a href="tel:' + self.phone +'">' + self.phone +"</a></div></div>";

        self.infoWindow.setContent(self.contentString);

		self.infoWindow.open(map, this);

		self.marker.setAnimation(google.maps.Animation.BOUNCE);
      	setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 2100);
	});

	this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};
};

function ViewModel() {
	var self = this;

	this.searchTerm = ko.observable("");

	this.locationList = ko.observableArray([]);

	map = new google.maps.Map(document.getElementById('map'), {
			zoom: 16,
			center: {lat: 41.8787895, lng: -87.6237133}
	});

	// Foursquare API settings
	clientID = "DFWN0DIL25Q3CKQQABFUMTYZNOLDFGDQB2U4UYXX4MIOAAO0";
	clientSecret = "BHWDLU3XHNQNBVUN3XUOZEYWJ4SVLQJRPZQVRAQOSASKKPTE";

	initialLocations.forEach(function(locationItem){
		self.locationList.push( new Location(locationItem));
	});

	this.filteredList = ko.computed( function() {
		var filter = self.searchTerm().toLowerCase();
		if (!filter) {
			self.locationList().forEach(function(locationItem){
				locationItem.visible(true);
			});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
				var string = locationItem.name.toLowerCase();
				var result = (string.search(filter) >= 0);
				locationItem.visible(result);
				return result;
			});
		}
	}, self);

	this.mapElem = document.getElementById('map');
	this.mapElem.style.height = window.innerHeight - 50;
}

function startApp() {
	ko.applyBindings(new ViewModel());
}

function errorHandling() {
	alert("Google Maps has failed to load. Please check your internet connection and try again.");
}