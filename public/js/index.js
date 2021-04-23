const checkbox = document.getElementById("checkbox");
const errorElement = document.getElementById("error")

checkbox.addEventListener("click", () => {
  if (checkbox.checked == true) {
    document.getElementById("create-room").style.display = "block";
    document.getElementById("join-room").style.display = "none";
    document.getElementById("current-room").style.display = "none";
    document.getElementById("room1").disabled = "true";
    document.getElementById("room2").removeAttribute("disabled");
  } else {
    document.getElementById("create-room").style.display = "none";
    document.getElementById("join-room").style.display = "block";
    document.getElementById("current-room").style.display = "block";
    document.getElementById("room1").removeAttribute("disabled");
    document.getElementById("room2").disabled = "true";
  }
});

const create_btn = document.getElementById("create-button");

create_btn.addEventListener("click", () => {
  var roomName = document.indexform.room[1].value;
  const roomInfo = { value: `${roomName}`, text: `${roomName}` };

  console.log(roomInfo);

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roomInfo),
  };
  fetch("/chat", options).then((response) => {
    console.log(response);
  });
  // document.indexform.action = "chat.html"

});

//Fetch rooms.json file
fetch("../rooms.json")
  .then((Response) => Response.json())
  .then((rooms) => {
    const rl = document.getElementById("room1");
    rooms.forEach((room) => {
      rl.add(new Option(room.text, room.value));
    });
  });

//  Check if username is repeat
  document.indexform.addEventListener("submit", async (e) => {
  e.preventDefault()
  messages =[]
  
  var username = document.querySelector("input");
  var mySelect = document.getElementById('room1')
  var index=mySelect.selectedIndex
  var room = mySelect.options[index].value

  var user = {
    "username" : username.value,
    "room" : room
  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  };

  const response = await fetch("/username",options)
  const json = await response.json()
  console.log(json)

  if(json.exist == true){
    messages.push("Username already exists")
  }

  if(messages.length > 0){
    errorElement.innerHTML = messages.join(',')
  }

  if (json.exist != true){
    document.indexform.submit();
}
});