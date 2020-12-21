var weatherList = [
  {name: "Barcelona",
   link: "barcelona_spain_3128760"},
  {name: "Madrid",
   link:"madrid_spain_3117735"},
  {name: "London",
   link:"london_united-kingdom_2643743"}
];
var weatherDiv;
var weatherDD;

window.addEventListener('load', (event) => {
  weatherDiv = document.getElementById("weather");
  weatherDD = document.getElementById("zones");
  weatherList.forEach(addZone);
});

addZone = function(zone) {
  var newEl = document.createElement("option");
  newEl.value = zone.link;
  newEl.innerHTML = zone.name;
  weatherDiv.appendChild(newEl);
};
