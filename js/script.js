window.addEventListener("load" , function () {
    addPics (document.getElementById('fotos'));
    });

const addPics = function(ctr) {
    var myUrls = [];
    for (i=1; i < 144; i++) {
        myUrls.push(`https://www.vincentmunier.com/wp-content/uploads/2025/12/CDF${i.toString().padStart(3,'0')}.jpg`);
    }
    myUrls.forEach(my_pic_url => {
       let myImg = document.createElement('img');
       myImg.src = my_pic_url;
       ctr.appendChild(myImg);
    });
};
