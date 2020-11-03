
// INITIATING THE MAP 
function isIconMouseEvent(e) {
  return "placeId" in e;
}

function initMap() {
      const origin = { lat: 51.497518, lng:  -0.134912 };
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: origin,
       

      });

// SEARCH BOX GENERATOR - GOOGLE CODE
const input = document.getElementById("pac-input");
const searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
  // Bias the SearchBox results towards current map's viewport.

  let markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
searchBox.addListener("places_changed", () => {
  const places = searchBox.getPlaces();
  if (places.length == 0) {
    return;
  }
  // Clear out the old markers.
  markers.forEach((marker) => {
    marker.setMap(null);
  });
  markers = [];


  })
// INITIATE POI LISTENER 
map.addListener("click", function(event) {
placesService = new google.maps.places.PlacesService(map);
if (isIconMouseEvent(event)) {
  console.log("You clicked on place:" + event.placeId);
  
  const pid = event.placeId;

  render(placesService, pid);

  }

});
}



// FORMAT PLACE ID AND POI CLICK EVENT LISTENER 
function render(service, placeiden){
  $('button').click(function(){

    const request = {
      placeId: placeiden,
      fields: ['address_components','formatted_address','name','vicinity']
    };
          
          service.getDetails(request, callback);
          function callback(place, status) {
            let placeName = place.name;
            let placeAddress = place.formatted_address;
            console.log("here is the address: "+ placeAddress);
           if (!place.vicinity){
             prepareAltSearch(placeName, placeAddress);
           } else {
            let placeVicinity = place.vicinity;
            console.log("this is the vicinity: " + placeVicinity);
            const city = prepareVicinity (placeVicinity);
            console.log("this is the city: " + city);
            prepareSearch(placeName, city);
           }
         
          }
  
             }
            );
            }


function handleLocationError(browserHasGeolocation, infoWindow, pos) {
            infoWindow.setPosition(pos);
            infoWindow.setContent(
              browserHasGeolocation
                ? "Error: The Geolocation service failed."
                : "Error: Your browser doesn't support geolocation."
            );
            infoWindow.open(map);
          }
          
          


// functions to prepare raw place information from google api 
/// --> format for NYT fetch request URL
function prepareVicinity(vicinity){
const vicinityArray = vicinity.split(/[ ,]+/);
console.log(vicinityArray);
return vicinityArray[vicinityArray.length-1];
}
            
function prepareSearch(name, cityname){
console.log("we did a regular search");
const searchArray = name.split(/[ ,']+/);
const searchName = searchArray.join('_');
fetchURL(searchName,cityname)
}

function prepareAltSearch(name, address){
console.log("time to do an alt search");
const altSearchAddress = prepareAddressForAltSearch(address);
fetchURL(name,altSearchAddress);
  }

function prepareAddressForAltSearch(address){
const addressArray = address.split(/[',']+/);
console.log("here is the address array: " + addressArray);
const altVicinity = addressArray[0];
const altCity = addressArray[1];
const altSearchArrayRaw = [altVicinity, altCity];
return altSearchArrayRaw;
  }



// factory function to create a custom fetch request given click inputs 
function fetchURL(name, item2){
console.log(`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${name}_${item2}&sort=oldest&api-key=KtYlaYp2oCUKHAhuNPmxTfftZnAUnGbU`);
fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${name}_${item2}&sort=oldest&api-key=KtYlaYp2oCUKHAhuNPmxTfftZnAUnGbU`)
  .then(response => response.json())
  .then(responseJson => 
    displayResults(responseJson))
    }

function displayResults(responseJson){
$('#results').empty();
  // formatting note: responseJson.response.docs[i]abstract
  for(let i=0; i< 10; i++){
    if(!responseJson.response.docs[i].headline.main == false){
      console.log(responseJson.response.docs[i].headline.main);
      const yearRaw = responseJson.response.docs[i].pub_date;
      const year = yearRaw.substring(0,4);
        $('#results').append(`<p class="headline">Headline: ${responseJson.response.docs[i].headline.main}</p><p>URL: <a href="${responseJson.response.docs[i].web_url}">${responseJson.response.docs[i].web_url}</a></p><p class="year">YEAR: ${year}</p>`);
          } else if (!responseJson.response.docs[i].headline.main){
          console.log("article with no headline");
          }
        }
      }
          
