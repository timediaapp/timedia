function cleanse(text) {
  var element = document.createElement("p");
  element.innerText = text;
  var eltext = element.innerHTML;
  delete element;
  return eltext;
}

var chatUsers = [];

function deleteChat(chat) {
  window.dbRef.child("tichat").child(allChats[chat].slice(15)).child("usersAllowed").child(localStorage.name).set(null);
  window.dbRef.child("tichat").child(allChats[chat].slice(15)).child("usersAllowed").on("value", function (snapshot) {
    var exists = (snapshot.val() !== null);
    if (!exists) {
      window.dbRef.child("tichat").child(allChats[chat].slice(15)).set(null);
    }
  })
  delete allChats[chat];
  window.dbRef.child("tichat-chats").child(localStorage.name).set(allChats);
  window.location.reload()
}

function addUser() {
  if (chatUsers.length <= 0) {
    chatUsers.push(document.getElementById("chat").value)
    window.chat = document.getElementById("chat").value + localStorage.name;
    chat = chat.toLowerCase();
  } else {
    chatUsers.push(document.getElementById("chat").value)
    window.chat += document.getElementById("chat").value.toLowerCase();
  }
  if (chatUsers.length > 1) {
    document.getElementById("chatName").style.display = "block";
  }
  document.getElementById("usersInChat").innerHTML += '<span style="border-radius: 20px; background-color: lightgray; margin: 2px; padding: 7px 11px;">' + document.getElementById("chat").value + '</span><br><br>';
  document.getElementById("chat").value = "";
}

function getMessages() {
  document.getElementById("private-messages").innerHTML = "";
  var urlRef = window.dbRef.child("tichat").child(getQueryVariable("app")).child("messages");
  urlRef.on("value", function (snapshot) {
    snapshot.forEach(function (child) {
      var message = CryptoJS.AES.decrypt(child.val(), getQueryVariable("app")).toString(CryptoJS.enc.Utf8)
      var username = message.split("said:<br>")[0] + "said:<br>";
      var messageContent = message.split("said:<br>")[1];
      var currentHTML = document.getElementById("private-messages").innerHTML
      document.getElementById("private-messages").innerHTML = ("<div style='margin: 5px; padding: 5px 20px; display: inline-block; border-radius: 5px; background-color: lightgray;'>" + username + cleanse(messageContent) + "</div><br>" + currentHTML);
    });
  });
}

function sendMessage(message) {
  if (message !== "") {
    window.dbRef.child("tichat").child(getQueryVariable("app")).child("messages").push(CryptoJS.AES.encrypt("<b>" + localStorage.name + "</b>" + " said:" + "<br>" + message, getQueryVariable("app")) + "");
    document.getElementById("message-input").value = "";
    document.getElementById("private-messages").innerHTML = " ";
    getMessages();
  }
}

var sortAlphabets = function (text) {
  return text.split("").sort().join("");
};

function showCreate() {
  document.getElementById('create-chat').style.display = 'block';
}

var allChats = {}
function loadChats() {
  document.getElementById("tichat-chats").innerHTML = "";
  window.dbRef.child("tichat-chats").child(localStorage.name).on("value", function (child) {
    child.forEach(function (snapshot) {
      var buttonChat = document.createElement("button");
      buttonChat.className = "tiri-shortcuts-button";
      buttonChat.onclick = function () {
        window.open(snapshot.val());
      }
      buttonChat.innerHTML = snapshot.key;
      allChats[snapshot.key] = snapshot.val();
      document.getElementById("tichat-chats").appendChild(buttonChat);
      document.getElementById("tichat-chats").innerHTML += "<br>";
    })
  })
}

var chatName;
function joinChat() {
  if (chatUsers.length <= 1) {
    chatName = localStorage.name + "'s chat with " + chatUsers[0]
  } else {
    chatName = document.getElementById("chatName").value;
  }
  var chatPassword1 = sortAlphabets(window.chat);
  var chatPassword = MD5(chatPassword1);
  chatUsers.push(localStorage.name);
  document.getElementById("tichat-chats").innerHTML = "";
  for (var i = 0; i < chatUsers.length; i++) {
    window.dbRef.child("tichat").child(chatPassword).child("usersAllowed").child(chatUsers[i]).set(true);
    window.dbRef.child("tichat-chats").child(chatUsers[i]).child(chatName).set("index.html?app=" + chatPassword);
  }
}

if (getQueryVariable("app") == 2) {
  loadChats();
}
if (window.location !== "index.html" && getQueryVariable("app") !== false && getQueryVariable("app").length > 7) {
  document.title = "TiChat - TiMedia"
  document.getElementById("iChat-input").style.display = "none";
  document.getElementById("iChat-messages").style.display = "none";
  document.getElementById("pming-home").style.display = "";
  window.addEventListener('DOMContentLoaded', function () {
    setInterval(getMessages, 1000);
  }, false);
}
