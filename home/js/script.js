var weatherList = ["test1","test2"];
window.addEventListener('load', (event) => {
  console.log('page is fully loaded');
  var weatherDiv = document.getElementById("weather");
  weatherList.forEach(function(el) {
   console.log(el); 
  });
  var newEl = document.createElement("iframe");
  weatherDiv.appendChild(newEl);
});
