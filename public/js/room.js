const fs = require("fs");
const path = require("path");

var pathFile = path.resolve(__dirname, "../rooms.json");

const saveRooms = (room) => {
  if (fs.existsSync(pathFile)) {
    var rooms = [];
    fs.readFile("./public/rooms.json", function (err, data) {
      var oldRooms = data.toString();
      rooms = JSON.parse(oldRooms);
      rooms.push(room);
      console.log(rooms);

      var str = JSON.stringify(rooms);
      fs.writeFile("./public/rooms.json", str, function (err) {
        if (err) {
          console.error(err);
        }
      });
    });
  } else {
    fs.writeFile("./public/rooms.json", JSON.stringify(room), function (err) {
      console.log(room);
      if (err) {
        console.error(err);
      }
    });
  }
};

module.exports = saveRooms;
