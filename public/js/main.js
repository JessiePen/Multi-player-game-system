const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//Get username and room from URL
const {username, room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
});

const socket = io();

//join chatroom
socket.emit('joinRoom',{username,room}); 

//Get room and users
socket.on('roomUsers',({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
})

//Message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;

});

//Message submit
chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    //Get message text
    const msg = e.target.elements.msg.value;

    //Emit a message to server
    socket.emit('chatMessage',msg);

    //Clear input
    e.target.elements.msg.value='';
    e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message-form');
    div.innerHTML=`<p class="meta">${message.username} <span>${message.time}</span></p>
                        <p class="text">
                        ${message.text}
                        </p>`;
    document.querySelector('.chat-sidebar-right').appendChild(div);
}

//Add room name  to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

//Add users to DOM
function outputUsers(users){
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}

//Create initial card
document.getElementById('ready-btn').addEventListener("click",()=>{
    socket.emit('initializeCard',{username,room})
    document.getElementById('ready-btn').style.display = 'none'
    document.querySelector('.chat-messages').setAttribute('style','opacity: 0.8');
})

//Get initial card from server
socket.on('outputUserCard', user => {
    outputUserCard(user)
});


//Output users' card to choose area
function outputUserCard(user){
    const cardNum = user.cards.length;
    const cardContainer = document.querySelector('.card-container')
    cardContainer.innerHTML = ``

    for(i=0;i<cardNum;i++){
        const div = document.createElement('div');
        div.className='div';
        const card=user.cards[i]
        div.classList.add('card');
        const src="/images/" + card.attribute + ".jpg"
        div.innerHTML=`<img class="cardImg" src=${src}>`;

        cardContainer.appendChild(div);
        div.addEventListener('click',() => {
            console.log(card.attribute)
            socket.emit('playCard',card)
        })
    }
}

//Output card to message area
function outputCard(card){
    const div = document.createElement('div');
    div.classList.add('message');
    const src="/images/" + card.attribute + ".jpg"
    div.innerHTML=`<p class="meta">${card.username} <span>${card.time}</span></p>
    <img class="messageCard" src=${src}>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//Listen for card user want to play
socket.on('outputCard',(card)=>{
    console.log(card.attribute);
    outputCard(card)
    chatMessages.scrollTop = chatMessages.scrollHeight;
})


