/**
 * Global variable the Booker object is instantiated on
 */
var booker;

/**
 * Callback function for the inital load of the google maps api.
 */
function initMap() {
    var startCoords = {lat: 25.088999644, lng: 55.15166606};

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17,
        center: startCoords,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
        }
    });

    booker = new Booker(map);
}

function mobilecheck() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

var isMobile = mobilecheck();

/**
 *
 * @param {google.maps.Map} The map object
 * @constructor
 */
function Booker(map) {
    // The google.maps.Map
    this.map = map;
    /* The array of marker created on the map*/
    this.markers = [];
    /* The calculated route distance */
    this.rideDistance = null;
    /* The calculated route duration */
    this.rideDuration = null;
    /* True if a ride has been booked */
    this.rideBooked = false;
    /* Api key for acessing the google maps api */
    this.apiKey = 'AIzaSyBAAwbcguEMvnDbXchR-xKd6pH_l4YKetI';

    /* Api key for acessing the google maps api */
    this.geocoder = new google.maps.Geocoder;
    this.distanceService = new google.maps.DistanceMatrixService();
    this.placeServices = new google.maps.places.PlacesService(map);


    /*  Init Google Maps Services objects */
    this.directionsDisplay = new google.maps.DirectionsRenderer({
        polylineOptions: {
            // strokeOpacity:0,
            strokeWeight:5,
            strokeColor:'#60bc50',
            zIndex:2
        }
    });

    this.directionsDisplay1A = new google.maps.DirectionsRenderer({
        polylineOptions: {
            strokeWeight:9,
            strokeColor:'#037500',
            zIndex:1
        }
    });

    this.directionsDisplay2 = new google.maps.DirectionsRenderer({
        polylineOptions: {
            strokeColor: "white",
            strokeWeight:5,
            zIndex:3
        },
        preserveViewport: true

    });

    this.directionsService = new google.maps.DirectionsService();

    this.directionsDisplay.setMap(map);
    this.directionsDisplay1A.setMap(map);
    this.directionsDisplay2.setMap(map);

    this.originPlaceId = null;
    this.originPlaceName = null;

    this.destinationPlaceId = null;
    this.destinationPlaceName = null;

    this.directionsResponse = null;

    this.travelMode = 'DRIVING';

    this.originInput = document.getElementById('origin-input');
    this.destinationInput = document.getElementById('destination-input');

    this.distanceValuesContainer = document.getElementById('distanceValues');


    this.originAutocomplete = new google.maps.places.Autocomplete(
        this.originInput, {placeIdOnly: true});

    this.destinationAutocomplete = new google.maps.places.Autocomplete(
        this.destinationInput, {placeIdOnly: true});
    //
    this.setupPlaceChangedListener(this.originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(this.destinationAutocomplete, 'DEST');

    this.addListeners();

    // this.loadCurrentLocation();

    this.originInput.value = 'Lake Terrace - Dubai - United Arab Emirates'
    this.destinationInput.value = 'Marina Mall - Dubai - United Arab Emirates'

    this.routeAnimation = new AnimateRoute(map, this.directionsDisplay2);

    this.initRoutes();

}

/**
 * Init routes on page load
 */
Booker.prototype.initRoutes = function(){
    this.makeGeocodeRequest(this.originInput.value).then(function (response) {
        this.handleGeocodeRequest('origin-input', this.originInput.value, response)
    }.bind(this));
    this.makeGeocodeRequest(this.destinationInput.value).then(function (response) {
        this.handleGeocodeRequest('destination-input', this.destinationInput.value, response)
    }.bind(this));
};

/**
 * DOM Event Listeners
 */
Booker.prototype.addListeners = function () {

    this.originInput.addEventListener("keyup", function (e) {
        this.handleInputKeyup(e)
    }.bind(this));

    this.destinationInput.addEventListener("keyup", function (e) {
        this.handleInputKeyup(e)
    }.bind(this));

    this.originInput.addEventListener("focusout", function (e) {
        this.handleInputFocusOut(e)
    }.bind(this));

    this.destinationInput.addEventListener("focusout", function (e) {
        this.handleInputFocusOut(e)
    }.bind(this));

    document.getElementById('clear-origin').addEventListener("click", function (e) {
        this.clearInput(e)
    }.bind(this));

    document.getElementById('clear-destination').addEventListener("click", function (e) {
        this.clearInput(e)
    }.bind(this))
};

/**
 * Clear the input values
 * @param {Event} the click event on the clear input icon
 */
Booker.prototype.clearInput = function (e) {


    var id = e.target.closest('.input-block__form-control-clear').id;
    var input;
    if (id === 'clear-origin') {
        this.originInput.value = "";
        input = "origin-input"
    } else if (id === 'clear-destination') {
        this.destinationInput.value = "";
        input = "destination-input"
    }
    this.directionsDisplay2.setDirections({routes: []});
    this.handleLocationClear(input)
};



/**
 * Detect when the 'Enter' key is pressed on an input, and
 * blur the element, to trigger the focusout event
 * @param {Event} the keyup event
 */
Booker.prototype.handleInputKeyup = function (e) {
    event.preventDefault();
    if (event.keyCode === 13) {
        e.target.blur()
    }
};

/**
 * Handle when user focuses out of input
 * @param {Event} the focusout event
 */
Booker.prototype.handleInputFocusOut = function (e) {

    var id = e.target.id;
    var autocompleteInstance, mode;

    if (id === 'origin-input') {
        autocompleteInstance = this.originAutocomplete;
        mode = 'ORIG'
    } else if (id === 'destination-input') {
        autocompleteInstance = this.destinationAutocomplete;
        mode = 'DESTINATION'
    }

    this.handleLocationChange(id);

};



/**
 * Show/hide an element
 * @param {HTMLElement} the element
 * @param {Boolean} true to show
 */
Booker.prototype.showElement = function (element, show) {
    if (show) {
        element.classList.remove('hide')
    } else {
        element.classList.add('hide')
    }
};
/**
 * Convert a place name to a query string to be used in an xml http request
 * @param {String} the place name
 * @returns {String} the modified string
 */
Booker.prototype.convertPlaceNameToQueryString = function (place) {
    var placeArray = place.split(' - ');
    var placeQueryString = placeArray.map(function (item) {
        return item.split(' ').join('+')
    }).join(',');

    return placeQueryString
};


/**
 * Add listeners to the autocomplete instances
 * @param {google.maps.places.Autocomplete} the autocomplete instance
 */
Booker.prototype.setupPlaceChangedListener = function (autocompleteInstance) {
    autocompleteInstance.bindTo('bounds', this.map);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var geolocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var circle = new google.maps.Circle({
                center: geolocation,
                radius: position.coords.accuracy
            });
            var bounds = circle.getBounds()
            autocompleteInstance.setBounds(circle.getBounds());
            this.bounds = bounds
        }.bind(this));
    }

};

/**
 * Handle when an input location is clear
 * @param {String} the input id
 */
Booker.prototype.handleLocationClear = function (id) {

    this.routeAnimation.clearRouteAnimation();
    this.directionsDisplay.setDirections({routes: []});
    this.directionsDisplay1A.setDirections({routes: []});


    if (id === 'origin-input') {
        this.originPlaceName = null;
        this.originPlaceId = null;
    } else if (id === 'destination-input') {
        this.destinationPlaceName = null;
        this.destinationPlaceId = null;
    }

    var placeId = this.originPlaceId || this.destinationPlaceId;

    if (placeId) {
        var request = {
            placeId: placeId
        };
        this.placeServices.getDetails(request, this.placeServicesGetDetailsCallback.bind(this))
    } else {
        this.clearMarkers();
    }
};

/**
 * Handle when the location is changed
 * @param id
 */
Booker.prototype.handleLocationChange = function (id) {

    var input;

    if (id === 'origin-input') {
        input = this.originInput;
    } else if (id === 'destination-input') {
        input = this.destinationInput;
    }

    var place = input.value;

    if (place === "") {
        this.handleLocationClear(id)
    } else {
        this.makeGeocodeRequest(place).then(function (response) {
            this.handleGeocodeRequest(id, place, response)
        }.bind(this));
    }

};

/**
 * Handle a Geocode Request
 * @param {String} the input element if
 * @param {String} the searched for place
 * @param {Object} the response from the Geocode request
 */
Booker.prototype.handleGeocodeRequest = function (id, place, response) {
    response = JSON.parse(response);

    if (response.status === "ZERO_RESULTS") {
        return;
    }

    var placeId = response.results[0].place_id;

    if (id === 'origin-input') {
        this.originPlaceId = placeId;
        this.originPlaceName = place;
    } else if (id === 'destination-input') {
        this.destinationPlaceId = placeId;
        this.destinationPlaceName = place;
    }
    if (this.originPlaceId && this.destinationPlaceId) {
        this.drawRoute();
    } else {
        var request = {
            placeId: placeId
        };
        this.placeServices.getDetails(request, this.placeServicesGetDetailsCallback.bind(this))
    }

};

/**
 * Callback for completeion of a placeServices request.
 * @param {Object} the request response
 * @param {Object} the request status
 */
Booker.prototype.placeServicesGetDetailsCallback = function (results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        this.drawMarkerForPlaceId(results)
    }
};

/**
 * Draw a marker on the map for a specified place id.
 * @param results
 */
Booker.prototype.drawMarkerForPlaceId = function (results) {
    this.placeDetails = results;

    this.clearMarkers();

    if (!this.originPlaceId || !this.destinationPlaceId) {
        var marker = new google.maps.Marker({
            map: this.map,
            // icon: 'img/flag.svg',
            place: {
                placeId: results.place_id,
                location: results.geometry.location,

            }
        });
        var latLng = marker.getPosition(); // returns LatLng object
        var latitude = results.geometry.location.lat();
        var longitude = results.geometry.location.lng();

        this.centerMap(latitude, longitude);

        this.markers.push(marker);

    }
};

/**
 * Clear the markers from the map
 */
Booker.prototype.clearMarkers = function () {
    for (var i = 0; i < this.markers.length; i++) {
        this.markers[i].setMap(null);
    }
    this.markers.length = 0;
};

/**
 * Draw the route on the map
 */
Booker.prototype.drawRoute = function () {

    if (!this.originPlaceId || !this.destinationPlaceId) {
        return;
    }

    this.clearMarkers();

    var request = {
        origin: {'placeId': this.originPlaceId},
        destination: {'placeId': this.destinationPlaceId},
        travelMode: this.travelMode
    };

    this.directionsService.route(request, function (response, status) {
        if (status === 'OK') {
            this.routeAnimation.clearRouteAnimation();
            this.directionsResponse = response;
            this.directionsDisplay.setDirections(response);
            this.directionsDisplay1A.setDirections(response);

            if(!isMobile){
                setTimeout(function(){
                    this.routeAnimation.animate(this.directionsResponse);
                }.bind(this), 500);
            }
        } else {
            this.alert('Cannot create route between these points');
        }
    }.bind(this));
};

/**
 * Load the users current location
 */
Booker.prototype.loadCurrentLocation = function () {
    this.originInput.disabled = true;
    this.destinationInput.disabled = true;
    this.originInput.placeholder = 'Loading current location ...';
    document.getElementById('clear-origin').style.backgroundColor = 'transparent'
    document.getElementById('clear-destination').style.backgroundColor = 'transparent'

    navigator.geolocation.getCurrentPosition(this.getCurrentPositionSuccess.bind(this), this.getCurrentPositionError.bind(this));
};

/**
 * Center the map around a latitude and longitude
 * @param {Number} the latitude
 * @param {Number} the longitude
 */
Booker.prototype.centerMap = function (lat, lng) {
    var location = new google.maps.LatLng(lat, lng);
    this.map.setCenter(location)
};

/**
 * Callback for successful getCurrentPosition request
 * @param {Object} the response
 */
Booker.prototype.getCurrentPositionSuccess = function (position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    this.centerMap(latitude, longitude);

    var geocoder = this.geocoder;
    this.getPlaceName(geocoder, latitude, longitude);
};

/**
 * Callback for failed getCurrentPosition request
 */
Booker.prototype.getCurrentPositionError = function () {
    alert("Could not get current location")
    this.originInput.disabled = false;
    this.destinationInput.disabled = false;
    this.originInput.placeholder = 'From ...';
    document.getElementById('clear-origin').style.backgroundColor = 'white'
    document.getElementById('clear-destination').style.backgroundColor = 'white'

};
/**
 * Get the Place Name via lat and long coordinates
 * @param {google.maps.Geocoder} the geocoder instance
 * @param {Number} latitude
 * @param {Number}longitude
 */
Booker.prototype.getPlaceName = function (geocoder, latitude, longitude) {
    var latlng = {lat: parseFloat(latitude), lng: parseFloat(longitude)};
    geocoder.geocode({'location': latlng}, function (results, status) {
        if (status === 'OK') {
            if (results[0]) {
                this.updateToInputWithCurrentLocation(results)
            } else {
                this.alert('No results found.')
            }
        } else {
            this.alert('No results found.');
        }
    }.bind(this));
};


/**
 * Updat the input with the place details
 * @param {Object} the place details
 */
Booker.prototype.updateToInputWithCurrentLocation = function (placeDetails) {
    this.originInput.disabled = false;
    this.destinationInput.disabled = false;
    this.originInput.placeholder = 'From ...';
    document.getElementById('clear-origin').style.backgroundColor = 'white'
    document.getElementById('clear-destination').style.backgroundColor = 'white'

    this.originPlaceId = placeDetails[0].place_id;

    var currentLocation = placeDetails[0].formatted_address;
    this.originPlaceName = currentLocation;
    document.getElementById('origin-input').value = currentLocation;

    this.makeGeocodeRequest(currentLocation).then(function (response) {
        this.handleGeocodeRequest('origin-input', currentLocation, response)
    }.bind(this));

};

/**
 * Create a XML HTTP request
 * @param {String} the method e.g 'GET', 'POST'
 * @param {String} url
 * @returns {Promise} the response
 */

Booker.prototype.makeRequest = function (method, url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
};

/**
 * Create the query url for a geocde request and make the request
 * @param {String} the place address
 * @returns {Promise} the request object
 */
Booker.prototype.makeGeocodeRequest = function (address) {
    var baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json?';
    var query = 'address=' + this.convertPlaceNameToQueryString(address);
    var key = '&key=' + this.apiKey;

    var url = baseUrl + query + key;

    return this.makeRequest('GET', url)
};

