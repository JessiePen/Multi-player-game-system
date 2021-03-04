const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages')
const formatCard = require('./utils/cards')

const {userJoin,getCurrentUser,userLeave,getRoomUsers, userAddCard, userDropCard, emptyCards} = require('./utils/users');
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
        userDropCard(user,card)
        io.to(user.room).emit('outputCard', card);
        socket.emit('outputUserCard', user)
    })
})

// Request new room data
var bodyParser = require("body-parser");
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json({limit:'1mb'}))
app.post('/index',(request,response) => {
    console.log(request.body)
})

const PORT = 4000

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));