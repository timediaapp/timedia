// Initialize Firebase
var config = {
  apiKey: "AIzaSyDCkpqnNu3zZyCwwIoiodwUVKqZEDvsJG0",
  authDomain: "tishare-754f4.firebaseapp.com",
  databaseURL: "https://tishare-754f4.firebaseio.com",
  projectId: "tishare-754f4",
  storageBucket: "tishare-754f4.appspot.com",
  messagingSenderId: "567999502232"
};
firebase.initializeApp(config);
window.dbRef = firebase.database().ref();

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return (false);
}

function chooseFile() {
  window.selector = document.createElement("input");
  selector.type = "file";
  selector.setAttribute("onchange", "convertFile()");
  selector.click();
}

function convertFile() {
  var file = selector.files[0];
  var reader = new FileReader();

  reader.addEventListener("load", function () {
     window.dbRef.child("transfer").child(getQueryVariable("id")).set(reader.result);
     document.getElementById("upload").remove();
     document.getElementById("success").style = "font-size: 1500%; color: #00a87b;";
  }, false);

  if (file) {
    reader.readAsDataURL(file);
  }
}

if (getQueryVariable("id") == false) {
  var code = Math.floor((Math.random() * 1000000000000) + 1);
  document.getElementById("upload").remove();
  window.dbRef.child("transfer").child(code).on("value", snapValue, errorLoading);
  
  var qr = window.qr = new QRious({
    element: document.getElementById("qrcode"),
    size: 250,
    value: "https://proudloyaltier.github.io/timedia/tishare/?id=" + code
  });
}

function snapValue(data) {
  if (data.val() !== null) {
    document.getElementById("qrcode").remove();
    if (data.val().includes("data:image")) {
      document.getElementById("image").src = data.val();
    } else if (data.val().includes("data:video")) {
      document.getElementById("image").remove();
      document.getElementById("video").style = "";
      document.getElementById("video").src = data.val();
    } else if (data.val().includes("data:audio")) {
      document.getElementById("image").remove();
      document.getElementById("video").remove();
      document.getElementById("audio").style = "";
      document.getElementById("audio").src = data.val();
    }
    window.dbRef.child("transfer").child(code).set(null);
  }
}

function errorLoading(err) {
  alert(err);
}
