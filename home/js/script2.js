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
var weatherFrame;
var timeTable;

window.addEventListener('load', (event) => {
  weatherDiv = document.getElementById("weather");
  weatherDD = document.getElementById("zones");
  weatherFrame = document.getElementById("weatherFrame");
  timeTable = document.getElementById("timeTable");
  weatherDD.addEventListener('change', updateZone);
  weatherList.forEach(addZone);
  updateZone();
  updateTime();
  mytime=setTimeout(updateTime,30000);
  
});

updateTime = function() {
  for (var i = 0, row; row = timeTable.rows[i]; i++) {
    var myZone = row.cells[1].innerHTML;
    var myTime = moment().tz(myZone).format("HH:mm");
    row.cells[2].innerHTML = myTime;
   }  
};

addZone = function(zone) {
  var newEl = document.createElement("option");
  newEl.value = zone.link;
  newEl.innerHTML = zone.name;
  weatherDD.appendChild(newEl);
};

updateZone = function() {
  var mySource = "https://www.meteoblue.com/en/weather/widget/daily/;"
  mySource += weatherDD.value;
  mySource += "?geoloc=fixed&days=5&tempunit=CELSIUS&windunit=KILOMETER_PER_HOUR&precipunit=MILLIMETER&coloured=coloured&pictoicon=0&pictoicon=1&maxtemperature=0&maxtemperature=1&mintemperature=0&mintemperature=1&windspeed=0&windspeed=1&windgust=0&winddirection=0&winddirection=1&uv=0&humidity=0&precipitation=0&precipitation=1&precipitationprobability=0&precipitationprobability=1&spot=0&pressure=0&layout=light";
  weatherFrame.src = mySource;
};
