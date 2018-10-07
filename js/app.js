var ViewModel = function () {
    const that = this;
       
    that.init = function () {

        // Initialize the map
        that.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 51.919662988, lng: 4.4753314},
            zoom: 15,
            mapTypeControlOptions: {position: google.maps.ControlPosition.TOP_CENTER}
        });        
        
        // Assign DOM elements to KO observables
        that.markers = ko.observableArray();
        that.errorMessage = ko.observable();
        that.query = ko.observable("Pizza");
        that.placeQuery = ko.observable();
        that.bounds = ko.observable(that.map.getBounds());
        that.weather = ko.observable();
        that.minRating = ko.observable(3);
        that.menuVisible = ko.observable(true);

        // Filter markers and list based on rating filter
        that.filteredMarkers = ko.computed(function() {
            if(!that.minRating()) {
                that.showMarkers(that.markers())
                return that.markers(); 
            } else {
                that.clearMarkers(that.markers());
                return ko.utils.arrayFilter(that.markers(), function(marker) {
                     if (marker.rating >= that.minRating()) {
                        that.showMarker(marker);
                        return true;
                     };                     
                });
            }
        }, that);
       
        // Service to return info for a search term
        that.placesService = new google.maps.places.PlacesService(that.map);
        
        // Service to get a streetview panorama
        that.streetViewService = new google.maps.StreetViewService();

        // Service to encode addresses to GPS coordinates
        that.geocoder = new google.maps.Geocoder();
        
        // Window to display information for a marker
        that.infoWindow = new google.maps.InfoWindow({maxHeight: 400});

        // Searchbox for current location
        that.placeInput = document.getElementById("placeInput")
        that.searchBox = new google.maps.places.SearchBox(that.placeInput);
    }

    // Clear markers for all places on the map
    that.clearMarkers = function(markers) {
        for (let marker of markers) {
            marker.setMap(null);
        }
    }

    // Show a set of markers on the map
    that.showMarkers = function(markers) {
        for (let marker of markers) {
            marker.setMap(that.map);
        };
    }

    // Show one marker on the map
    that.showMarker = function (marker) {
        marker.setMap(that.map);
    }

    that.makeMarkerBounce = function (marker) {
        // Stop the bouncing of other markers
        that.stopMarkersBouncing(that.markers())
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }

    that.stopMarkersBouncing = function (markers) {
        for (let marker of markers) {
            marker.setAnimation(null);
        }
    }

    // Get the weather for the current map location from the openweathermap API
    that.getWeather = function () {

        let mapCenter = that.map.getCenter()

        let url = `http://api.openweathermap.org/data/2.5/weather?lat=${mapCenter.lat()}&lon=${mapCenter.lng()}&APPID=947fb8237f2dbc03a4fe2ea0a1feab24`
        
        function updateWeather(data, status) {
            if (status == "success") {
                that.weather(`Weather: ${data.weather[0].description}`)
            }
            else {
                that.weather(`Weather unavailable`)   
            }
        }

        $.get(url, function(data, status){
            updateWeather(data, status);
        });
    }

    // Add a StreetviewPanorama to a marker
   that.addPanorama = function (marker) {
        const panorama = new google.maps.StreetViewPanorama(
          document.getElementById('panorama'), {
            position: marker.position,
            pov: {
              heading: 0,
              pitch: 10
            }
          });

        that.map.setStreetView(panorama);
    }

    // Show infowindow on marker, displaying name, rating, streetview and weather
    that.showInfoWindow = function (marker) {
        that.infoWindow.setContent(
            `<div id ="title">  ${marker.title} | ${marker.rating} &#9733</div>` + 
            `<div id="panorama">No panorama found</div>` +
            `<div id="weather"> ${that.weather()} </div>` +
            ` <p class="footnote">(Data by <a href="https://openweathermap.org/api">Openweathermap)</a></p>` 
            )

        that.infoWindow.open(map, marker);
        that.addPanorama(marker);
    }

    // Make markers according to search query
    that.makeMarkers = function (results, status) {
        // Empty the markers array
        that.markers([]);

        if (status === google.maps.places.PlacesServiceStatus.OK) {
            that.errorMessage('');

            for (let result of results) {
                let marker = new google.maps.Marker({
                    map: null,
                    position: result.geometry.location,
                    title: result.name,
                    rating: result.rating
                });

                google.maps.event.addListener(marker, 'click', function () {
                    that.showInfoWindow(this);
                    that.makeMarkerBounce(this);
                });     

                that.markers.push(marker);
            };
        } 

        // Display error message in case we don't get any results
        else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            that.errorMessage("Could not find anything for your search term");
        }
    }

    // Search for places
    that.searchPlaces = function () {
        let places = that.searchBox.getPlaces();
        
        if (!places) {
            that.errorMessage('Please enter a valid location')
            return
        }
        else {
            let place = places[0].geometry.location;
            that.map.setCenter(place);
        }
        that.getWeather();
                
        that.placesService.nearbySearch({
                  bounds: that.map.getBounds(),
                  radius: 1000,
                  type: ['restaurant'],
                  keyword: that.query()
                }, that.makeMarkers);
    }

    // Toggle side menu
    that.toggleMenu = function () {
        that.menuVisible(!that.menuVisible())
    }
};

function initView () {
    viewModel = new ViewModel();
    viewModel.init();

    ko.applyBindings(viewModel);
}