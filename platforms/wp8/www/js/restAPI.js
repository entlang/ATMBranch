var serverResponse = [];
var serverResponseComplete = []
var selectedIndex;
var tempArr;
var helperArray;
var listState = "all";
var markerState = "all";

function callRestAPI(pos, center, isDraged) {
    var url;
    if (isDraged) {
        url = 'http://www.westpac.com.au/locator/LocateUsSearchService/findByLocation?latitude=' + center.lat() + '&longitude=' + center.lng() + '&countryCodes=au';
    }
    else {
        url = 'http://www.westpac.com.au/locator/LocateUsSearchService/findByLocation?latitude=' + pos.coords.latitude + '&longitude=' + pos.coords.longitude + '&countryCodes=au';
    }

    $.ajax({
//        url: 'mock.json',
        url:url,
        dataType: 'json',
        timeout: 120000,
        success: function(response) {
            console.log("data loaded");
            helperArray = [];
            tempArr = [];
            var object = response["list"];
            var len = object.length;
            for (var j = 0; j < len; j++) {
                var newObj = object[j];
                if (!isDraged) {
                    serverResponse.push(newObj);
                    serverResponseComplete.push(newObj);
                }
                else {
                    tempArr.push(newObj);
                    helperArray.push(newObj);
                }

            }
            if (!isDraged) {
                drawATMs(serverResponse, pos);
            }
            else {
                incopeNewATMs(tempArr);
            }

        },
        error: function(error) {
            console.log("data is not loaded");
        }
    });
}

function incopeNewATMs(tempArr) {
    for (var i = 0; i < tempArr.length; i++) {
        serverResponseComplete.forEach(function(item) {
            if ((item["latitude"] === tempArr[i]["latitude"]) && (item["longitude"] === tempArr[i]["longitude"])) {
                helperArray.splice(helperArray.indexOf(tempArr[i]), 1);
                return;
            }
        });
    }

    if (helperArray.length > 0) {
        updateMarkers(helperArray);
        for (var j = 0; j < helperArray.length; j++) {
            serverResponseComplete.push(helperArray[j]);
        }
    }
}

function updateMarkers(results) {
    for (i = 0; i < results.length; i++) {
        var customIcon;
        customIcon = getImagePath(results[i]);
        var customImage = {
            url: customIcon,
            size: new google.maps.Size(45, 45)
        }
        var marker;

        marker = new google.maps.Marker({
            position: new google.maps.LatLng(results[i]["latitude"], results[i]["longitude"]),
            map: map,
            title: results[i]["name"],
            icon: customImage
        });

        if (results[i]["serviceProviderTypeName"].toLowerCase() == "atm") {
            if (markerState == "branch") {
                marker.setVisible(false);
            }
        }
        else if (markerState == "atm") {
            marker.setVisible(false);
        }

        allMarkers.push({type: results[i]["serviceProviderTypeName"], marker: marker});

        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infowindow.setContent(results[i]["name"]);
                infowindow.open(map, marker);
            };
        })(marker, i));
    }

}

function showList() {
    $.mobile.changePage("listPage.html");
}

function openSearch() {
    $.mobile.changePage("searchPage.html");
}

function returnBack() {
    history.back();
   
    return false;
}

function calculateTime(openingTime, id) {
    var isNonStop = false;
    var hoursNotAvailable = false;

    if (openingTime[0]["openTime"] == "") {
        hoursNotAvailable = true;
        $("#" + id).append('<p class="subElements">Hours not available.</p>');
    }
    else if (openingTime[06]["closeTime"] == "11:59pm") {
        isNonStop = true;
        $("#" + id).append('<p class="subElements">Available 24 hours a day, seven days a week.</p>');
    }

    if (!hoursNotAvailable && !isNonStop) {
        if (openingTime[0]["openTime"] !== "") {
            $("#" + id).append('<p class="subElements"><span class="labelWidth">Monday:</span>' + openingTime[0]["openTime"] + " - " + openingTime[0]["closeTime"] + '</p>');
        }
        else {
            $("#" + id).append('<label><span class="labelWidth">Monday:</span>Closed</label>');
        }
        if (openingTime[1]["openTime"] !== "") {
            $("#" + id).append('<p class="subElements"><span class="labelWidth">Tuesday:</span>' + openingTime[1]["openTime"] + " - " + openingTime[1]["closeTime"] + '</p>');
        }
        else {
            $("#" + id).append('<p class="subElements"><span class="labelWidth">Tuesday:</span>Closed</p>');
        }
        if (openingTime[2]["openTime"] !== "") {
            $("#" + id).append('<p class="subElements"><span class="labelWidth">Wednesday:</span>' + openingTime[2]["openTime"] + " - " + openingTime[2]["closeTime"] + '</p>');
        }
        else {
            $("#" + id).append('<p class="subElements"><span class="labelWidth">Wednesday:</span>Closed</p>');
        }
        if (openingTime[3]["openTime"] !== "") {
            $("#" + id).append('<p class="subElements"><span class="labelWidth">Thursday:</span>' + openingTime[3]["openTime"] + " - " + openingTime[3]["closeTime"] + '</p>');
        }
        else {
            $("#" + id).append('<p class="subElements"><span class="labelWidth">Thursday:</span>Closed</p>');
        }
        if (openingTime[4]["openTime"] !== "") {
            $("#" + id).append('<p class="subElements"><span class="labelWidth">Friday:</span>' + openingTime[4]["openTime"] + " - " + openingTime[4]["closeTime"] + '</p>');
        }
        else {
            $("#" + id).append('<p class="subElements"><span class="labelWidth">Friday:</span>Closed</p>');
        }
        if (openingTime[5]["openTime"] !== "") {
            $("#" + id).append('<p class="subElements"><span class="labelWidth">Satyrday:</span>' + openingTime[5]["openTime"] + " - " + openingTime[5]["closeTime"] + '</p>');
        }
        else {
            $("#" + id).append('<p class="subElements"><span class="labelWidth">Saturday:</span>Closed</p>');
        }
        if (openingTime[6]["openTime"] !== "") {
            $("#" + id).append('<p class="subElements"><span class="labelWidth">Sunday:</span>' + openingTime[6]["openTime"] + " - " + openingTime[6]["closeTime"] + '</p>');
        }
        else {
            $("#" + id).append('<p class="subElements"><span class="labelWidth">Sunday:</span>Closed</p>');
        }
    }

}