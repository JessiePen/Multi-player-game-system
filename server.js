const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages')
const formatCard = require('./utils/cards')
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users')

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
                formatMessage(botName, `${user.username} has left the chat`)
                );

            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    });

    //Create initial card in server
    socket.on('createCard', ({username,room}) => {
        for(i=0;i<7;i++){
            socket.emit('initializeCard',formatCard(username));            
        }
    })
})

// Request new room data
app.use(require("body-parser").json())
app.use(require("body-parser").urlencoded({ extended: true }))

app.use(express.json({limit:'1mb'}))
app.post('/roomName',(request,response) => {
    console.log(request.body)
})

const PORT = 4000

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));