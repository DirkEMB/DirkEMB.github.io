var weatherList = ["test1","test2"];
var weatherDiv;
window.addEventListener('load', (event) => {
  console.log('page is fully loaded');
  weatherDiv = document.getElementById("weather");
  weatherList.forEach(createWeatherFrame);
});
createWeatherFrame = function(link) {
  var newEl = document.createElement("iframe");
  newEl.classList.add("weatherFrame");
  newEl.src="https://www.google.com";
  weatherDiv.appendChild(newEl);
};
