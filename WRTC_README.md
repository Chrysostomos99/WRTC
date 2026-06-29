# Web Conferencing Application (WebRTC)

A real-time **video conferencing** web application built with **WebRTC**, allowing
multiple participants to join named rooms and communicate through audio, video, chat
and file sharing. Developed for the *Media* course.

## Features

- **Peer-to-peer audio & video** using WebRTC (`RTCPeerConnection`, STUN servers, offer/answer/ICE exchange).
- **Room system** — users join a room by entering a room number and a username; rooms support multiple participants.
- **Live participants list** that updates automatically when someone joins or leaves.
- **Real-time text chat** between participants in the same room.
- **File sharing** through the chat.
- In-call controls: **mute microphone**, **toggle camera**, and **hang up**.

## Architecture

- **Frontend** — HTML/CSS and vanilla JavaScript handle the UI, media capture and the
  WebRTC peer connections.
- **Signaling server** — a **Node.js + Express + Socket.IO** server coordinates the
  connection setup between peers (exchanging offers, answers and ICE candidates) and
  relays room events, chat messages and shared files.

```
Browser (WebRTC peer) <--- Socket.IO signaling ---> Node.js server <---> Browser (WebRTC peer)
```

## Project structure

```
server.js              Node.js + Express + Socket.IO signaling server
public/
  index.html           App UI
  client.js            Client logic: WebRTC, rooms, chat, file sharing
  assets/style.css     Styles
package.json           Dependencies and start script
```

## How to run

Requirements: Node.js.

```bash
npm install
npm start
```

Then open `http://localhost:3000` in two or more browser tabs/devices, enter the same
room number with different usernames, and start the call.

> Real-time audio/video capture requires camera and microphone permissions, and a
> secure context (localhost or HTTPS) in modern browsers.

## Tech stack

- JavaScript, WebRTC
- Node.js, Express, Socket.IO
- HTML / CSS

## Acknowledgements

Started from a WebRTC starter tutorial and extended with the room system, live
participants list, in-call chat and file sharing.
