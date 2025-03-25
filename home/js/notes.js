"use strict";

var db_notes = {};

db_notes.notes = new Map();
db_notes.notes.set("21ef6634-d61c-49b4-96a6-a872e2148082", "### hello, markdown!");
db_notes.notes.set("test", "#golly");
db_notes.converter = new showdown.Converter();
db_notes.new_node = function (tag, nodeClass, ...nodes) {
    const node = document.createElement(tag);
    if (nodeClass) {
        node.classList.add(nodeClass)
    };
    node.append(...nodes);
    return node;
};

db_notes.menu = {
    addArticle: function () {
        let article = db_notes.new_node('article', null, db_notes.new_node('h1', 'ref', self.crypto.randomUUID()), db_notes.new_node("div", 'note_content', "new"));
        article.dataset.content = '';
        var original = document.getElementById("content");
        var clone = original.cloneNode(true);
        clone.insertBefore(article, clone.getElementsByTagName('article')[0]);
        original.parentNode.replaceChild(clone, original);

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
        article_content.addEventListener('blur', function (ev) {
            let el = ev.target;
            if (el.contentEditable && el.contentEditable == 'plaintext-only') {
                el.parentNode.dataset.content = el.innerHTML;
                el.innerHTML = db_notes.converter.makeHtml(el.innerHTML);
                el.contentEditable = false;
            }
        });
        article.appendChild(article_content);
        clone.appendChild(article);
    });
    original.parentNode.replaceChild(clone, original);


});



window.addEventListener("dblclick", function (ev) {
    let el = ev.target;
    console.log(el);
    while (el.tagName != 'ARTICLE' && el.tagName != 'BODY') {
        el = el.parentNode;
    }
    if (el.tagName == 'ARTICLE') {
        let div = el.getElementsByClassName('note_content')[0];
        div.innerHTML = el.dataset.content;
        div.contentEditable = 'plaintext-only';
        div.focus();

    };
});
