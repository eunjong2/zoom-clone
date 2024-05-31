import express from "express";
// import WebSocket from "ws";
import http from "http";
// import SocketIO from "socket.io"
import {Server} from "socket.io"
import {instrument} from "@socket.io/admin-ui"



// import { WebSocketServer } from "ws";


const app = express();
//pug로 view engin을 설정
app.set('view engine', "pug");
//express template 지정
app.set("views", __dirname + "/views");
//static 작업 필요 즉, public url을 생성해 유저에게 파일 공유
app.use("/public", express.static(__dirname + "/public"));
//home.pug를 render해주는 route handler 정의
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log('Listening on http://localhost:3000');
//http websockt  서버를 모두 작동하기 위한 설정
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer,  {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true
    }
});
instrument(wsServer, {
    auth: false,
    // mode: "development",
  });
// const wsServer = SocketIO(httpServer);

function publicRooms() {
    const {
         sockets: { 
            adapter: { sids, rooms },
         }, 
    } = wsServer;
    const publicRooms=[];
    rooms.forEach((_, key)=> {
        if(sids.get(key) === undefined){
            publicRooms.push(key)
        }
    });
    return publicRooms;
}
    // const sids = wsServer.sockets.adapter.sids;
    // const rooms =wsServer.socket.adapter.romms;

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}
wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anonymous";
    socket.onAny((event) => {
        // console.log(wsServer.sockets.adapter);
        console.log(`Socket Event:${event}`);
    });
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        //메세지를 하나의 socket에다가 보냄
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        //메세지를 모든 소켓에게 보냄
        wsServer.sockets.emit("room_change",publicRooms());

    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) =>
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1) 
        );
    
    });
    socket.on("disconnect", ()=>{
        wsServer.sockets.emit("room_change",publicRooms());
    });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
        done();
    });
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));


});









// const wss = new WebSocket.Server({ server });
// function handleConnection (socket){
//     console.log(socket)
// }

// function onSocketClose(){
//     console.log("Disconnected from the browser");
// }

// const sockets=[];

// wss.on("connection", (socket)=> {
//     sockets.push(socket);
//     console.log("Connected to Browser");
//     socket["nickname"] = "Anonymous"; 
//     socket.on("close", onSocketClose);
//     socket.on("message", (message)=>{
//         const messageString = message.toString('utf8');
//         const parsed = JSON.parse(messageString);

//         switch(parsed.type){
//             case "new_message":
//                 sockets.forEach(aSocket =>
//                      aSocket.send(`${socket.nickname}: ${parsed.payload}`)
//                     );
//             case "nickname" :
//                 socket["nickname"] = parsed.payload;
//                 // consol   e.log(parsed.payload);
//         }
//     });


//     // console.log(socket);
// });


httpServer.listen(3000, handleListen);
// app.listen(3000)
