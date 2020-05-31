var weatherList = ["test1","test2"];
var weatherDiv;
window.addEventListener('load', (event) => {
  console.log('page is fully loaded');
  weatherDiv = document.getElementById("weather");
  weatherList.forEach(createWeatherFrame);
});
createWeatherFrame = function(link) {
  var newEl = document.createElement("div");
  newEl.innerHTML = link;
  weatherDiv.appendChild(newEl);
};
