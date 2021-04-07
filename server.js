const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const fs =require('fs');
const saveRooms = require('./public/js/room')
const formatMessage = require('./utils/messages')
// const formatCard = require('./utils/cards')
// const checkCard = require('./utils/cards')
// const checkCard = require('./utils/cards')
// const checkCard = require('./utils/cards')
const {formatCard,checkCard} = require('./utils/cards')

const {userJoin,getCurrentUser,userLeave,getRoomUsers, userAddCard, userDropCard, emptyCards,getTurnUser} = require('./utils/users');
const { getAllRooms, addRoom } = require('./utils/room');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname,'public')));

const botName = 'Admin';

//Run when client connects
io.on('connection', socket => {

    socket.on('joinRoom',({username,room})=>{

        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        //notify the single client
    socket.emit('message',formatMessage(botName, `Welcome to ${user.room}`));

    //Broadcast when a user connects(other than the client itself)
    socket.broadcast.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has joined the game`));


    //Send users and room info
    io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getRoomUsers(user.room)
    });
    });

    //Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        // console.log(msg);
        io.to(user.room).emit('message', formatMessage(user.username,msg));
    });

    //Runs when client disconnects
    socket.on('disconnect', () => {
        //Notify all users
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit(
                'message',
                formatMessage(botName, `${user.username} has left the game`)
                );

            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    });

    //Listen for ready users 

    socket.on('userReady', () => {
        const rooms = getAllRooms()
        const user = getCurrentUser(socket.id)

        var currentRoom = rooms.filter(room =>  room.roomName === user.room)[0]

        if(currentRoom !== undefined){
            currentRoom.readyUserNum += 1
        }else{
            currentRoom = {roomName: user.room, readyUserNum: 1}
            addRoom(currentRoom)
        }

        console.log(currentRoom)

        if(currentRoom.length != 0){
            if(getRoomUsers(user.room).length === currentRoom.readyUserNum){
                io.to(user.room).emit('allReady')
            }
        }
    })
    

    //Create initial card in server
    socket.on('initializeCard', ({username,room}) => {
        var user = getCurrentUser(socket.id);
        for(i=0;i<7;i++){
            const card = formatCard(username)
            user = userAddCard(user.id, user.username, user.room, card)
        }
        emptyCards()
        socket.emit('outputUserCard',user);
    })

    //Listen for card to play
    socket.on('playCard', (card) => {
        const user = getCurrentUser(socket.id);

        // console.log(checkCard(card))

        if(checkCard(card)){
          userDropCard(user,card)
          io.to(user.room).emit('outputCard', card);
          socket.emit('outputUserCard', user)
          // socket.emit('readyNextTurn')
          nextTurn()
        }else{
          socket.emit('wrongCard')
        }
    })


    // Game begin here

    //The first player join the room should play first
    socket.on('firstToPlay',()=>{
      const user = getCurrentUser(socket.id)
      
      if (user.id != getRoomUsers(user.room)[0].id){
        socket.emit('NotYourTurn')
      }else{
        socket.emit('TurnToPlay',user)
      }
    })

    // Choose the next player
    // socket.on('nextTurn',() => {
    //   const user = getCurrentUser(socket.id)
    //   userNum = getRoomUsers(user.room).length
    //   // var userToPlay = getTurn(userNum)
    //   var userToPlay = getRoomUsers(user.room)[getTurn(userNum,user)]        

    //   io.to(userToPlay.id).emit('TurnToPlay',userToPlay);

    // })

    function nextTurn(){
      const user = getCurrentUser(socket.id)
      userNum = getRoomUsers(user.room).length
      // var userToPlay = getTurn(userNum)
      var userToPlay = getRoomUsers(user.room)[getTurn(userNum,user)]        

      io.to(userToPlay.id).emit('TurnToPlay',userToPlay);
    }


})

function getTurn(userNum,currentUser){
  var userTern=0.
  for(i=0;i<userNum;i++){
    if(getRoomUsers(currentUser.room)[i].id == currentUser.id){
      userTern = i
      }
  }

  userTern += 1

  if(userTern == userNum){
    userTern = 0
    }

  return userTern
}


// Request new room data
var bodyParser = require("body-parser");
const { text } = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json({limit:'1mb'}))
app.post('/index',(request,response) => {
    console.log(request.body)
    room = request.body;
    saveRooms(room)
    response.json({
      status:'success',
      value: room.value,
      text: room.text 
    })
  })

const PORT = 4000

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));