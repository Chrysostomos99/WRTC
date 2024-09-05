// getting dom elements
var divInner1 = document.getElementById("inner1");
var divChatContainer = document.getElementById("chatContainer");
var divSelectRoom = document.getElementById("selectRoom");
var divConsultingRoom = document.getElementById("consultingRoom");
var inputRoomNumber = document.getElementById("roomNumber");
var btnGoRoom = document.getElementById("goRoom");
var localVideo = document.getElementById("localVideo");
var remoteVideo = document.getElementById("remoteVideo");
var inputUername = document.getElementById("username");
var participants = document.getElementById("part");
var btn = document.getElementById("goPart");
var mute = document.getElementById("mute");
var cam = document.getElementById("camera");
var disc = document.getElementById("hungup");

const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

var fileInput = document.getElementById('fileInput');



var myName;
var names=[];

//room,socket id,name
var roomNumber;
var localStream;
var remoteStream;
var rtcPeerConnection;
var iceServers = {
    'iceServers': [
        { 'urls': 'stun:stun.services.mozilla.com' },
        { 'urls': 'stun:stun.l.google.com:19302' }
    ]
}

var streamConstraints = { audio: true, video: true };
var isCaller;

// Let's do this
var socket = io();


//starting button
btnGoRoom.onclick = function () {
    if (inputRoomNumber.value === '') {
        alert("Please type a room number")
    } else {
        roomNumber = inputRoomNumber.value;
        username = inputUername.value;
        socket.emit('create or join', roomNumber,username,socket.id);
        myName=username;
        var x=document.getElementById('title');
        var y=document.getElementById('roonumber');
        x.innerHTML= username;
        y.innerHTML= "Room: "+roomNumber;

        divInner1.style = "display: none !important;";
        divConsultingRoom.style = "display: block;";
        divChatContainer.style = "display: block;";
    }
};


socket.emit('new-user', nm=>{
  const name = nm;


})

//message recieved
socket.on('chat-message', data => {
    //console.log(roomNumber+"   "+data.room)
    if (roomNumber==data.room) {

        const datetime = new Date().toLocaleString();
        var html_response = '<div class="d-flex justify-content-start mb-10"><div class="d-flex flex-column align-items-start"><div class="d-flex align-items-center mb-2"><div class="symbol symbol-35px symbol-circle"><!-- img --></div><div class="ms-3"><span class="fs-5 fw-bolder text-gray-900 me-1">'+ data.name +'</a><span class="text-muted fs-7 mb-1">'+ datetime +'</span></div></div><div class="p-5 rounded bg-light-info text-dark fw-bold mw-lg-400px text-start" data-kt-element="message-text">'+ data.message +'</div></div></div>';
        appendMessage(html_response);
    }
})
//file recieved
socket.on('chat-message-file', msg => {
    if (roomNumber==msg.room) {
        const datetime = new Date().toLocaleString()
        message ='<div class="d-flex justify-content-start mb-10"><div class="d-flex flex-column align-items-start"><div class="d-flex align-items-center mb-2"><span class="text-muted fs-7 mb-1">'+ datetime +'</span><span class="fs-5 fw-bolder text-gray-900 ms-1">'+ msg.username +'</a></div><div class="symbol symbol-35px symbol-circle"><!-- img --></div></div><div class="p-5 rounded bg-light-info text-dark fw-bold mw-lg-400px text-start" data-kt-element="message-text">  <p><img width="200" src="'+msg.file+'" /></p> </div></div></div>';
      
        appendMessage(message)
    }
})

socket.on('user-connected', (name,room) => {
    if (roomNumber==room) {
        appendMessage(`${name} connected`)
    }
})


socket.on('user-disconnected', name => {
    socket.emit("disconnect",name)
  appendMessage(`${name} disconnected`)
})

socket.on('created', function (room) {
    navigator.mediaDevices.getUserMedia(streamConstraints).then(function (stream) {
        localStream = stream;
        localVideo.srcObject = stream;
        isCaller = true;
    }).catch(function (err) {
        console.log('An error ocurred when accessing media devices', err);
    });
});


//
socket.on('joined', function (room,nameList) {
    names=nameList
    navigator.mediaDevices.getUserMedia(streamConstraints).then(function (stream) {
        localStream = stream;
        localVideo.srcObject = stream;
        socket.emit('ready', roomNumber,username);
    }).catch(function (err) {
        console.log('An error ocurred when accessing media devices', err);
    });
});


//list of participants
socket.on('participants_list', function (room,nameList) {

if (roomNumber==room) {
    var contactsList = document.getElementById('contactsList');
    contactsList.innerHTML = "";
      nameList.forEach(function (item) {
        var symbol = item.charAt(0);

        var contact = '<div class="d-flex align-items-center"><div class="symbol symbol-45px symbol-circle"><span class="symbol-label bg-light-danger text-danger fs-6 fw-bolder">'+ symbol.toUpperCase() +'</span><div class="symbol-badge bg-success start-100 top-100 border-4 h-15px w-15px ms-n2 mt-n2"></div></div><div class="ms-5"><span class="fs-5 fw-bolder text-gray-900 mb-2">'+ item +'</span></div></div></div><div class="separator separator-dashed d-none">';
        var contact_html = document.createElement('div');
        contact_html.classList.add('d-flex');
        contact_html.classList.add('flex-stack');
        contact_html.classList.add('py-4');
        contact_html.innerHTML = contact
        contactsList.append(contact_html);
      });
    }
});

socket.on('candidate', function (event) {
    var candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate: event.candidate
    });
    rtcPeerConnection.addIceCandidate(candidate);
});

socket.on('ready', function () {
    if (isCaller) {
        rtcPeerConnection = new RTCPeerConnection(iceServers);
        rtcPeerConnection.onicecandidate = onIceCandidate;
        rtcPeerConnection.ontrack = onAddStream;
        rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream);
        rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream);
        rtcPeerConnection.createOffer()
            .then(sessionDescription => {
                rtcPeerConnection.setLocalDescription(sessionDescription);
                socket.emit('offer', {
                    type: 'offer',
                    sdp: sessionDescription,
                    room: roomNumber
                });
            })
            .catch(error => {
                console.log(error)
            })
    }
});

socket.on('offer', function (event) {
    if (!isCaller) {
        rtcPeerConnection = new RTCPeerConnection(iceServers);
        rtcPeerConnection.onicecandidate = onIceCandidate;
        rtcPeerConnection.ontrack = onAddStream;
        rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream);
        rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream);
        rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
        rtcPeerConnection.createAnswer()
            .then(sessionDescription => {
                rtcPeerConnection.setLocalDescription(sessionDescription);
                socket.emit('answer', {
                    type: 'answer',
                    sdp: sessionDescription,
                    room: roomNumber
                });
            })
            .catch(error => {
                console.log(error)
            })
    }
});

socket.on('answer', function (event) {
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
})

//for messeges SEND button
messageForm.addEventListener('submit', e => {
  e.preventDefault()
  const message = messageInput.value
  const datetime = new Date().toLocaleString()
  const html_message = '<div class="d-flex justify-content-end mb-10"><div class="d-flex flex-column align-items-end"><div class="d-flex align-items-center mb-2"><div class="me-3"><span class="text-muted fs-7 mb-1">'+ datetime +'</span><span class="fs-5 fw-bolder text-gray-900 ms-1">'+ myName +'</a></div><div class="symbol symbol-35px symbol-circle"><!-- img --></div></div><div class="p-5 rounded bg-light-primary text-dark fw-bold mw-lg-400px text-end" data-kt-element="message-text">'+ message +'</div></div></div>';
  appendMessage(html_message);
  socket.emit('send-chat-message', message,myName,roomNumber)
  messageInput.value = ''
})

//for files BROWSE button
socket.on('bcast-file', function (msg) {
  console.log('Received a file from ' + msg.username +' which is named ' + msg.fileName)
  const datetime = new Date().toLocaleString()
  message ='<div class="d-flex justify-content-end mb-10"><div class="d-flex flex-column align-items-start"><div class="d-flex align-items-center mb-2"><div class="me-3"><span class="text-muted fs-7 mb-1">'+ datetime +'</span><span class="fs-5 fw-bolder text-gray-900 ms-1">'+ myName +'</a></div><div class="symbol symbol-35px symbol-circle"><!-- img --></div></div><div class="p-5 rounded bg-light-primary text-dark fw-bold mw-lg-400px text-start" data-kt-element="message-text">  <p><img width="200px" src="'+msg.file+'" /></p> </div></div></div>';

  appendMessage(message)

})



//Browse file
fileInput.addEventListener('change', function(e) {
    var file = fileInput.files[0];
   console.log("I am now sending to the server a file")// this.value
  readThenSendFile(file);
})


//make file initialization
function readThenSendFile(data){

    var reader = new FileReader();
    reader.onload = function(evt){
        var msg ={};
        msg.username = myName;
        msg.file = evt.target.result;
        msg.room = roomNumber;
        socket.emit('file-sent-to-server', msg);
    };
    reader.readAsDataURL(data);
}

//attache the message to chat 
function appendMessage(message) {
    const messageElement = document.createElement('div')
    messageElement.innerHTML = message
    messageContainer.append(messageElement)
  }

//mute buuton 
  function enableMute() { 

    var currentvalue = document.getElementById('mute').value;
    console.log(currentvalue)
    if(currentvalue == "Off"){
      document.getElementById("mute").value="On";
      document.getElementById("localVideo").muted = true;
    }else{
      document.getElementById("mute").value="Off";
      document.getElementById("localVideo").muted = false;
    }

} 

//cammera button
function camera() { 

    var currentvalue = document.getElementById('camera').value;
    //console.log(currentvalue)
    if(currentvalue == "Off"){
      document.getElementById("camera").value="On";
      document.getElementById("localVideo").pause = true;
    }else{
      document.getElementById("camera").value="Off";
      document.getElementById("localVideo").play = false;
    }

} 
// handler functions
function onIceCandidate(event) {
    if (event.candidate) {
        console.log('sending ice candidate');
        socket.emit('candidate', {
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
            room: roomNumber
        })
    }
}

function onAddStream(event) {
    remoteVideo.srcObject = event.streams[0];
    remoteStream = event.stream;
}
