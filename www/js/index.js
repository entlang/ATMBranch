var currentPosition;
var h = 0;
var CIRCLE_RADIUS = 250;
var ZOOM_LEVEL = 12;
var posObject = null;
var infowindow;

$(document).on("deviceready", getLocation(), false);

function getLocation() {
    if (navigator.geolocation) {
        function success(pos) {
            currentPosition = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            callRestAPI(pos, null, false);
        }
        function fail(error) {
            console.log(error);
            $("#popupNotSupported").popup("open");
        }
        navigator.geolocation.getCurrentPosition(success, fail, {
            maximumAge: 1000 * 60 * 10,
            enableHighAccuracy: true,
            timeout: 60 * 1000 * 2
        });
    }
    else {
        $("#popupFailed").popup("open");
    }
}

var map;
var allMarkers = [];
function drawATMs(locations, currentLocation) {
    console.log("entered draw atm");
    var latlng = new google.maps.LatLng(currentLocation.coords.latitude, currentLocation.coords.longitude);
    var myOptions = {
        zoom: ZOOM_LEVEL,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $('#map-canvas').css('height', getRealContentHeight() + 'px');
    map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
    map.setCenter(latlng);

    google.maps.event.addListener(map, 'dragend', function() {
        callRestAPI(null, map.getCenter(), true);
    });

    infowindow = new google.maps.InfoWindow();

    var circle = new google.maps.Circle({
        center: latlng,
        radius: CIRCLE_RADIUS,
        map: map,
        scale: 3,
        fillColor: '#1865A8',
        fillOpacity: 0.4,
        strokeColor: '#A7D4F0',
        strokeOpacity: 0.5,
        strokeWeight: 0.5
    });
    
    var marker, i;
    for (i = 0; i < locations.length; i++) {
        var customIcon;
        customIcon = getImagePath(locations[i]);
        var customImage = {
            url: customIcon,
            size: new google.maps.Size(45, 45)
        }
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[i]["latitude"], locations[i]["longitude"]),
            map: map,
            title: locations[i]["name"],
            icon: customImage
        });
        allMarkers.push({type: locations[i]["serviceProviderTypeName"], marker: marker});

        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infowindow.setContent(locations[i]["name"]);
                infowindow.open(map, marker);
            };
        })(marker, i));
    }
}

function showATMsMarkers() {
    for (var i = 0; i < allMarkers.length; i++) {
        if (allMarkers[i]["type"].toLowerCase() == "atm") {
            allMarkers[i]["marker"].setVisible(true);
        }
        else {
            allMarkers[i]["marker"].setVisible(false);
        }
    }
    markerState = "atm";
}

function showBranchMarkers() {
    for (var i = 0; i < allMarkers.length; i++) {
        if (allMarkers[i]["type"].toLowerCase() == "branch") {
            allMarkers[i]["marker"].setVisible(true);
        }
        else {
            allMarkers[i]["marker"].setVisible(false);
        }
    }
    markerState = "branch";
}

function showAllMarkers() {
    for (var i = 0; i < allMarkers.length; i++) {
        allMarkers[i]["marker"].setVisible(true);
    }
    markerState = "all";
}

function getImagePath(location) {
    if (String(location["brandCode"]).toLowerCase() != "stg") {
        if (String(location["serviceProviderTypeName"]).toLowerCase() == "atm") {
            return "img/atm.png";
        }
        else {
            return "img/branch_atm.png";
        }
    }
    else {
        return "img/stgimg.png";
    }
}

function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var radlon1 = Math.PI * lon1 / 180;
    var radlon2 = Math.PI * lon2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
        dist = dist * 1.609344;
    }
    if (unit == "N") {
        dist = dist * 0.8684;
    }
    return parseFloat(dist).toFixed(1) + "km";
}

function getRealContentHeight() {
    var header = $.mobile.activePage.find("div[data-role='header']:visible");
    var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
    var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
    var viewport_height = $(window).height();

    var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
    if ((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
        content_height -= (content.outerHeight() - content.height());
    }
    return content_height;
}

function getCustomRadiusForZoom(zoomLevel) {
//    return Math.floor(CIRCLE_RADIUS/zoomLevel);
}