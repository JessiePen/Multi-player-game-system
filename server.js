const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const fs = require("fs");
const formatMessage = require("./model/messages");

const { formatCard, checkCard, setLastColour } = require("./model/cards");

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  userAddCard,
  userDropCard,
  emptyCards,
} = require("./model/users");

const { getAllRooms, addRoom, saveRooms } = require("./model/room");
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

const botName = "Admin";
var reverse = false;

var reverseCards = [
  "green-inverse",
  "red-inverse",
  "blue-inverse",
  "yellow-inverse",
];

var banCards = ["red-ban", "green-ban", "blue-ban", "yellow-ban"];

var addTwoCards = ["green-add2", "red-add2", "blue-add2", "yellow-add2"];

//Run when client connects
io.on("connection", (socket) => {
  // socket.on("username",(username)=>{
  //   exist = users.find(user => user.username === username)
  //   console.log(exist)
  // })

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //notify the single client
    socket.emit("message", formatMessage(botName, `Welcome to ${user.room}`));
    socket.emit("username", user.username);

    //Broadcast when a user connects(other than the client itself)
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the game`)
      );

    //Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    // console.log(msg);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //Runs when client disconnects
  socket.on("disconnect", () => {
    //Notify all users
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the game`)
      );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });

  //Listen for ready users

  socket.on("userReady", () => {
    const rooms = getAllRooms();
    const user = getCurrentUser(socket.id);

    var currentRoom = rooms.filter((room) => room.roomName === user.room)[0];

    if (currentRoom !== undefined) {
      currentRoom.readyUserNum += 1;
    } else {
      currentRoom = { roomName: user.room, readyUserNum: 1 };
      addRoom(currentRoom);
    }

    console.log(currentRoom);

    if (currentRoom.length != 0) {
      if (getRoomUsers(user.room).length === currentRoom.readyUserNum) {
        io.to(user.room).emit("allReady");
      }
    }
  });

  //Create initial card in server
  socket.on("initializeCard", ({ username, room }) => {
    var user = getCurrentUser(socket.id);
    for (i = 0; i < 7; i++) {
      const card = formatCard(username);
      user = userAddCard(user.id, user.username, user.room, card);
    }
    emptyCards();
    socket.emit("outputUserCard", user);
  });

  //Listen for card to play
  socket.on("playCard", (card) => {
    const user = getCurrentUser(socket.id);

    if (checkCard(card)) {
      if (card.attribute == "add4") {
        addNextCards(4);
      }

      if (addTwoCards.indexOf(card.attribute) > -1) {
        addNextCards(2);
      }

      if (reverseCards.indexOf(card.attribute) > -1) {
        if (reverse == false) {
          reverse = true;
        } else {
          reverse = false;
        }
      }

      userDropCard(user, card);
      io.to(user.room).emit("outputCard", card);
      socket.emit("outputUserCard", user);

      // Notify the winner
      if (user.cards.length == 0) {
        socket.emit("win");

        //Notify other players
        socket.broadcast.to(user.room).emit("lose");

        //Admin announce the result
        io.to(user.room).emit(
          "message",
          formatMessage(botName, `${user.username} win!`)
        );
      } else {
        if (banCards.indexOf(card.attribute) > -1) {
          var nextUser = getNextUser(user, reverse);
          var nextNextUser = getNextUser(nextUser, reverse);
          io.to(nextNextUser.id).emit("TurnToPlay", nextNextUser);
        } else {
          var nextUser = getNextUser(user, reverse);
          io.to(nextUser.id).emit("TurnToPlay", nextUser);
        }
      }
    } else {
      socket.emit("wrongCard");
    }
  });

  //Player choose new colour
  socket.on("newColour", (colour) => {
    setLastColour(colour);
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit(
      "message",
      formatMessage(botName, `${user.username} changed colour to ${colour}`)
    );
  });

  // Game begin here
  //The first player join the room should play first
  socket.on("firstToPlay", () => {
    const user = getCurrentUser(socket.id);

    if (user.id != getRoomUsers(user.room)[0].id) {
      socket.emit("NotYourTurn");
    } else {
      socket.emit("TurnToPlay", user);
    }
  });

  socket.on("Skip", () => {
    var user = getCurrentUser(socket.id);
    const card = formatCard(user.username);
    user.cards.push(card);
    // user = userAddCard(user.id, user.username, user.room, card)
    socket.emit("outputUserCard", user);
    var nextUser = getNextUser(user, reverse);
    io.to(nextUser.id).emit("TurnToPlay", nextUser);
  });

  function addNextCards(num) {
    var user = getCurrentUser(socket.id);
    var nextUser = getNextUser(user, reverse);
    for (i = 0; i < num; i++) {
      const card = formatCard(nextUser.username);
      nextUser.cards.push(card);
    }
    io.to(nextUser.id).emit("outputUserCard", nextUser);
  }

  function getNextUser(user, rev) {
    userNum = getRoomUsers(user.room).length;
    if (rev == false) {
      var userToPlay = getRoomUsers(user.room)[getTurn(userNum, user)];
    } else {
      var userToPlay = getRoomUsers(user.room)[getReverseTurn(userNum, user)];
    }
    return userToPlay;
  }

  socket.on("broadcastPlayingUser", (user) => {
    io.to(user.room).emit("playingUser", user);
  });
});

function getTurn(userNum, currentUser) {
  var userTern = 0;
  for (i = 0; i < userNum; i++) {
    if (getRoomUsers(currentUser.room)[i].id == currentUser.id) {
      userTern = i;
    }
  }

  userTern += 1;

  if (userTern == userNum) {
    userTern = 0;
  }
  return userTern;
}

function getReverseTurn(userNum, currentUser) {
  var userTern = 0;
  for (i = 0; i < userNum; i++) {
    if (getRoomUsers(currentUser.room)[i].id == currentUser.id) {
      userTern = i;
    }
  }

  userTern -= 1;

  if (userTern < 0) {
    userTern = userNum - 1;
  }
  return userTern;
}

// Request new room data
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));

app.post("/chat", (request, response) => {
  room = request.body;
  saveRooms(room)
  response.json({
    status: "success",
    value: room.value,
    text: room.text,
  });
});

app.post("/username", (request, response) => {
  userExist = false;
  user = request.body;
  var allUsers = getRoomUsers(user.room);
  allUsers.forEach((existUser) => {
    if (existUser.username.toLowerCase() == user.username.toLowerCase()) {
      userExist = true;
    }
  });
  response.json({
    status: "success",
    exist: userExist,
  });
  // console.log(userExist)
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
