var weatherList = [
  "barcelona_spain_3128760",
  "madrid_spain_3117735",
  "london_united-kingdom_2643743",
  "paris_france_2988507",
  "toulouse_france_2972315",
  "milan_italy_3173435",
  "brussels_belgium_2800866",
  "ghent_belgium_2797656",
  "amsterdam_netherlands_2759794"
];
var weatherDiv;
getQueryVariable = function(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
};
window.addEventListener('load', (event) => {
  console.log(getQueryVariable("full"));
  weatherDiv = document.getElementById("weather");
  weatherList.forEach(createWeatherFrame);
});
createWeatherFrame = function(link) {
  var newEl = document.createElement("iframe");
  var mySource = "https://www.meteoblue.com/en/weather/widget/daily/";	  
  mySource += link;
  mySource += "?geoloc=fixed&days=5&tempunit=CELSIUS&windunit=KILOMETER_PER_HOUR&precipunit=MILLIMETER&coloured=coloured&pictoicon=0&pictoicon=1&maxtemperature=0&maxtemperature=1&mintemperature=0&mintemperature=1&windspeed=0&windspeed=1&windgust=0&winddirection=0&winddirection=1&uv=0&humidity=0&precipitation=0&precipitation=1&precipitationprobability=0&precipitationprobability=1&spot=0&pressure=0&layout=light";
  newEl.classList.add("weatherFrame");
  newEl.src=mySource;
  weatherDiv.appendChild(newEl);
};
