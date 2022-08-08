const express = require("express")
const app = express()
const http = require('http')
const {Server} = require('socket.io')
const cors = require('cors')
const { Socket } = require("dgram")
const { join } = require("path")

app.use(cors())

// let guessList = []
let rooms = [
  {
    RoomId: 'testRoomId',
    playerList: [{
      room: 'testRoomId',
      playerName: 'TestPlayer',
      playerIcon: ['- -', ' O ', 'red'],
      playerPoints: 0,
      isHost: false
    }]
  }
  ]
// },
// {
//   RoomId: 'testRoomIdTwo',
//   playerList: [{
//     room: 'testRoomIdTwo',
//     playerName: 'TestPlayerTwo',
//     playerIcon: ['- -', ' O ', 'red'],
//     playerPoints: 0,
//     isHost: false
//   }]
// },
// {
//   RoomId: 'testRoomIdThree',
//   playerList: [{
//     room: 'testRoomIdThree',
//     playerName: 'TestPlayerThree',
//     playerIcon: ['- -', ' O ', 'red'],
//     playerPoints: 0,
//     isHost: false
//   }]
// }
const getCurrentRoom = (playerInfo, allRooms) => {
  let roomId = playerInfo.room
  let playersRoom = allRooms.find(x=>x.RoomId == roomId) || false
  return playersRoom
}
const checkIfRoomIsAvailable = (roomId, allRooms) => {
  let playersRoom = allRooms.find(x=>x.RoomId == roomId) == undefined ? true : false
  return playersRoom
}
const createRoom = (roomId, playerInfo, allRooms) =>{
  let newRoom = {
    RoomId: roomId,
    playerList: [playerInfo]
  }
  return allRooms.push(newRoom)
}
const deleteRoom = (playerInfo, allRooms) => {
  let roomId = playerInfo.room
  let room = getCurrentRoom(playerInfo, allRooms)
  if(!room) return console.log(`Cannot delete room does not exist - Roomid: ${roomId}`)
  let upDatedRooms = allRooms.filter(room=>room.RoomId !== roomId)
  return rooms = upDatedRooms
}
const addPlayerToARoom = (playerInfo, allRooms) => {
  let roomId = playerInfo.room
  let room = getCurrentRoom(playerInfo, allRooms)
  if(!room) return console.log(`Cannot addPlayer room does not exist - Roomid: ${roomId}`)
  return room['playerList'].push(playerInfo)
  // console.log(rooms)
}
const removePlayerFromRoom = (playerInfo, allRooms) => {
  // console.log(rooms, 'removedPlayer')
  let roomId = playerInfo.room
  let room = getCurrentRoom(playerInfo, allRooms)
  if(!room) return console.log(`Cannot removePlayer room does not exist - Roomid: ${roomId}`)
  room['playerList'] = room['playerList'].filter(room=>room.playerName !== playerInfo.playerName)
  if(!room['playerList'].length) return deleteRoom(playerInfo, rooms)
}
// addPlayerToARoom({
//   room: 'testRoomIdTwo',
//   playerName: "jambo",
//   playerIcon: ['- -', ' O ', 'red'],
//   playerPoints: 0,
//   isHost: true
// }, rooms)
// removePlayerFromRoom({
//   room: 'testRoomIdTwo',
//   playerName: "TestPlayerTwo",
//   playerIcon: ['- -', ' O ', 'red'],
//   playerPoints: 0,
//   isHost: false
// }, rooms)


const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket)=>{

  socket.on('checkIfRoomIsAvailable', (roomId, isAvailable)=>{
    let isRoomAvailable = checkIfRoomIsAvailable(roomId, rooms)
    isAvailable(isRoomAvailable)
  })

  socket.on('joinRoom', (playerInfo)=>{
    console.log(playerInfo)
    let room = playerInfo.room
    if(playerInfo.isHost){
      socket.join(room)
      createRoom(room, playerInfo, rooms)
      io.to(room).emit('upDateChatBox', ['joined', playerInfo])
    }else{
      socket.join(room)
      let roomInfo = getCurrentRoom(playerInfo, rooms)
      addPlayerToARoom(playerInfo, rooms)
      io.to(room).emit('upDatePlayerList', playerInfo, roomInfo)
      io.to(room).emit('upDateChatBox', ['joined', playerInfo])
    }
  })

  socket.on('leaveRoom', (playerInfo)=>{
    let room = playerInfo.room
    if(playerInfo.isHost){
      removePlayerFromRoom(playerInfo, rooms)
      io.to(room).emit('gotBackHome')
      socket.leave(room)
    }else{
      removePlayerFromRoom(playerInfo, rooms)
      let roomInfo = getCurrentRoom(playerInfo, rooms)
      io.to(room).emit('upDatePlayerList', playerInfo, roomInfo)
      io.to(room).emit('upDateChatBox', ['left', playerInfo])
      socket.leave(room)
    }
    console.log(rooms)
  })
  socket.on('sendGuess', (msg, playerInfo)=>{
    let room = playerInfo.room
    io.to(room).emit('upDateChatBox', ['msg', playerInfo, msg])
  })

  socket.on('startGame', (playerInfo, playerList)=>{
    let room = playerInfo.room
    let playerListLength = playerList.length
    let drawerIndex = Math.floor(Math.random() * playerListLength) + 0
    console.log(drawerIndex)
    if(drawerIndex > 5 || drawerIndex < 0) return
    let roomInfo = getCurrentRoom(playerInfo, rooms).playerList
    roomInfo[drawerIndex].isDrawing = true
    io.to(room).emit('gameStartDrawer', roomInfo)
    // console.log(roomInfo[drawerIndex], 'roomInfo')
  })
  // io.to(room).emit('upDateChatBox', ['left', playerInfo])
  
  






  
})



const PORT = process.env.PORT || 5000
server.listen(PORT, ()=>{
  console.log(`Server is RUNNING in PORT: ${PORT}`)
})


