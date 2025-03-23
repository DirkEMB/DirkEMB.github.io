"use strict";

let db_notes = {};

db_notes.notes = new Map();
db_notes.notes.set("21ef6634-d61c-49b4-96a6-a872e2148082", "### hello, markdown!");
db_notes.notes.set("test", "#golly");
db_notes.converter = new showdown.Converter();
db_notes.menu = {
    addArticle: function () {
        console.log("add an article");
    }
}
window.addEventListener("load", function () {
    var original = document.getElementById("content");
    var clone = original.cloneNode(true);
    var menu = document.getElementsByTagName('menu')[0];
    menu.addEventListener('click', function (ev) {
        db_notes.menu[ev.target.dataset.function]();
    })
    db_notes.notes.forEach((el, key) => {
        console.log(el);
        let article = document.createElement("article");
        article.id = key;
        article.dataset.content = el;
        let article_title = document.createElement("h1");
        article_title.innerHTML = key;
        article_title.classList.add("ref");
        article.appendChild(article_title);
        let article_content = document.createElement("div");
        article_content.classList.add('note_content');
        article_content.innerHTML = db_notes.converter.makeHtml(el);
        article.appendChild(article_content);
        clone.appendChild(article);
    });
    original.parentNode.replaceChild(clone, original);


});



window.addEventListener("dblclick", function (ev) {
    let el = ev.target;
    while (el.tagName != 'ARTICLE' && el.tagName != 'BODY') {
        el = el.parentNode;
        console.log(el.tagName);
    }
    if (el.tagName == 'ARTICLE') {
        let div = el.getElementsByClassName('note_content')[0];
        div.innerHTML = el.dataset.content;
        div.contentEditable = 'plaintext-only';
        div.addEventListener('blur', function (ev) {
            let div = ev.target;
            console.log(div.innerHTML);
            div.parentNode.dataset.content = div.innerHTML;
            div.innerHTML = db_notes.converter.makeHtml(div.innerHTML);
            div.contentEditable = false;
        });
        div.focus();

    };
});
