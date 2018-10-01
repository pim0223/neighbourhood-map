var ViewModel = function () {

    // Initialize the map
    this.init = function () {
        this.map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: 51.704655, lng: 5.315574},
                zoom: 13
            });
    }
};

function initMap () {
    viewModel = new ViewModel();
    ko.applyBindings(viewModel);
    viewModel.init()
}