function postContactForm(){
    var xmlhttp = new XMLHttpRequest();
    var url = "https://getsimpleform.com/messages/ajax?form_api_token=2cf6bd15735e916486a2660d1143d342";
    var data = new FormData();

    data.append("name", document.getElementById("name").value);
    data.append("email", document.getElementById("email").value);
    data.append("title", document.getElementById("title").value);
    data.append("message", document.getElementById("message").value);

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            toggleNotification('success', 'Contact Form Successfully Posted');
        } else {
            toggleNotification('error', 'Contact Form Failed To Post');
        }
    }

    xmlhttp.open("GET", url, true);
    xmlhttp.send(data);

    console.log(xmlhttp);
}

function toggleNotification(type, msg) {
    var notificationDiv = document.getElementById("notification");

    notificationDiv.style.display = "block";
    notificationDiv.innerHTML = msg;
    notificationDiv.className = "alert-box " + type;
}