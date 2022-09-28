function sendUID(){
    let uid = document.querySelector('#uid')
    let xhr = new XMLHttpRequest();
    //change the url before deployment
    let url = "http://localhost:9000/api/login"; 
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var data = JSON.stringify({"UID": uid.value});
    xhr.send(data);
}

