const fs = require('fs')

const saveRooms = (room) => {
    const dataJSON = JSON.stringify(room)
    fs.writeFileSync('./public/rooms.json',dataJSON)
}

module.exports = saveRooms