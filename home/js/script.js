
window.addEventListener('load', (event) => {
  console.log('page is fully loaded');
  var weatherDiv = document.getElementById("weather");
  console.log(weatherDiv);
  var newEl = document.createElement("div");
  weatherDiv.appendChild(newEl);
});
