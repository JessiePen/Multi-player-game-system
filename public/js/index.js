const checkbox = document.getElementById("checkbox")

checkbox.addEventListener("click",() => {
    if(checkbox.checked == true){
        document.getElementById("create-room").style.display="block"
        document.getElementById("join-room").style.display="none"
        document.getElementById("current-room").style.display="none"
        document.getElementById("room1").disabled = "true"
        document.getElementById("room2").removeAttribute("disabled")

    }else{
        document.getElementById("create-room").style.display="none"
        document.getElementById("join-room").style.display="block"
        document.getElementById("current-room").style.display="block"
        document.getElementById("room1").removeAttribute("disabled")
        document.getElementById("room2").disabled = "true"
    }
})

const createbtn =  document.getElementById("create-button")

createbtn.addEventListener("click",() => {
    // var obj = document.getElementById("room1");
    var roomname = document.indexform.room[1].value
    // obj.options[obj.options.length] = new Option(`${roomname}`, `${roomname}`);
    const roomJSON = JSON.stringify({value:`${roomname}`, text:`${roomname}`})

    const options = {
        method: 'POST',
        header: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(roomJSON)
    }
    fetch('/roomname', options);
})