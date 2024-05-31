const socket = io();

const welcome = document.getElementById("welcome");
const form = document.querySelector("form");


const room = document.getElementById("room");
room.hidden=true;


let roomName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);  
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message",input.value,roomName, ()=>{
        addMessage(`You: ${value}`);
    });
    input.value="";
}
function handleNicknameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");
   
    socket.emit("nickname", input.value);
}
function showRoom() {
    welcome.hidden = true;
    room.hidden=false;
    const h3 = room.querySelector("h3");
    h3.innerText=`Room ${roomName}`;

    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNicknameSubmit);

}

function backendDone(msg){
    console.log(`The Backend Says: ` ,msg);
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit(
        "enter_room", 
        input.value,
        showRoom
    );
    roomName = input.value;
    input.value="";
}
form.addEventListener("submit", handleRoomSubmit);



socket.on("welcome", (user, newCount)=> {
    const h3 = room.querySelector("h3");
    h3.innerText=`Room ${roomName} (${newCount})`;
    addMessage(`${user} Joined!!`);

});


socket.on("bye",     (left, newCount)=> {
    const h3 = room.querySelector("h3");
    h3.innerText=`Room ${roomName} (${newCount})`;
    addMessage(`${left} left ㅠㅠ`);
 });
socket.on("new_message",(msg)=>{
    addMessage(msg)
});
socket.on("room_change", (rooms)=>{
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML="";
    if(rooms.length===0){
        return;
    }
    rooms.forEach(room=>{
        const li = document.createElement("li");
        li.innerText=room;
        roomList.append(li);
    })
});




















/*
const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");


const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload){
    const msg = {type, payload};
    return JSON.stringify(msg);
}

function handleOpen(){
    console.log("Connected to Server");

}

socket.addEventListener("open",handleOpen);

socket.addEventListener("message", (message) =>{
    // console.log("Just got this: ",message.data, "from the server");
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
        // console.log("New message:: ", message.data);

});
function handleSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    
    const li = document.createElement("li");
    li.innerText = `You: ${input.valㅍue}`;
    messageList.append(li);
    
    input.value ="";
    

}
function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value ="";
    
}


socket.addEventListener("close", ()=>{
    console.log("DisConnected from Server")
});




messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
*/