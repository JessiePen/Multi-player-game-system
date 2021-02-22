const users = [];
var cards =[];

//Join user to chat

function userJoin(id, username, room){

    // //Clean the  data
    // username =  username.trim().toLowerCase()

    // if(!username){
    //     return {
    //         error: 'Username is required !'
    //     }
    // }

    // //Check for existing user
    // const existingUser = users.find((user) => {
    //     return user.room === room &&  user.username === username
    // })

    // //Validate username
    // if(existingUser){
    //     return{
    //         error: 'Username is in use!'
    //     }
    // }

    //Store user
    const user = {id, username, room};
    users.push(user);
    return user;
}

// Get the current user 
function getCurrentUser(id){
    return users.find(user => user.id === id);
}

//User leaves  chat
function userLeave(id){
    const index = users.findIndex(user => user.id === id);

    if(index !== -1){
        // const test = users.splice(index,1)
        // console.log(test)
        return  users.splice(index,1)[0];
    }
}

//Get room users
function getRoomUsers(room){
    return users.filter(user => user.room === room)
}

//User add card
function userAddCard(id,username,room,card){
    cards.push(card);
    const index = users.findIndex(user => user.id === id);
    const newUser = {id, username, room, cards}

    if(index !== -1){
        users.splice(index,1,newUser)
    }

    return newUser
}

//User drop card
function userDropCard(user,card){
    //  notesToKeep = notes.filter((note) => note.title !== title)
     cardsToKeep = user.cards.filter((cardKeep) => cardKeep.id !== card.id )
     user.cards = cardsToKeep
}

function emptyCards(){
    cards=[]
}


module.exports = {
    userJoin,
    getCurrentUser,
    userLeave, 
    getRoomUsers,
    userAddCard,
    userDropCard,
    emptyCards
}