
window.addEventListener('load', (event) => {
  console.log('page is fully loaded');
  var weatherDiv = document.querySelector("weather");
  var newEl = document.createElement("div");
  weatherDiv.appendChild(newEl);
});
