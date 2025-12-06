async function fetchBlob(url) {
    const response = await fetch(url, {
        mode: 'no-cors'
    });

    // Here is the significant part 
    // reading the stream as a blob instead of json
    return response.blob();
};
console.log(fetchBlob("https://desk.zoho.eu/api/v1/tickets/158901000016550648/threads/158901000016688879/attachments/158901000016688900/content?orgId=20095873452"));
