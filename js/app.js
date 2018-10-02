var Place = function(data) {
    this.name = ko.observable(data.name);
    this.coordinates = ko.observable(data.coordinates);
    this.photo = ko.observable(data.photo);
    this.types = ko.observable(data.types);
}

var ViewModel = function () {

    this.init = function () {
        
        // Initialize the map
        this.map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: 51.919662988, lng: 4.4753314},
                zoom: 13
            });

        // Initialize the placesService
        this.placesService = new google.maps.places.PlacesService(this.map);

        // Get map bounds
        this.bounds = ko.observable(this.map.getBounds());

        this.markers = ko.observableArray();
        this.errorMessage = ko.observable('');

        // Keep track of what the user queried
        this.query = ko.observable("Pizza");
    }
    
    var that = this;
    
    // Clear existing markers on the map
    this.clearMarkers = function() {
        // Clear existing markers
        if (that.markers()) {
            for (let marker of that.markers()) {
                marker.setMap(null);
            }
        }

        that.markers = ko.observableArray([]);
    }

    this.placeMarkers = function (results) {
        for (let result of results) {
            marker = new google.maps.Marker({
                map: that.map,
                position: result.geometry.location
            });
            that.markers.push(marker);
        }
    }

    this.callback = function(results, status) {
        
        that.clearMarkers()
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            that.errorMessage('');
            that.placeMarkers(results);
        } 
        else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            that.errorMessage("Could not find anything for your search term");
        }
    }

    // Search for places
    this.search = function () {
        this.placesService.nearbySearch({
                  bounds: this.map.getBounds(),
                  radius: 500,
                  type: ['restaurant'],
                  keyword: this.query()
                }, this.callback);
    }
};


function initMap () {
    viewModel = new ViewModel();
    viewModel.init();
    ko.applyBindings(viewModel);
}