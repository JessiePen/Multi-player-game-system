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
    var roomName = document.indexform.room[1].value
    const roomInfo = {value:`${roomName}`, text:`${roomName}`}

    console.log(roomInfo)

    const options = {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(roomInfo)
    }
    fetch('/index', options).then(response => {console.log(response)});
})