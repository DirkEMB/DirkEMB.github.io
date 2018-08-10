var root = "https://members.zipcar.com/admin/url-for-object?object_id="
var myInput, myLink, targetCheckbox
document.addEventListener("DOMContentLoaded", function(event) { 
  myInput = document.getElementById("thisID");
  myLink = document.getElementById("resultLink");
  myLink.innerHTML = root + myInput.value;
  myLink.href = myLink.innerHTML;
	
  targetCheckbox = document.getElementById("target");
  myInput.addEventListener("input", function(event) {
	  myLink.innerHTML = root + myInput.value;
	  myLink.href = myLink.innerHTML;
  });
  targetCheckbox.addEventListener("input", function(event) {
	  if (targetCheckbox.checked) {
		  myLink.target = "_blank";
	  } else {
		  myLink.target = "_self";
	  }
	  
  });
});
