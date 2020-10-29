const nytapi = "yourNYTAPI";

function isIconMouseEvent(e) {
  return "placeId" in e;
}

function initMap() {
      const origin = { lat: 51.497518, lng:  -0.134912 };
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: origin,
      });
    
      placesService = new google.maps.places.PlacesService(map);
      map.addListener("click", function (event){
        if (isIconMouseEvent(event)) {
          console.log("You clicked on place:" + event.placeId);
          
          const pid = event.placeId;
          
          const request = {
            placeId: event.placeId,
            fields: ['address_components','formatted_address','name','vicinity']
          };
          
          placesService.getDetails(request, callback);
          function callback(place, status) {
            let placeName = place.name;
            let placeAddress = place.formatted_address;
            console.log("here is the address: "+ placeAddress);
           // console.log("name: " + placeName + " address: "+ placeAddress + " vicinity: "+ placeVicinity); 
           if (!place.vicinity){
             prepareAltSearch(placeName, placeAddress);
           } else {
            let placeVicinity = place.vicinity;
            console.log("this is the vicinity: " + placeVicinity);
            const city = prepareVicinity (placeVicinity);
            console.log("this is the city: " + city);
            prepareSearch(placeName, placeAddress, city);
           }
         
          }
  
             }
            })


            let infoWindow;

            infoWindow = new google.maps.InfoWindow();
            const locationButton = document.createElement("button");
            locationButton.textContent = "Pan to Current Location";
            locationButton.classList.add("custom-map-control-button");
            map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
            locationButton.addEventListener("click", () => {
              // Try HTML5 geolocation.
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const pos = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                    };
                    infoWindow.setPosition(pos);
                    infoWindow.setContent("Location found.");
                    infoWindow.open(map);
                    map.setCenter(pos);
                  },
                  () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                  }
                );
              } else {
                // Browser doesn't support Geolocation
                handleLocationError(false, infoWindow, map.getCenter());
              }
            });
          
          
          function handleLocationError(browserHasGeolocation, infoWindow, pos) {
            infoWindow.setPosition(pos);
            infoWindow.setContent(
              browserHasGeolocation
                ? "Error: The Geolocation service failed."
                : "Error: Your browser doesn't support geolocation."
            );
            infoWindow.open(map);
          }
          
          







          }

            function prepareVicinity(vicinity){
             const vicinityArray = vicinity.split(/[ ,]+/);
              console.log(vicinityArray);
              return vicinityArray[vicinityArray.length-1];

            }
            
            function prepareSearch(name, address,cityname){
              console.log("we did a regular search");
              const searchArray = name.split(/[ ,']+/);
              const searchName = searchArray.join('_');
              console.log("this is the search name:" + searchName);
              console.log(`http://api.nytimes.com/svc/search/v2/articlesearch.json?q=${searchName}_${cityname}&sort=newest&api-key=${nytapi}`);
              fetch(`http://api.nytimes.com/svc/search/v2/articlesearch.json?q=${name}_${cityname}&sort=newest&api-key=${nytapi}`)
              .then(response => response.json())
              .then(responseJson => 
                displayResults(responseJson))
              //.catch(error => alert('Something went wrong. Try again later.'))

            }

            function prepareAltSearch(name, address){
              console.log("time to do an alt search");
              const altSearchArray = prepareAddress(address);
              console.log("here is the alt search array: "+ altSearchArray);
              const altSearch = altSearchArray.join('_');
              fetch(`http://api.nytimes.com/svc/search/v2/articlesearch.json?q=${altSearch}&sort=newest&api-key=${nytapi}`)
              .then(response => response.json())
              .then(responseJson => 
                displayResults(responseJson))


            }

            function prepareAddress(address){
              const addressArray = address.split(/[',']+/);
              console.log("here is the address array: " + addressArray);
              const altVicinity = addressArray[0];
              const altCity = addressArray[1];
              const altSearchArrayRaw = [altVicinity, altCity];
              return altSearchArrayRaw;
            }

            function displayResults(responseJson){
              $('#results').empty();
              // formatting note: responseJson.response.docs[i]abstract
              for(let i=0; i< 10; i++){
                if(!responseJson.response.docs[i].headline.main == false){
                  
                  console.log(responseJson.response.docs[i].headline.main);
                  const yearRaw = responseJson.response.docs[i].pub_date;
                  const year = yearRaw.substring(0,4);
                $('#results').append(`<p>Headline: ${responseJson.response.docs[i].headline.main}</p>`);
                $('#results').append(`<p>URL: ${responseJson.response.docs[i].web_url}</p>`);
                $('#results').append(`<p>YEAR: ${year}</p>`);
              } else if (!responseJson.response.docs[i].headline.main){
                console.log("article with no headline");
              }
            }
          }
            // on click:
           


            // for the address_components return, if you wanted to access the address that way:
            //here are some ways to do that:
                /*if (place[i].types.indexOf("locality") > -1) {
                  var locality = place[i].long_name;
                 results.push(locality);
                console.log(results);
            } else if (array[i].types.indexOf("route") > -1){
             results.push({"route":array[i].long_name});}
            // console.log("we have a route:" + array[i].types);
           else if (place.address_components[i].types.indexOf("administrative_area_level_2") > -1) {
             const aa2 = place.address_components[i].long_name;
             placeArray.push(aa2); */
           