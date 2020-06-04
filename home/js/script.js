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
window.addEventListener('load', (event) => {
  console.log('page is fully loaded');
  weatherDiv = document.getElementById("weather");
  weatherList.forEach(createWeatherFrame);
});
createWeatherFrame = function(link) {
  var newEl = document.createElement("iframe");
  var mySource = "https://www.meteoblue.com/en/weather/widget/three/";
  mySource += link;
  mySource += "?geoloc=fixed&nocurrent=0&noforecast=0&days=4&tempunit=CELSIUS&windunit=KILOMETER_PER_HOUR&layout=image";
  newEl.classList.add("weatherFrame");
  newEl.src=mySource;
  weatherDiv.appendChild(newEl);
};
