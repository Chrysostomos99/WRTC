//requires
const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);




//var dl  = require('delivery');
//var fs  = require('fs');
const port = process.env.PORT || 3000;
var rows = 10;
var myArray=[]
var rooms=[]
const users = {}
var numRoom=-1;
var nameUser;
var newArr=[];

// expand to have the correct amount or rows
for( var i=0; i<rows; i++ ) {
  myArray.push( [] );
  rooms.push( [] );

}




// express routing
app.use(express.static('public'));


app.get('/upload', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
// signaling
io.on('connection', function (socket) {

//file to servel recieve and send 
socket.on('file-sent-to-server', function (msg) {
    console.log('received file from' + msg.username);
    socket.emit('bcast-file', msg); //exclude sender
    socket.broadcast.emit('chat-message-file', msg); //exclude sender
    console.log('bcast sent file with details'  + '----' + msg.room);
})


//chat messege to server 
    socket.on('send-chat-message', (message , myName, room) => {
      socket.broadcast.emit('chat-message', { message: message, name: myName ,room:room})
    });


    socket.on('disconnect', () => {
    console.log('user disconnected');})

    
    socket.on('create or join', function (room,name,id) {
        numRoom=room;
        nameUser=name;
        rooms[room].push([id,name])
       
        var myRoom = io.sockets.adapter.rooms[room] || { length: 0 };
        var numClients = myRoom.length;

        myArray[room].push(name)
        socket.emit('name', name);
        if (numClients == 0) {
            socket.join(room);
            socket.emit('created', room,myArray[room]);
            socket.emit('participants_list', room,myArray[room]);

        } else if (numClients <= 4) {
            socket.join(room);
            socket.emit('joined', room,myArray[room]);
            socket.emit('participants_list', room,myArray[room]);
            socket.broadcast.to(room).emit('participants_list', room,myArray[room]);

        } else {
            socket.emit('full', room,myArray[room]);
        }
//disconnection 
    socket.on('disconnect',()=> {

        let b=myArray[numRoom].indexOf(name)
        delete myArray[numRoom][b]
        newArr = myArray[numRoom].filter((a) => a);
        myArray[numRoom]=newArr.slice();
        socket.broadcast.to(numRoom).emit('participants_list', numRoom,myArray[numRoom]);
        console.log(myArray[numRoom]);
        socket.broadcast.emit('user-disconnected', nameUser,numRoom)
    })
    });

    socket.on('ready', function (room,name){
        socket.broadcast.to(room).emit('ready');
    });

    socket.on('candidate', function (event){
        socket.broadcast.to(event.room).emit('candidate', event);
    });

    socket.on('offer', function(event){
        socket.broadcast.to(event.room).emit('offer',event.sdp);
    });

    socket.on('answer', function(event){
        socket.broadcast.to(event.room).emit('answer',event.sdp);
    });

});

// listener
http.listen(port || 3000, function () {
    console.log('listening on', port);
});
