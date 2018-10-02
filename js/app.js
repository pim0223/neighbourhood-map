var Place = function(result, map) {
    that = this;

    that.name = ko.observable(result.name);
    that.coordinates = ko.observable(result.geometry.location);
    
    that.makeMarker = function () {
        marker = new google.maps.Marker({
            map: map,
            position: that.coordinates(),
            title: that.name()
        });

        return marker;
    }

    that.marker = that.makeMarker();

    that.marker.addPanorama = function () {
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById('panorama'), {
            position: this.position,
            pov: {
              heading: 34,
              pitch: 10
            }
          });
        map.setStreetView(panorama);
    }

    that.marker.showInfoWindow = function () {
        map.infoWindow.setContent('<div> <p>' + this.title + '</p> </div> <div id="panorama"></div>')
        map.infoWindow.open(map, this);
        this.addPanorama();
    }

    that.showInfoWindow = that.marker.showInfoWindow.bind(that.marker)

    google.maps.event.addListener(that.marker, 'click', function () {
        this.showInfoWindow();
    });
}

var ViewModel = function () {
    var that = this;
       
    // Initialize the map
    that.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 51.919662988, lng: 4.4753314},
            zoom: 13
        });

    // Make placesService for looking up places from the Google Maps places API
    that.placesService = new google.maps.places.PlacesService(that.map);

    // Make StreetViewService for getting street view images for a place
    that.streetViewService = new google.maps.StreetViewService();

    that.places = ko.observableArray();
    that.errorMessage = ko.observable();
    that.map.infoWindow = new google.maps.InfoWindow();

    // Keep track of what the user queried
    that.query = ko.observable("Pizza");

    // Clear markers for all places on the map
    that.clearMarkers = function() {
        for (let place of that.places()) {
            place.marker.setMap(null);
        }
    }

    that.callback = function (results, status) {
        // Clear the markers off the map
        that.clearMarkers();

        // Empty the places array
        that.places([]);

        if (status === google.maps.places.PlacesServiceStatus.OK) {
            that.errorMessage('');

            for (result of results) {
                that.places.push(new Place(result, that.map));
            };
        } 

        // Display error message in case we don't get any results
        else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            that.errorMessage("Could not find anything for your search term");
        }
    }

    // Search for places
    that.search = function () {
        that.placesService.nearbySearch({
                  bounds: that.map.getBounds(),
                  radius: 1000,
                  type: ['restaurant'],
                  keyword: that.query()
                }, that.callback);
    }
};


function initMap () {
    ko.applyBindings(new ViewModel());
}