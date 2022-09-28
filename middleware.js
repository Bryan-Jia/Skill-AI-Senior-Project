function sendUID(){
    let uid = document.querySelector('#uid')
    let xhr = new XMLHttpRequest();
    //change the url before deployment
    let url = "http://192.168.230.200:5000"; 
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var data = JSON.stringify({"UID": uid.value});
    xhr.send(data);
}

function sendResult(){
    let xhr = new XMLHttpRequest();
    let url = "http://192.168.230.200:5000";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

}
