const express = require("express")
const app = express()
const http = require('http')
const {Server} = require('socket.io')
const cors = require('cors')
const { Socket } = require("dgram")

app.use(cors())

let guessList = []
let player = []
    // <==================
    // LASTING DOING WAS TRYING TO SEND PLAYERINFO
    // TO THE CLIENT AND BACK TO SERVER!!!!!!!!!!
    // <==================

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket)=>{
  // console.log(socket.id)
  socket.on("join_room", (data)=>{
    console.log(data, 'joined')
    const room = data.room
    socket.join(io.sockets.clients(room))
    socket.to(room).emit('user joined')
  })
  socket.on("leave_room", (data)=>{
    console.log(data, 'leaving room')
  })
  socket.on('sendGuess', (data)=>{
    const playerName = data.playerName
    const playerRecentGuess = data.playerGuess[data.playerGuess.length - 1]
    guessList.push({
      playerName: playerName,
      playerRecentGuess: playerRecentGuess
    })
    console.log(guessList)
  })
})


const PORT = process.env.PORT || 5000
server.listen(PORT, ()=>{
  console.log(`Server is RUNNING in PORT: ${PORT}`)
})


