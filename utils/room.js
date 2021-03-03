const allRooms = []

function getAllRooms(){
    return allRooms
}

function addRoom(room){
    allRooms.push(room)
}


module.exports = {
    getAllRooms,
    addRoom
}