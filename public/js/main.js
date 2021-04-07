const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

//Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

//join chatroom
socket.emit("joinRoom", { username, room });

//Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//Message from server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //Get message text
  const msg = e.target.elements.msg.value;

  //Emit a message to server
  socket.emit("chatMessage", msg);

  //Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message-form");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
                        <p class="text">
                        ${message.text}
                        </p>`;
  document.querySelector(".chat-sidebar-right").appendChild(div);
}

//Add room name  to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

//Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
    `;
}

//User ready
document.getElementById("ready-btn").addEventListener("click", () => {
  socket.emit("userReady");
  document.getElementById("ready-btn").style.display = "none";
  document.querySelector(
    ".card-container"
  ).innerHTML = `<div class="ready"><h2>Waiting for other players ...</h2></div>`;

  // socket.emit('initializeCard',{username,room})
  // document.getElementById('ready-btn').style.display = 'none'
  // document.querySelector('.chat-messages').setAttribute('style','opacity: 0.8');
});

//Listen for the ready signal
socket.on("allReady", () => {
  socket.emit("initializeCard", { username, room });
  socket.emit("firstToPlay");
  document
    .querySelector(".chat-messages")
    .setAttribute("style", "opacity: 0.8");
});

//Get initial card from server
socket.on("outputUserCard", (user) => {
  outputUserCard(user);
});

//Output user card in hand to card area
function outputUserCard(user) {
  const cardNum = user.cards.length;
  const cardContainer = document.querySelector(".card-container");
  cardContainer.innerHTML = ``;

  for (i = 0; i < cardNum; i++) {
    const div = document.createElement("div");
    div.className = "div";
    const card = user.cards[i];
    div.classList.add("card");
    const src = "/images/" + card.attribute + ".jpg";
    div.innerHTML = `<img class="cardImg" src=${src}>`;

    cardContainer.appendChild(div);
    div.addEventListener("click", () => {
      console.log(card.attribute);
      socket.emit("playCard", card);
      // socket.emit('nextTurn')
    });
  }

  const cover = document.createElement("div");
  cover.classList.add("card-container-cover");
  cover.id = "cover";
  cardContainer.appendChild(cover);
}

//After a player playing an allowed card, begin next turn
// socket.on('readyNextTurn',() => {
//   socket.emit('nextTurn')
// })

//Listen for card user want to play
socket.on("outputCard", (card) => {
  console.log(card.attribute);
  outputCard(card);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Output card to message area
function outputCard(card) {
  const div = document.createElement("div");
  div.classList.add("message");
  const src = "/images/" + card.attribute + ".jpg";
  div.innerHTML = `<p class="meta">${card.username} <span>${card.time}</span></p>
  <img class="messageCard" src=${src}>`;
  document.querySelector(".chat-messages").appendChild(div);
}

socket.on("TurnToPlay", (user) => {
  console.log("turn to play");
  console.log(document.getElementById("cover"));
  document.getElementById("cover").style.display = "none";
});

//When the card obeys the rules
socket.on("wrongCard", () => {
  console.log("You are not allowed to play");
  document.getElementById("wrong-card").style.display = "block";
  
  setTimeout(() => {
    document.getElementById("wrong-card").style.display = "none";
}, 1500);

});
