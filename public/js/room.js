fs = require('fs')

const createbtn =  document.getElementById("create-button")

createbtn.addEventListener("click",() => {
    // var obj = document.getElementById("room1");
    var roomname = document.indexform.room[1].value
    // obj.options[obj.options.length] = new Option(`${roomname}`, `${roomname}`);
    const roomJSON = JSON.stringify({value:`${roomname}`, text:`${roomname}`})
    fs.writeFileSync('../notes.json', roomJSON)
})