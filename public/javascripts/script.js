$(document).ready(function(){
    const ticketMasterApiKey = "IoUptOnWtiIUKp6lNP8RET0crIirQd0T";
    const googleMapsApiKey = "AIzaSyCOzjrDoygKdBVPmnzbjQ17zvw49Nbofvg";
    const googleDirectionsApiKey = "AIzaSyD0H1DmmVSQsRAnDiBtOaNowbFy5y3j1m8";

    var submitButton = $("#submit");
    submitButton.on("click", submit);

    const contentRow1 = $("#contentRow1");
    const contentRow2 = $("#contentRow2");
    const contentRow3 = $("#contentRow3");
    const contentRow4 = $("#contentRow4");
    const contentRowArr = [contentRow1, contentRow2, contentRow3, contentRow4,]

    const options = {
        enableHighAccuracy: true,
        timeout: 1000*30,
        maximumAge: 1000 * 60
    }

    function success(pos) {
        let coordinates = pos.coords;
        let userLat = coordinates.latitude
        let userLng = coordinates.longitude
        let userCoordinates = [userLat, userLng];
        console.log(userCoordinates);
        return userCoordinates;
    };

    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    };

    navigator.geolocation.getCurrentPosition(success, error, options);

    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsMap;
    function initMap(venueLat, venueLng) {
        var city = new google.maps.LatLng(venueLat, venueLng);
        var mapOptions = {
            zoom: 8,
            center: city
        }
        directionsMap = new google.maps.Map(document.getElementById('modalRowRight'), mapOptions);
        directionsDisplay.setMap(directionsMap);
    }


    function calcRoute(venueLat, venueLng, userCoordinates) {
        console.log(userCoordinates);
        var venueLocation = new google.maps.LatLng(venueLat, venueLng);
        // test value
        var start = new google.maps.LatLng(userCoordinates[0], userCoordinates[1]);
        // var chicago = new google.maps.LatLng(41.850033, -87.6500523);
        var request = {
        origin: chicago,
        destination: venueLocation,
        travelMode: 'DRIVING'
        };
        directionsService.route(request, function(result, status) {
        if (status == 'OK') {
            console.log("OK!!!!!")
            directionsDisplay.setDirections(result);
        }
        });
    }



    function submit (event) {
        event.preventDefault;
        const keyword = $("#entertain").val().trim();
        const locationInput = $("#location").val().trim();
        const appendDiv = $("#append");
        const infoButton = $("<button class='infoBtn'>")

        // Empties the content rows so repeated clicks do not append repeated Data
        for(var i = 0; i < contentRowArr.length; i++) {
            contentRowArr[i].empty();
        }

        console.log(keyword);
        console.log(locationInput);

        // URL works. Use (localhost:8080)
        // http-server -c-1     <-- starts server on localhost

        $.ajax({
            url: "https://app.ticketmaster.com/discovery/v2/events.json?countryCode=US&city=Charlotte&apikey=IoUptOnWtiIUKp6lNP8RET0crIirQd0T",
            method: "GET",
            dataType: "json"
        }).done(function(response){
            console.log(response);
            const sortedDate = [];
            const ball = '<i class="fas fa-basketball-ball"></i>';
            const music = '<i class="fas fa-music"></i>';
            const comedy = '<i class="fab fa-jenkins"></i>';

            // sort responses by Date of event
            for(var i = 0; i < 12; i++) {
                sortedDate.push(response._embedded.events[i]);
                console.log(sortedDate);
            }

            sortedDate.sort(function(a,b) {
                return new Date(a.dates.start.localDate) - new Date(b.dates.start.localDate);
            })


            for(var i = 0; i < sortedDate.length; i++) {
                const responseSeg = sortedDate[i].classifications[0].segment.name; 
                var favicon;
                switch (responseSeg) {
                    case "Sports":
                        favicon = ball;
                        break;
                    case "Music":
                        favicon = music;
                        break;
                    default:
                        favicon = comedy;
                }


                let newDiv = $("<div class='col-sm-4 card inline top'>");
                let newImg = $("<img class='card-img-top center img-fluid rounded'src=" + sortedDate[i].images[9].url + " alt=Image />");
                let cardHeader = $("<h5 class='card-title text-center'>" + sortedDate[i].name + "</h5>");
                let venue = $("<p class='card-text text-center'> Venue: " + sortedDate[i]._embedded.venues[0].name + "</p>"); 
                let dateTime =  $("<p class='card-text text-center'> Date: " + sortedDate[i].dates.start.localDate + "</p>");
                let newButton = $("<button class='btn btn-success center info' value=" + i + "> More Info  " + favicon + "</button");


                newDiv.append(newImg)
                    .append(cardHeader)
                    .append(venue)
                    .append(dateTime)
                    .append(newButton);
                
                if(i < 3) {
                    contentRow1.append(newDiv);
                } else if(i > 2 && i < 6) {
                    contentRow2.append(newDiv);
                } else if(i > 5 && i < 9) {
                    contentRow3.append(newDiv);
                } else {
                    contentRow4.append(newDiv);
                }
            
            }

            // Modal functionality
            const modal = $("#modal");
            const modalRowLeft = $("#modalRowLeft");
            const modalRowRight = $("#modalRowRight");
            const closeBtn = $("#close");


            // When the user clicks on the button, open the modal
            $(".info").on("click", modalCall);

            function modalCall() {
                modal.css("display", "block");
                let index = this.value;
                let modalImage = $("<img class='img-fluid rounded' src=" + sortedDate[index].images[9].url + " alt=Image />");
                let venueLat = parseFloat(sortedDate[index]._embedded.venues[0].location.latitude);
                let venueLng = parseFloat(sortedDate[index]._embedded.venues[0].location.longitude);
                console.log(typeof(venueLat));
                console.log(venueLat);
                modalRowLeft.append(modalImage);
                calcRoute(venueLat, venueLng, success());
                modalRowRight.append(initMap(venueLat, venueLng));
                // calcRoute(venueLat, venueLng, userCoordinates);
                

                closeBtn.on("click", function() {
                    modal.css("display", "none");
                    modalRowLeft.empty();
                    modalRowRight.empty();
                });
    
            }

        }).fail(function(error){
            alert("Error");
        })
    }

})
