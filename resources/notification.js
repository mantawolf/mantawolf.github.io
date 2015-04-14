function postContactForm(){
    var xmlhttp = new XMLHttpRequest();
    var url = "https://getsimpleform.com/messages/ajax?form_api_token=2cf6bd15735e916486a2660d1143d342";
    var data = new FormData();

    url += "&name=" + document.getElementById("name").value;
    url += "&email=" + document.getElementById("email").value;
    url += "&subject=" + document.getElementById("subject").value;
    url += "&message=" + document.getElementById("message").value;

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

    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("subject").value = "";
    document.getElementById("message").value = "";

    notificationDiv.innerHTML = msg;
    notificationDiv.className = "alert-box " + type;
    notificationDiv.style.display = "block";
}
